import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, promotionGiveaways, giveawayEntries, giveawayWinners } from '@/db/schema';
import { and, gte, lte, eq, isNotNull } from 'drizzle-orm';

/**
 * Agent Dashboard API
 * Provides ticket requests and giveaway data with interaction windows
 *
 * Query Parameters:
 * - agentPhone: phone number of the agent
 * - timeWindow: hours (default: 24) - only show data from last N hours
 * - includeGiveaways: boolean (default: true)
 * - includeTicketRequests: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agentPhone = searchParams.get('agentPhone');
    const timeWindow = parseInt(searchParams.get('timeWindow') || '24'); // hours
    const includeGiveaways = searchParams.get('includeGiveaways') !== 'false';
    const includeTicketRequests = searchParams.get('includeTicketRequests') !== 'false';

    if (!agentPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: agentPhone',
        },
        { status: 400 }
      );
    }

    const now = new Date();
    const timeWindowMs = timeWindow * 60 * 60 * 1000;
    const startOfWindow = new Date(now.getTime() - timeWindowMs);

    const data = {
      agentPhone,
      timeWindow,
      generatedAt: now,
      ticketRequests: [] as any[],
      activeGiveaways: [] as any[],
      stats: {
        totalTicketsInWindow: 0,
        totalGiveawayEntries: 0,
        pendingInteractions: 0,
      },
    };

    // Get ticket requests/bookings from the time window
    if (includeTicketRequests) {
      const ticketRequests = await db
        .select()
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, startOfWindow),
            lte(bookings.createdAt, now)
          )
        )
        .orderBy(bookings.createdAt)
        .limit(100);

      data.ticketRequests = ticketRequests
        .filter((booking) => booking.createdAt !== null)
        .map((booking) => {
          const bookingCreatedAt = booking.createdAt || new Date();
          return {
            id: booking.id,
            bookingRef: booking.bookingRef,
            passengerName: booking.passengerName,
            passengerPhone: booking.passengerPhone,
            status: booking.status,
            totalAmount: booking.totalAmount ? parseFloat(booking.totalAmount as any) : 0,
            travelDate: booking.travelDate,
            createdAt: bookingCreatedAt,
            hoursAgo: Math.round((now.getTime() - bookingCreatedAt.getTime()) / (1000 * 60 * 60)),
            interactionWindow: {
              open: true,
              expiresAt: new Date(bookingCreatedAt.getTime() + 72 * 60 * 60 * 1000), // 72 hours to interact
              hoursRemaining: Math.round(
                (new Date(bookingCreatedAt.getTime() + 72 * 60 * 60 * 1000).getTime() - now.getTime()) /
                  (1000 * 60 * 60)
              ),
            },
          };
        });

      data.stats.totalTicketsInWindow = data.ticketRequests.length;
    }

    // Get active giveaways and their entries
    if (includeGiveaways) {
      const activeGiveaways = await db
        .select()
        .from(promotionGiveaways)
        .where(
          and(
            eq(promotionGiveaways.isActive, true),
            gte(promotionGiveaways.endDate, now),
            lte(promotionGiveaways.startDate, now)
          )
        )
        .orderBy(promotionGiveaways.createdAt)
        .limit(20);

      const giveawayData = await Promise.all(
        activeGiveaways.map(async (giveaway) => {
          // Get all entries for this giveaway
          const entries = await db
            .select()
            .from(giveawayEntries)
            .where(eq(giveawayEntries.giveawayId, giveaway.id));

          // Get winners for this giveaway
          const winners = await db
            .select()
            .from(giveawayWinners)
            .where(eq(giveawayWinners.giveawayId, giveaway.id));

          const unclaimed = winners.filter((w) => !w.claimed);

          return {
            id: giveaway.id,
            title: giveaway.title,
            description: giveaway.description,
            prizeType: giveaway.prizeType,
            prizeValue: giveaway.prizeValue ? parseFloat(giveaway.prizeValue as any) : null,
            drawDate: giveaway.drawDate,
            status: giveaway.status,
            totalEntries: entries.length,
            totalWinners: winners.length,
            unclaimedPrizes: unclaimed.length,
            interactionWindow: {
              open: true,
              closeDate: giveaway.endDate,
              hoursRemaining: Math.round(
                (giveaway.endDate.getTime() - now.getTime()) / (1000 * 60 * 60)
              ),
              drawsIn: Math.round(
                (giveaway.drawDate.getTime() - now.getTime()) / (1000 * 60 * 60)
              ),
            },
            recentEntries: entries
              .sort((a, b) => (b.entryDate?.getTime() || 0) - (a.entryDate?.getTime() || 0))
              .slice(0, 5)
              .map((entry) => ({
                id: entry.id,
                userPhone: entry.userPhone,
                entryDate: entry.entryDate,
                winner: entry.winner,
                claimed: entry.claimed,
              })),
          };
        })
      );

      data.activeGiveaways = giveawayData;
      data.stats.totalGiveawayEntries = giveawayData.reduce(
        (sum, g) => sum + g.totalEntries,
        0
      );
      data.stats.pendingInteractions = data.ticketRequests.filter(
        (t) => t.interactionWindow.hoursRemaining > 0
      ).length;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching agent dashboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent dashboard data',
      },
      { status: 500 }
    );
  }
}

/**
 * Agent can mark prize as claimed or perform other interactions
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, winnerId, ticketId, agentPhone } = body;

    if (!agentPhone || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: agentPhone, action',
        },
        { status: 400 }
      );
    }

    if (action === 'claim_prize' && winnerId) {
      // Mark a giveaway prize as claimed
      const winner = await db
        .select()
        .from(giveawayWinners)
        .where(eq(giveawayWinners.id, winnerId))
        .limit(1);

      if (!winner.length) {
        return NextResponse.json(
          {
            success: false,
            error: 'Winner not found',
          },
          { status: 404 }
        );
      }

      await db
        .update(giveawayWinners)
        .set({
          claimed: true,
          claimedDate: new Date(),
        })
        .where(eq(giveawayWinners.id, winnerId));

      return NextResponse.json({
        success: true,
        message: 'Prize marked as claimed',
      });
    }

    if (action === 'interact_ticket' && ticketId) {
      // Log agent interaction with a ticket request
      // You can add logging here if needed
      return NextResponse.json({
        success: true,
        message: 'Ticket interaction recorded',
        interactionData: {
          agentPhone,
          ticketId,
          timestamp: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unknown action',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating agent interaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process agent interaction',
      },
      { status: 500 }
    );
  }
}
