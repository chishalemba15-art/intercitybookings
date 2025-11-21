import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, buses, operators, routes } from '@/db/schema';
import { eq, desc, gte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minutes = parseInt(searchParams.get('minutes') || '5');

    // Get bookings from the last X minutes
    const timeAgo = new Date(Date.now() - minutes * 60 * 1000);

    const recentBookings = await db
      .select({
        id: bookings.id,
        bookingRef: bookings.bookingRef,
        passengerName: bookings.passengerName,
        seatNumber: bookings.seatNumber,
        travelDate: bookings.travelDate,
        createdAt: bookings.createdAt,
        operator: operators.name,
        from: routes.fromCity,
        to: routes.toCity,
        departureTime: buses.departureTime,
      })
      .from(bookings)
      .innerJoin(buses, eq(bookings.busId, buses.id))
      .innerJoin(operators, eq(buses.operatorId, operators.id))
      .innerJoin(routes, eq(buses.routeId, routes.id))
      .where(
        and(
          gte(bookings.createdAt, timeAgo),
          eq(bookings.status, 'confirmed')
        )
      )
      .orderBy(desc(bookings.createdAt))
      .limit(20);

    // Format the bookings for display
    const formattedBookings = recentBookings.map(booking => {
      // Anonymize passenger name (show only first name and last initial)
      const nameParts = booking.passengerName.split(' ');
      const firstName = nameParts[0];
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0] + '.' : '';
      const anonymizedName = `${firstName} ${lastInitial}`;

      return {
        id: booking.id,
        bookingRef: booking.bookingRef,
        passengerName: anonymizedName,
        seatNumber: booking.seatNumber,
        operator: booking.operator,
        route: `${booking.from} → ${booking.to}`,
        departureTime: booking.departureTime,
        travelDate: booking.travelDate,
        createdAt: booking.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedBookings,
      count: formattedBookings.length,
    });
  } catch (error) {
    console.error('Failed to fetch recent bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent bookings',
      },
      { status: 500 }
    );
  }
}
