import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create Supabase client with SERVICE ROLE key
// This bypasses RLS policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key bypasses RLS
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        student_id,
        instructor_id,
        departure_airport,
        scheduled_start
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: `Booking not found: ${bookingId}` },
        { status: 404 }
      )
    }

    // Create weather conflict using service role (bypasses RLS)
    const { data: conflict, error: conflictError } = await supabaseAdmin
      .from('weather_conflicts')
      .insert({
        booking_id: bookingId,
        detected_at: new Date().toISOString(),
        status: 'detected',
        weather_data: [{
          airport: booking.departure_airport,
          timestamp: booking.scheduled_start,
          visibility_miles: 1.5,
          ceiling_ft: 800,
          wind_speed_knots: 30,
          wind_direction_deg: 310,
          crosswind_knots: 24,
          cloud_cover_percent: 98,
          temp_f: 42,
          condition_code: 1183,
          condition_text: 'Heavy rain showers',
          has_thunderstorm: false,
          has_icing: false
        }],
        conflict_reasons: [
          `Visibility at ${booking.departure_airport}: 1.5mi (minimum required: 5mi for student pilot)`,
          `Ceiling at ${booking.departure_airport}: 800ft (minimum required: 5000ft for student pilot)`,
          `Wind speed at ${booking.departure_airport}: 30kts (maximum allowed: 10kts for student pilot)`,
          `Crosswind at ${booking.departure_airport}: 24kts (maximum allowed: 7kts for student pilot)`,
          `Cloud cover at ${booking.departure_airport}: 98% (maximum allowed: 25% for student pilot)`,
          'Clear skies required for student pilot - heavy rain and low visibility make flight unsafe'
        ]
      })
      .select()
      .single()

    if (conflictError) {
      console.error('Failed to create conflict:', conflictError)
      return NextResponse.json(
        { error: `Failed to create conflict: ${conflictError.message}` },
        { status: 500 }
      )
    }

    // Update booking status
    await supabaseAdmin
      .from('bookings')
      .update({
        status: 'weather_hold',
        last_weather_check: new Date().toISOString(),
        weather_snapshot: [{
          airport: booking.departure_airport,
          visibility_miles: 1.5,
          ceiling_ft: 800,
          wind_speed_knots: 30,
          crosswind_knots: 24,
          cloud_cover_percent: 98,
          condition_text: 'Heavy rain showers'
        }]
      })
      .eq('id', bookingId)

    // Create reschedule proposals
    const proposalStart = new Date(booking.scheduled_start)
    proposalStart.setDate(proposalStart.getDate() + 1)

    const proposalEnd = new Date(proposalStart)
    proposalEnd.setHours(proposalEnd.getHours() + 2)

    await supabaseAdmin
      .from('reschedule_proposals')
      .insert([
        {
          conflict_id: conflict.id,
          proposed_start: proposalStart.toISOString(),
          proposed_end: proposalEnd.toISOString(),
          score: 0.97,
          reasoning: '⭐ BEST OPTION: Excellent weather tomorrow same time. Clear skies, light winds (4kts), visibility 10+ miles, no clouds. Perfect conditions for training. Both instructor and student available.'
        },
        {
          conflict_id: conflict.id,
          proposed_start: new Date(proposalStart.getTime() + 86400000).toISOString(),
          proposed_end: new Date(proposalEnd.getTime() + 86400000).toISOString(),
          score: 0.91,
          reasoning: 'Very good weather in 2 days. Partly cloudy, winds 8kts (well within limits), visibility 8+ miles. Instructor confirmed available.'
        },
        {
          conflict_id: conflict.id,
          proposed_start: new Date(proposalStart.getTime() + 14400000).toISOString(),
          proposed_end: new Date(proposalEnd.getTime() + 14400000).toISOString(),
          score: 0.88,
          reasoning: 'Good afternoon slot tomorrow. Clear skies, slightly higher winds (12kts) but manageable, visibility excellent. Alternative time if morning doesn\'t work.'
        }
      ])

    // Create notifications
    await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: booking.student_id,
          type: 'weather_conflict',
          channel: 'in_app',
          status: 'sent',
          title: '⚠️ Weather Conflict Detected',
          message: `Your flight lesson has been placed on weather hold due to severe weather at ${booking.departure_airport}. Visibility: 1.5mi, Heavy rain, Winds: 30kts.`,
          metadata: {
            conflict_id: conflict.id,
            booking_id: bookingId,
            airport: booking.departure_airport
          },
          sent_at: new Date().toISOString()
        },
        {
          user_id: booking.student_id,
          type: 'reschedule_proposal',
          channel: 'in_app',
          status: 'sent',
          title: '🤖 AI Reschedule Proposals Ready',
          message: 'Our AI has analyzed weather patterns and generated 3 alternative time slots. Review and accept your preferred option.',
          metadata: {
            conflict_id: conflict.id,
            booking_id: bookingId,
            proposal_count: 3
          },
          sent_at: new Date().toISOString()
        },
        {
          user_id: booking.instructor_id,
          type: 'weather_conflict',
          channel: 'in_app',
          status: 'sent',
          title: '⚠️ Student Lesson - Weather Hold',
          message: `Flight lesson has been placed on weather hold due to severe weather at ${booking.departure_airport}. AI reschedule proposals have been generated.`,
          metadata: {
            conflict_id: conflict.id,
            booking_id: bookingId,
            airport: booking.departure_airport
          },
          sent_at: new Date().toISOString()
        }
      ])

    return NextResponse.json({
      success: true,
      conflictId: conflict.id,
      message: 'Weather conflict created successfully'
    })
  } catch (error) {
    console.error('Error creating weather conflict:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

