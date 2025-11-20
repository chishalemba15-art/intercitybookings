import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { feedback } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, rating, bookingId } = body;

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Message is required',
        },
        { status: 400 }
      );
    }

    // Create feedback
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        bookingId: bookingId || null,
        name,
        email,
        phone,
        message,
        rating,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newFeedback,
      message: 'Thank you for your feedback!',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit feedback',
      },
      { status: 500 }
    );
  }
}
