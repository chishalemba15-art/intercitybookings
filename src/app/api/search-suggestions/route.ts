import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { routes, searchAnalytics, buses } from '@/db/schema';
import { like, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    // Get unique destinations with search frequency and cheapest price
    const destinations = await db
      .selectDistinct({
        destination: routes.toCity,
        searchCount: sql<number>`COALESCE(COUNT(${searchAnalytics.destination}), 0)`,
        cheapestPrice: sql<string>`MIN(${buses.price}::text)`,
      })
      .from(routes)
      .leftJoin(searchAnalytics, (qb) =>
        qb.eq(routes.toCity, searchAnalytics.destination)
      )
      .leftJoin(buses, (qb) => qb.eq(routes.id, buses.routeId))
      .where(
        query
          ? like(routes.toCity, `%${query}%`)
          : undefined
      )
      .groupBy(routes.toCity)
      .orderBy(sql`COUNT(${searchAnalytics.destination}) DESC`)
      .limit(10);

    // Transform results
    const suggestions = destinations.map((item) => ({
      name: item.destination,
      searchCount: parseInt(item.searchCount as any) || 0,
      cheapestPrice: item.cheapestPrice ? parseFloat(item.cheapestPrice) : null,
    }));

    return NextResponse.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch search suggestions',
      },
      { status: 500 }
    );
  }
}
