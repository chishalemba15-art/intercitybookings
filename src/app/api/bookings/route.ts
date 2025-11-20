import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, payments, buses } from '@/db/schema';
import { eq } from 'drizzle-orm';

function generateBookingRef(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `ZM${timestamp}${random}`.toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      busId,
      passengerName,
      passengerPhone,
      passengerEmail,
      seatNumber,
      travelDate,
      paymentMethod,
      totalAmount,
    } = body;

    // Validate required fields
    if (
      !busId ||
      !passengerName ||
      !passengerPhone ||
      !seatNumber ||
      !travelDate ||
      !paymentMethod ||
      !totalAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if bus exists and has available seats
    const bus = await db.query.buses.findFirst({
      where: eq(buses.id, busId),
    });

    if (!bus) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bus not found',
        },
        { status: 404 }
      );
    }

    if (bus.availableSeats <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No available seats',
        },
        { status: 400 }
      );
    }

    // Generate booking reference
    const bookingRef = generateBookingRef();

    // Create booking
    const [booking] = await db
      .insert(bookings)
      .values({
        busId,
        bookingRef,
        passengerName,
        passengerPhone,
        passengerEmail,
        seatNumber,
        travelDate: new Date(travelDate),
        status: 'pending',
        totalAmount,
      })
      .returning();

    // Create payment record
    const [payment] = await db
      .insert(payments)
      .values({
        bookingId: booking.id,
        amount: totalAmount,
        paymentMethod:
          paymentMethod === 'airtel' ? 'airtel_money' : 'mtn_momo',
        paymentStatus: 'pending',
        phoneNumber: passengerPhone,
      })
      .returning();

    // Update available seats
    await db
      .update(buses)
      .set({
        availableSeats: bus.availableSeats - 1,
      })
      .where(eq(buses.id, busId));

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: booking.id,
          bookingRef: booking.bookingRef,
          status: booking.status,
        },
        payment: {
          id: payment.id,
          status: payment.paymentStatus,
        },
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookingRef = searchParams.get('ref');

    if (!bookingRef) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking reference is required',
        },
        { status: 400 }
      );
    }

    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.bookingRef, bookingRef),
      with: {
        bus: {
          with: {
            operator: true,
            route: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: 'Booking not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch booking',
      },
      { status: 500 }
    );
  }
}
