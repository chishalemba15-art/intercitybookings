import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotionGiveaways, giveawayEntries, giveawayWinners } from '@/db/schema';
import { and, gte, lte, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'active', 'upcoming', 'drawn', 'completed'

    const now = new Date();

    const whereConditions = [
      eq(promotionGiveaways.isActive, true),
      gte(promotionGiveaways.endDate, now),
      lte(promotionGiveaways.startDate, now),
    ];

    if (status) {
      whereConditions.push(eq(promotionGiveaways.status, status));
    }

    const giveaways = await db
      .select()
      .from(promotionGiveaways)
      .where(and(...whereConditions))
      .orderBy(promotionGiveaways.createdAt)
      .limit(limit);

    // Transform results to include entry count
    const result = await Promise.all(
      giveaways.map(async (giveaway) => {
        const entries = await db
          .select()
          .from(giveawayEntries)
          .where(eq(giveawayEntries.giveawayId, giveaway.id));

        return {
          id: giveaway.id,
          title: giveaway.title,
          description: giveaway.description,
          prizeType: giveaway.prizeType,
          prizeDetails: giveaway.prizeDetails,
          prizeValue: giveaway.prizeValue ? parseFloat(giveaway.prizeValue as any) : null,
          drawDate: giveaway.drawDate,
          drawTime: giveaway.drawTime,
          startDate: giveaway.startDate,
          endDate: giveaway.endDate,
          status: giveaway.status,
          winnersCount: giveaway.winnersCount,
          totalEntries: entries.length,
          daysRemaining: Math.ceil(
            (giveaway.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching giveaways:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch giveaways',
      },
      { status: 500 }
    );
  }
}

// Enter a giveaway
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giveawayId, userPhone, bookingId } = body;

    if (!giveawayId || !userPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: giveawayId, userPhone',
        },
        { status: 400 }
      );
    }

    // Check if user already has an entry for this giveaway
    const existingEntry = await db
      .select()
      .from(giveawayEntries)
      .where(
        and(
          eq(giveawayEntries.giveawayId, giveawayId),
          eq(giveawayEntries.userPhone, userPhone)
        )
      )
      .limit(1);

    if (existingEntry.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already entered this giveaway',
        },
        { status: 400 }
      );
    }

    // Create entry
    const entry = await db
      .insert(giveawayEntries)
      .values({
        giveawayId,
        userPhone,
        bookingId: bookingId || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        entryId: entry[0].id,
        message: 'Successfully entered the giveaway!',
      },
    });
  } catch (error) {
    console.error('Error entering giveaway:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enter giveaway',
      },
      { status: 500 }
    );
  }
}
