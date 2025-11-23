import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      maxScrollDepth,
      timeOnPage,
      sectionsViewed,
      scrollEvents,
      timestamp,
    } = body;

    // Store analytics in database
    // For now, we'll use raw SQL to insert into a simple analytics table
    // You can create a proper schema table later if needed
    await db.execute(sql`
      INSERT INTO user_analytics (
        user_id,
        event_type,
        max_scroll_depth,
        time_on_page,
        sections_viewed,
        scroll_events,
        created_at
      ) VALUES (
        ${userId || 'anonymous'},
        'scroll',
        ${maxScrollDepth},
        ${timeOnPage},
        ${JSON.stringify(sectionsViewed)},
        ${scrollEvents},
        ${timestamp}
      )
      ON CONFLICT DO NOTHING
    `);

    return NextResponse.json({
      success: true,
      message: 'Analytics saved',
    });
  } catch (error) {
    console.error('Error saving scroll analytics:', error);

    // Don't fail the request if analytics fails
    return NextResponse.json({
      success: true,
      message: 'Analytics logging failed, but continuing',
    });
  }
}
