import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userLocations } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination and filtering
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'createdAt';
    const city = request.nextUrl.searchParams.get('city');

    let query = db.select().from(userLocations);

    // Apply city filter if provided
    if (city) {
      // This would need the 'ilike' operator for case-insensitive search
      // For now, we'll fetch all and filter in application
    }

    // Fetch user locations sorted by creation date (newest first)
    const locations = await query
      .orderBy(desc(userLocations.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count - fetch all and count (for simplicity with Drizzle)
    const allLocations = await db
      .select()
      .from(userLocations);

    const total = allLocations.length;

    // Apply city filter if needed
    let filteredLocations = locations;
    if (city) {
      filteredLocations = locations.filter(loc =>
        loc.city?.toLowerCase().includes(city.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredLocations,
      pagination: {
        limit,
        offset,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: Math.floor(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching user locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user locations' },
      { status: 500 }
    );
  }
}

