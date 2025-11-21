import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { routes, searchAnalytics, buses, operators } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get trending routes based on searches in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trendingData = await db
      .select({
        fromCity: routes.fromCity,
        toCity: routes.toCity,
        searchCount: sql<number>`COUNT(${searchAnalytics.id})`,
        cheapestPrice: sql<string>`MIN(${buses.price}::text)`,
        operatorCount: sql<number>`COUNT(DISTINCT ${buses.operatorId})`,
      })
      .from(routes)
      .leftJoin(
        searchAnalytics,
        sql`${routes.toCity} = ${searchAnalytics.destination} AND ${searchAnalytics.createdAt} >= ${sevenDaysAgo}`
      )
      .leftJoin(buses, eq(routes.id, buses.routeId))
      .where(sql`${routes.isActive} = true`)
      .groupBy(routes.id, routes.fromCity, routes.toCity)
      .orderBy(sql`COUNT(${searchAnalytics.id}) DESC`)
      .limit(6);

    // Transform results
    const trending = trendingData.map((item) => ({
      from: item.fromCity,
      to: item.toCity,
      route: `${item.fromCity} → ${item.toCity}`,
      searchCount: parseInt(item.searchCount as any) || 0,
      cheapestPrice: item.cheapestPrice ? parseFloat(item.cheapestPrice) : null,
      operatorCount: parseInt(item.operatorCount as any) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: trending,
    });
  } catch (error) {
    console.error('Error fetching trending routes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending routes',
      },
      { status: 500 }
    );
  }
}
