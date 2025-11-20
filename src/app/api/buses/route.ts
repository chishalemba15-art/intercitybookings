import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { buses, operators, routes } from '@/db/schema';
import { eq, and, like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    let query = db
      .select({
        id: buses.id,
        operator: operators.name,
        operatorColor: operators.color,
        from: routes.fromCity,
        to: routes.toCity,
        time: buses.departureTime,
        price: buses.price,
        type: buses.type,
        seats: buses.totalSeats,
        availableSeats: buses.availableSeats,
        rating: operators.rating,
        features: buses.features,
      })
      .from(buses)
      .innerJoin(operators, eq(buses.operatorId, operators.id))
      .innerJoin(routes, eq(buses.routeId, routes.id))
      .where(and(eq(buses.isActive, true), eq(operators.isActive, true)))
      .$dynamic();

    // Apply filters
    if (destination) {
      query = query.where(like(routes.toCity, `%${destination}%`));
    }

    if (type && (type === 'luxury' || type === 'standard')) {
      query = query.where(eq(buses.type, type));
    }

    const results = await query;

    // Transform features from JSON string to array
    const transformedResults = results.map((bus) => ({
      ...bus,
      features: bus.features ? JSON.parse(bus.features as string) : [],
      color: bus.operatorColor || 'bg-blue-600',
    }));

    return NextResponse.json({
      success: true,
      data: transformedResults,
      count: transformedResults.length,
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch buses',
      },
      { status: 500 }
    );
  }
}
