import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userLocations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userPhone = request.nextUrl.searchParams.get('userPhone');

    if (!userPhone) {
      return NextResponse.json(
        { success: false, error: 'User phone is required' },
        { status: 400 }
      );
    }

    const locations = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userPhone, userPhone));

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error) {
    console.error('Error fetching user locations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPhone, userName, city, latitude, longitude, address, locationType = 'residence' } = body;

    if (!userPhone || !city) {
      return NextResponse.json(
        { success: false, error: 'User phone and city are required' },
        { status: 400 }
      );
    }

    // Check if user location already exists
    const existingLocation = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userPhone, userPhone));

    if (existingLocation.length > 0) {
      // Update existing location
      const updated = await db
        .update(userLocations)
        .set({
          city,
          latitude: latitude ? latitude : undefined,
          longitude: longitude ? longitude : undefined,
          address,
          locationType,
          lastAccessedAt: new Date(),
          accessCount: (existingLocation[0]?.accessCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(userLocations.userPhone, userPhone))
        .returning();

      return NextResponse.json({
        success: true,
        data: updated[0],
        message: 'Location updated successfully',
      });
    } else {
      // Create new location
      const result = await db
        .insert(userLocations)
        .values({
          userPhone,
          userName,
          city,
          latitude: latitude ? latitude : undefined,
          longitude: longitude ? longitude : undefined,
          address,
          locationType,
          accessCount: 1,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: result[0],
        message: 'Location saved successfully',
      });
    }
  } catch (error) {
    console.error('Error saving user location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save user location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const locationId = request.nextUrl.searchParams.get('id');

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required' },
        { status: 400 }
      );
    }

    const result = await db
      .delete(userLocations)
      .where(eq(userLocations.id, parseInt(locationId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Location deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user location:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user location' },
      { status: 500 }
    );
  }
}
