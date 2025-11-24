import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { db } from '@/db';
import { routes, searchAnalytics, buses } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Cache for destination embeddings (in-memory for now, use Redis in production)
const embeddingsCache = new Map<string, number[]>();

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Get text embedding using Hugging Face
 */
async function getEmbedding(text: string): Promise<number[] | null> {
  try {
    // Check cache first
    if (embeddingsCache.has(text)) {
      return embeddingsCache.get(text)!;
    }

    // Use a lightweight, fast model for embeddings
    // sentence-transformers/all-MiniLM-L6-v2 is small (80MB) and fast
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });

    // The response can be number | number[] | number[][]
    // We need a flat number[] for our embedding
    let embedding: number[] | null = null;

    if (Array.isArray(response)) {
      // If it's already a number[], use it directly
      if (typeof response[0] === 'number') {
        embedding = response as number[];
      }
      // If it's number[][], flatten it
      else if (Array.isArray(response[0])) {
        embedding = (response as number[][]).flat();
      }
    }

    if (embedding && embedding.length > 0) {
      // Cache the embedding (limit cache size to prevent memory issues)
      if (embeddingsCache.size < 1000) {
        embeddingsCache.set(text, embedding);
      }
    }

    return embedding;
  } catch (error) {
    console.error('Error getting embedding from HF:', error);
    return null;
  }
}

/**
 * Smart search suggestions using semantic similarity
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        method: 'empty_query',
      });
    }

    // Get all available destinations with their stats
    const destinations = await db
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

    if (destinations.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        method: 'no_destinations',
      });
    }

    // Get query embedding
    const queryEmbedding = await getEmbedding(query.toLowerCase());

    if (!queryEmbedding) {
      // Fallback to simple string matching if ML fails
      console.log('ML failed, falling back to string matching');
      const simpleMatches = destinations
        .filter((d) =>
          d.destination.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map((item) => ({
          name: item.destination,
          from: item.fromCity,
          searchCount: parseInt(item.searchCount as any) || 0,
          cheapestPrice: item.cheapestPrice ? parseFloat(item.cheapestPrice) : null,
          relevanceScore: 1.0, // Simple match score
          matchType: 'string_match' as const,
        }));

      return NextResponse.json({
        success: true,
        data: simpleMatches,
        method: 'fallback_string_match',
      });
    }

    // Calculate semantic similarity for each destination
    const scoredDestinations = await Promise.all(
      destinations.map(async (dest) => {
        // Create a richer context for embedding
        const destContext = `${dest.destination} from ${dest.fromCity}`;
        const destEmbedding = await getEmbedding(destContext.toLowerCase());

        if (!destEmbedding) {
          // Fallback to string matching score
          const stringMatch = dest.destination
            .toLowerCase()
            .includes(query.toLowerCase())
            ? 1.0
            : 0.0;
          return {
            destination: dest.destination,
            fromCity: dest.fromCity,
            searchCount: parseInt(dest.searchCount as any) || 0,
            cheapestPrice: dest.cheapestPrice ? parseFloat(dest.cheapestPrice) : null,
            similarity: stringMatch,
            matchType: 'string' as const,
          };
        }

        // Calculate semantic similarity
        const similarity = cosineSimilarity(queryEmbedding, destEmbedding);

        return {
          destination: dest.destination,
          fromCity: dest.fromCity,
          searchCount: parseInt(dest.searchCount as any) || 0,
          cheapestPrice: dest.cheapestPrice ? parseFloat(dest.cheapestPrice) : null,
          similarity,
          matchType: 'semantic' as const,
        };
      })
    );

    // Sort by similarity score (weighted with popularity)
    const rankedResults = scoredDestinations
      .map((item) => {
        // Boost score slightly if it's a popular route (search count > 5)
        const popularityBoost = item.searchCount > 5 ? 0.1 : 0;
        const finalScore = item.similarity + popularityBoost;

        return {
          ...item,
          finalScore,
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore)
      .filter((item) => item.similarity > 0.3) // Only show reasonably relevant results
      .slice(0, 10);

    // Format response to match existing API
    const suggestions = rankedResults.map((item) => ({
      name: item.destination,
      from: item.fromCity,
      searchCount: item.searchCount,
      cheapestPrice: item.cheapestPrice,
      relevanceScore: Math.round(item.similarity * 100) / 100,
      matchType: item.matchType,
    }));

    return NextResponse.json({
      success: true,
      data: suggestions,
      method: 'semantic_search',
      mlEnabled: true,
    });
  } catch (error) {
    console.error('Error in smart suggestions:', error);

    // Return error but don't break the app
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch smart suggestions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
