import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, buses, operators, routes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userPhone = searchParams.get('phone');
    const status = searchParams.get('status'); // pending, confirmed, cancelled, completed

    if (!userPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'User phone is required',
        },
        { status: 400 }
      );
    }

    let query = db
      .select({
        id: bookings.id,
        bookingRef: bookings.bookingRef,
        passengerName: bookings.passengerName,
        passengerPhone: bookings.passengerPhone,
        passengerEmail: bookings.passengerEmail,
        seatNumber: bookings.seatNumber,
        travelDate: bookings.travelDate,
        status: bookings.status,
        totalAmount: bookings.totalAmount,
        createdAt: bookings.createdAt,
        operator: operators.name,
        operatorColor: operators.color,
        from: routes.fromCity,
        to: routes.toCity,
        departureTime: buses.departureTime,
        arrivalTime: buses.arrivalTime,
        busType: buses.type,
      })
      .from(bookings)
      .innerJoin(buses, eq(bookings.busId, buses.id))
      .innerJoin(operators, eq(buses.operatorId, operators.id))
      .innerJoin(routes, eq(buses.routeId, routes.id))
      .where(eq(bookings.passengerPhone, userPhone))
      .$dynamic();

    // Apply status filter if provided
    if (status && ['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      query = query.where(eq(bookings.status, status as any));
    }

    const userBookings = await query.orderBy(desc(bookings.createdAt));

    // Calculate summary statistics
    const totalBookings = userBookings.length;
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed').length;
    const upcomingBookings = userBookings.filter(
      b => b.status === 'confirmed' && new Date(b.travelDate) > new Date()
    ).length;
    const completedBookings = userBookings.filter(b => b.status === 'completed').length;

    return NextResponse.json({
      success: true,
      data: userBookings,
      summary: {
        totalBookings,
        confirmedBookings,
        upcomingBookings,
        completedBookings,
      },
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user bookings',
      },
      { status: 500 }
    );
  }
}
