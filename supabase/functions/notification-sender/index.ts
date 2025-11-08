// Notification Sender Edge Function
// Sends email notifications via Resend and creates in-app notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'notifications@flightschedulepro.com'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'Flight Schedule Pro'
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    const { conflict_id } = await req.json()
    
    if (!conflict_id) {
      return new Response(
        JSON.stringify({ error: 'conflict_id is required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    console.log(`📧 Notification Sender: Processing conflict ${conflict_id}`)
    
    // Fetch conflict with proposals and booking data
    const { data: conflict, error: conflictError } = await supabase
      .from('weather_conflicts')
      .select(`
        *,
        booking:booking_id (
          *,
          student:student_id (*),
          instructor:instructor_id (*),
          aircraft:aircraft_id (*)
        )
      `)
      .eq('id', conflict_id)
      .single()
    
    if (conflictError) throw conflictError
    
    // Fetch proposals
    const { data: proposals, error: proposalsError } = await supabase
      .from('reschedule_proposals')
      .select('*')
      .eq('conflict_id', conflict_id)
      .order('score', { ascending: false })
      .limit(3)
    
    if (proposalsError) throw proposalsError
    
    if (!proposals || proposals.length === 0) {
      console.log('No proposals found for conflict')
      return new Response(
        JSON.stringify({ message: 'No proposals to notify about' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    const booking = conflict.booking
    
    // Create in-app notifications
    await createInAppNotifications(supabase, conflict, booking, proposals)
    
    // Send email to student
    if (booking.student.preferences?.notifications?.email !== false) {
      await sendEmail(
        booking.student.email,
        booking.student.full_name,
        'student',
        booking,
        conflict,
        proposals
      )
    }
    
    // Send email to instructor
    if (booking.instructor.preferences?.notifications?.email !== false) {
      await sendEmail(
        booking.instructor.email,
        booking.instructor.full_name,
        'instructor',
        booking,
        conflict,
        proposals
      )
    }
    
    console.log(`✅ Notifications sent for conflict ${conflict_id}`)
    
    return new Response(
      JSON.stringify({
        message: 'Notifications sent successfully',
        notificationsSent: 2 + (proposals.length * 2) // emails + in-app
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Notification Sender Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function createInAppNotifications(
  supabase: any,
  conflict: any,
  booking: any,
  proposals: any[]
) {
  const notifications = []
  
  // Weather conflict notification for student
  notifications.push({
    user_id: booking.student_id,
    type: 'weather_conflict',
    channel: 'in_app',
    status: 'sent',
    title: '⚠️ Weather Conflict Detected',
    message: `Your flight lesson scheduled for ${new Date(booking.scheduled_start).toLocaleString()} has been placed on weather hold due to unsafe conditions.`,
    metadata: {
      conflict_id: conflict.id,
      booking_id: booking.id,
      conflict_reasons: conflict.conflict_reasons
    },
    sent_at: new Date().toISOString()
  })
  
  // Weather conflict notification for instructor
  notifications.push({
    user_id: booking.instructor_id,
    type: 'weather_conflict',
    channel: 'in_app',
    status: 'sent',
    title: '⚠️ Weather Conflict Detected',
    message: `Flight lesson with ${booking.student.full_name} scheduled for ${new Date(booking.scheduled_start).toLocaleString()} has been placed on weather hold.`,
    metadata: {
      conflict_id: conflict.id,
      booking_id: booking.id,
      conflict_reasons: conflict.conflict_reasons
    },
    sent_at: new Date().toISOString()
  })
  
  // Reschedule proposal notifications for student
  notifications.push({
    user_id: booking.student_id,
    type: 'reschedule_proposal',
    channel: 'in_app',
    status: 'sent',
    title: '🤖 AI Reschedule Proposals Ready',
    message: `We've generated ${proposals.length} alternative time slots for your lesson. Review and accept your preferred option.`,
    metadata: {
      conflict_id: conflict.id,
      booking_id: booking.id,
      proposal_ids: proposals.map(p => p.id)
    },
    sent_at: new Date().toISOString()
  })
  
  // Reschedule proposal notifications for instructor
  notifications.push({
    user_id: booking.instructor_id,
    type: 'reschedule_proposal',
    channel: 'in_app',
    status: 'sent',
    title: '🤖 AI Reschedule Proposals Ready',
    message: `${proposals.length} alternative time slots have been proposed for the lesson with ${booking.student.full_name}. Review the options.`,
    metadata: {
      conflict_id: conflict.id,
      booking_id: booking.id,
      proposal_ids: proposals.map(p => p.id)
    },
    sent_at: new Date().toISOString()
  })
  
  const { error } = await supabase
    .from('notifications')
    .insert(notifications)
  
  if (error) throw error
  
  console.log(`Created ${notifications.length} in-app notifications`)
}

async function sendEmail(
  toEmail: string,
  toName: string,
  role: 'student' | 'instructor',
  booking: any,
  conflict: any,
  proposals: any[]
) {
  const originalTime = new Date(booking.scheduled_start).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  })
  
  const weatherIssues = conflict.conflict_reasons.slice(0, 5).join('\n• ')
  
  // Build proposals HTML
  const proposalsHtml = proposals.map((p, i) => {
    const proposedStart = new Date(p.proposed_start).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
    
    return `
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 12px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 16px; font-size: 14px; font-weight: 600;">
            Option ${i + 1} • Score: ${p.score}/100
          </span>
        </div>
        <div style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 4px;">
          📅 ${proposedStart}
        </div>
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">
          ${p.reasoning}
        </div>
      </div>
    `
  }).join('')
  
  const dashboardUrl = `${APP_URL}/dashboard/${role}`
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather Conflict - Flight Rescheduling Required</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">⚠️ Weather Alert</h1>
    <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.95;">Your flight lesson requires rescheduling</p>
  </div>
  
  <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; color: #111827;">Hi ${toName},</p>
    
    <p style="font-size: 15px; color: #374151;">
      Unfortunately, your flight lesson scheduled for <strong>${originalTime}</strong> has been placed on weather hold due to unsafe flying conditions.
    </p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <div style="font-weight: 600; color: #92400e; margin-bottom: 8px;">Weather Conditions:</div>
      <div style="font-size: 14px; color: #78350f;">
        • ${weatherIssues}
      </div>
    </div>
    
    <h2 style="font-size: 20px; color: #111827; margin: 24px 0 16px 0;">🤖 AI-Generated Reschedule Options</h2>
    
    <p style="font-size: 15px; color: #374151;">
      Our AI has analyzed the forecast and your availability to suggest the following alternative time slots:
    </p>
    
    ${proposalsHtml}
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View & Accept Proposals
      </a>
    </div>
    
    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 24px;">
      <div style="font-size: 14px; color: #6b7280;">
        <strong>Original Booking Details:</strong><br>
        Student: ${booking.student.full_name}<br>
        Instructor: ${booking.instructor.full_name}<br>
        Aircraft: ${booking.aircraft.tail_number} (${booking.aircraft.make} ${booking.aircraft.model})<br>
        Type: ${booking.flight_type} flight
        ${booking.destination_airport ? `<br>Route: ${booking.departure_airport} → ${booking.destination_airport}` : ''}
      </div>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 24px; padding: 20px; font-size: 14px; color: #9ca3af;">
    <p style="margin: 0;">
      Safety is our top priority. All proposals have been vetted against current weather forecasts and training requirements.
    </p>
    <p style="margin: 8px 0 0 0;">
      ${FROM_NAME} • Automated Weather Monitoring System
    </p>
  </div>
  
</body>
</html>
  `
  
  const textContent = `
Weather Alert - Flight Rescheduling Required

Hi ${toName},

Your flight lesson scheduled for ${originalTime} has been placed on weather hold.

Weather Conditions:
${conflict.conflict_reasons.join('\n')}

AI-Generated Reschedule Options:

${proposals.map((p, i) => `
Option ${i + 1} (Score: ${p.score}/100)
${new Date(p.proposed_start).toLocaleString()}
${p.reasoning}
`).join('\n')}

View and accept proposals at: ${dashboardUrl}

Original Booking:
Student: ${booking.student.full_name}
Instructor: ${booking.instructor.full_name}
Aircraft: ${booking.aircraft.tail_number}

${FROM_NAME}
  `
  
  console.log(`Sending email to ${toEmail}...`)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `⚠️ Weather Alert: Flight Lesson Rescheduling Required`,
      html: htmlContent,
      text: textContent
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error(`Failed to send email to ${toEmail}:`, error)
    throw new Error(`Resend API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  console.log(`✅ Email sent to ${toEmail}:`, data.id)
  
  return data
}

