import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { routes, searchAnalytics, buses } from '@/db/schema';
import { like, sql, eq } from 'drizzle-orm';
import { findSimilarItems, isMLAvailable } from '@/lib/ml/semantic-search';

// Define suggestion type
type Suggestion = {
  name: string;
  from: string;
  searchCount: number;
  cheapestPrice: number | null;
  matchType: 'exact' | 'semantic';
  relevanceScore?: number;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const useML = searchParams.get('ml') !== 'false'; // ML enabled by default

    let destinations: any[] = [];

    // Try to get destinations from database
    try {
      destinations = await db
        .selectDistinct({
          destination: routes.toCity,
          fromCity: routes.fromCity,
          searchCount: sql<number>`COALESCE(COUNT(${searchAnalytics.destination}), 0)`,
          cheapestPrice: sql<string>`MIN(${buses.price}::text)`,
        })
        .from(routes)
        .leftJoin(searchAnalytics, (qb) =>
          eq(routes.toCity, searchAnalytics.destination)
        )
        .leftJoin(buses, (qb) => eq(routes.id, buses.routeId))
        .where(
          query
            ? like(routes.toCity, `%${query}%`)
            : undefined
        )
        .groupBy(routes.toCity, routes.fromCity)
        .orderBy(sql`COUNT(${searchAnalytics.destination}) DESC`)
        .limit(10);
    } catch (dbError: any) {
      console.error('Database connection error:', dbError.message);

      // Return mock data for common Zambian destinations if database is unavailable
      const mockDestinations = [
        { destination: 'Lusaka', fromCity: 'Ndola', searchCount: 50, cheapestPrice: '150' },
        { destination: 'Kitwe', fromCity: 'Lusaka', searchCount: 45, cheapestPrice: '180' },
        { destination: 'Ndola', fromCity: 'Lusaka', searchCount: 42, cheapestPrice: '150' },
        { destination: 'Livingstone', fromCity: 'Lusaka', searchCount: 38, cheapestPrice: '250' },
        { destination: 'Kabwe', fromCity: 'Lusaka', searchCount: 30, cheapestPrice: '80' },
        { destination: 'Chipata', fromCity: 'Lusaka', searchCount: 25, cheapestPrice: '200' },
        { destination: 'Solwezi', fromCity: 'Kitwe', searchCount: 20, cheapestPrice: '120' },
        { destination: 'Mongu', fromCity: 'Lusaka', searchCount: 18, cheapestPrice: '220' },
      ];

      // Filter mock data based on query
      if (query) {
        destinations = mockDestinations.filter(d =>
          d.destination.toLowerCase().includes(query.toLowerCase())
        );
      } else {
        destinations = mockDestinations.slice(0, 5);
      }
    }

    // Transform results
    let suggestions: Suggestion[] = destinations.map((item) => ({
      name: item.destination,
      from: item.fromCity,
      searchCount: parseInt(item.searchCount as any) || 0,
      cheapestPrice: item.cheapestPrice ? parseFloat(item.cheapestPrice) : null,
      matchType: 'exact' as const,
    }));

    // If we have few results and ML is enabled, use semantic search to find more
    if (suggestions.length < 5 && query.length > 2 && useML && isMLAvailable()) {
      try {
        let allDestinations: any[] = [];

        // Try to get all destinations for semantic search
        try {
          allDestinations = await db
            .selectDistinct({
              destination: routes.toCity,
              fromCity: routes.fromCity,
              searchCount: sql<number>`COALESCE(COUNT(${searchAnalytics.destination}), 0)`,
              cheapestPrice: sql<string>`MIN(${buses.price}::text)`,
            })
            .from(routes)
            .leftJoin(searchAnalytics, eq(routes.toCity, searchAnalytics.destination))
            .leftJoin(buses, eq(routes.id, buses.routeId))
            .groupBy(routes.toCity, routes.fromCity)
            .orderBy(sql`COUNT(${searchAnalytics.destination}) DESC`);
        } catch (dbError) {
          console.error('Database error in ML semantic search:', dbError);
          // Use mock destinations if database is unavailable
          allDestinations = [
            { destination: 'Lusaka', fromCity: 'Ndola', searchCount: 50, cheapestPrice: '150' },
            { destination: 'Kitwe', fromCity: 'Lusaka', searchCount: 45, cheapestPrice: '180' },
            { destination: 'Ndola', fromCity: 'Lusaka', searchCount: 42, cheapestPrice: '150' },
            { destination: 'Livingstone', fromCity: 'Lusaka', searchCount: 38, cheapestPrice: '250' },
            { destination: 'Kabwe', fromCity: 'Lusaka', searchCount: 30, cheapestPrice: '80' },
            { destination: 'Chipata', fromCity: 'Lusaka', searchCount: 25, cheapestPrice: '200' },
            { destination: 'Solwezi', fromCity: 'Kitwe', searchCount: 20, cheapestPrice: '120' },
            { destination: 'Mongu', fromCity: 'Lusaka', searchCount: 18, cheapestPrice: '220' },
          ];
        }

        // Find semantically similar destinations
        const semanticResults = await findSimilarItems(
          query,
          allDestinations,
          (item) => `${item.destination} from ${item.fromCity}`,
          { topK: 10 - suggestions.length, minSimilarity: 0.4 }
        );

        // Add semantic results that aren't already in suggestions
        const existingNames = new Set(suggestions.map((s) => s.name));
        const additionalSuggestions = semanticResults
          .filter((item) => !existingNames.has(item.destination))
          .map((item) => ({
            name: item.destination,
            from: item.fromCity,
            searchCount: parseInt(item.searchCount as any) || 0,
            cheapestPrice: item.cheapestPrice ? parseFloat(item.cheapestPrice) : null,
            matchType: 'semantic' as const,
            relevanceScore: Math.round(item.similarity * 100) / 100,
          }));

        suggestions = [...suggestions, ...additionalSuggestions];
      } catch (mlError) {
        console.error('ML enhancement failed, using exact matches only:', mlError);
        // Continue with exact matches if ML fails
      }
    }

    return NextResponse.json({
      success: true,
      data: suggestions,
      mlEnabled: useML && isMLAvailable(),
      resultCount: suggestions.length,
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
