import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotions } from '@/db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const now = new Date();

    let query = db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          gte(promotions.endDate, now),
          lte(promotions.startDate, now)
        )
      );

    if (featured) {
      // Get top priority promotion for banner
      query = query.orderBy(promotions.priority).limit(1);
    } else {
      query = query.orderBy(promotions.priority).limit(limit);
    }

    const result = await query;

    // Transform results
    const transformedPromotions = result.map((promo) => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      discountPercent: promo.discountPercent ? parseFloat(promo.discountPercent as any) : null,
      discountAmount: promo.discountAmount ? parseFloat(promo.discountAmount as any) : null,
      code: promo.code,
      badge: promo.badge,
      imageUrl: promo.imageUrl,
      startDate: promo.startDate,
      endDate: promo.endDate,
    }));

    return NextResponse.json({
      success: true,
      data: transformedPromotions,
      count: transformedPromotions.length,
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch promotions',
      },
      { status: 500 }
    );
  }
}
