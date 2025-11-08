// AI Rescheduler Edge Function
// Triggered by QStash from weather-checker to generate intelligent reschedule proposals

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-4'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const QSTASH_TOKEN = Deno.env.get('QSTASH_TOKEN')!

interface RescheduleProposal {
  proposed_start: string
  proposed_end: string
  proposed_instructor_id?: string
  proposed_aircraft_id?: string
  score: number
  reasoning: string
}

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
    
    console.log(`🤖 AI Rescheduler: Processing conflict ${conflict_id}`)
    
    // Mark conflict as processing
    const aiStartTime = new Date()
    await supabase
      .from('weather_conflicts')
      .update({
        status: 'ai_processing',
        ai_processing_started_at: aiStartTime.toISOString()
      })
      .eq('id', conflict_id)
    
    // Fetch conflict details with related booking data
    const { data: conflict, error: conflictError } = await supabase
      .from('weather_conflicts')
      .select(`
        *,
        booking:booking_id (
          *,
          student:student_id (id, email, full_name, training_level),
          instructor:instructor_id (id, email, full_name),
          aircraft:aircraft_id (*)
        )
      `)
      .eq('id', conflict_id)
      .single()
    
    if (conflictError) throw conflictError
    
    // Find available time slots in the next 7 days
    const availableSlots = await findAvailableTimeSlots(
      supabase,
      conflict.booking,
      7 // days to look ahead
    )
    
    if (availableSlots.length === 0) {
      console.log('No available slots found')
      await supabase
        .from('weather_conflicts')
        .update({
          status: 'resolved',
          resolution_method: 'no_slots_available',
          ai_processing_completed_at: new Date().toISOString(),
          ai_processing_duration_ms: Date.now() - aiStartTime.getTime()
        })
        .eq('id', conflict_id)
      
      return new Response(
        JSON.stringify({ message: 'No available slots found' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }
    
    // Generate AI proposals
    const proposals = await generateAIProposals(
      conflict,
      availableSlots
    )
    
    // Save proposals to database
    const { error: proposalError } = await supabase
      .from('reschedule_proposals')
      .insert(
        proposals.map(p => ({
          conflict_id: conflict_id,
          ...p
        }))
      )
    
    if (proposalError) throw proposalError
    
    // Update conflict status
    await supabase
      .from('weather_conflicts')
      .update({
        status: 'proposals_ready',
        ai_processing_completed_at: new Date().toISOString(),
        ai_processing_duration_ms: Date.now() - aiStartTime.getTime()
      })
      .eq('id', conflict_id)
    
    // Trigger notification sender
    await triggerNotificationSender(conflict_id)
    
    console.log(`✅ Generated ${proposals.length} proposals for conflict ${conflict_id}`)
    
    return new Response(
      JSON.stringify({
        message: 'Proposals generated successfully',
        proposals: proposals.length
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('AI Rescheduler Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function findAvailableTimeSlots(
  supabase: any,
  booking: any,
  daysAhead: number
): Promise<any[]> {
  const slots: any[] = []
  const duration = new Date(booking.scheduled_end).getTime() - 
                  new Date(booking.scheduled_start).getTime()
  const durationHours = duration / (1000 * 60 * 60)
  
  // Get instructor availability
  const { data: instructorAvailability } = await supabase
    .from('availability')
    .select('*')
    .eq('user_id', booking.instructor_id)
  
  if (!instructorAvailability || instructorAvailability.length === 0) {
    console.log('No instructor availability found')
    return slots
  }
  
  // Check each day for the next week
  for (let day = 1; day <= daysAhead; day++) {
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() + day)
    const dayOfWeek = checkDate.getDay()
    
    // Find availability for this day of week
    const dayAvailability = instructorAvailability.filter(
      a => a.day_of_week === dayOfWeek && a.is_recurring
    )
    
    for (const avail of dayAvailability) {
      // Check if valid date range
      if (avail.valid_from && new Date(avail.valid_from) > checkDate) continue
      if (avail.valid_until && new Date(avail.valid_until) < checkDate) continue
      
      // Create time slots (every hour within availability)
      const startHour = parseInt(avail.start_time.split(':')[0])
      const endHour = parseInt(avail.end_time.split(':')[0])
      
      for (let hour = startHour; hour <= endHour - durationHours; hour++) {
        const slotStart = new Date(checkDate)
        slotStart.setHours(hour, 0, 0, 0)
        
        const slotEnd = new Date(slotStart)
        slotEnd.setHours(slotEnd.getHours() + durationHours)
        
        // Check if instructor is already booked
        const { data: existingBookings } = await supabase
          .from('bookings')
          .select('id')
          .eq('instructor_id', booking.instructor_id)
          .in('status', ['scheduled', 'weather_hold'])
          .or(`and(scheduled_start.lte.${slotEnd.toISOString()},scheduled_end.gte.${slotStart.toISOString()})`)
        
        if (!existingBookings || existingBookings.length === 0) {
          // Check if aircraft is available
          const { data: aircraftBookings } = await supabase
            .from('bookings')
            .select('id')
            .eq('aircraft_id', booking.aircraft_id)
            .in('status', ['scheduled', 'weather_hold'])
            .or(`and(scheduled_start.lte.${slotEnd.toISOString()},scheduled_end.gte.${slotStart.toISOString()})`)
          
          if (!aircraftBookings || aircraftBookings.length === 0) {
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              instructor_id: booking.instructor_id,
              aircraft_id: booking.aircraft_id
            })
          }
        }
      }
    }
  }
  
  console.log(`Found ${slots.length} available time slots`)
  return slots.slice(0, 20) // Limit to 20 slots for AI processing
}

async function generateAIProposals(
  conflict: any,
  availableSlots: any[]
): Promise<RescheduleProposal[]> {
  const booking = conflict.booking
  const weatherData = conflict.weather_data
  const conflictReasons = conflict.conflict_reasons
  
  // Build context for AI
  const prompt = `You are an AI flight scheduler. A training flight has been cancelled due to weather conditions.

**Original Booking:**
- Student: ${booking.student.full_name} (${booking.student.training_level})
- Instructor: ${booking.instructor.full_name}
- Aircraft: ${booking.aircraft.tail_number} (${booking.aircraft.make} ${booking.aircraft.model})
- Originally scheduled: ${new Date(booking.scheduled_start).toLocaleString()} - ${new Date(booking.scheduled_end).toLocaleString()}
- Flight type: ${booking.flight_type}
- Departure: ${booking.departure_airport}${booking.destination_airport ? ` → Destination: ${booking.destination_airport}` : ''}

**Weather Conflict Reasons:**
${conflictReasons.join('\n')}

**Weather Data at Checkpoints:**
${JSON.stringify(weatherData, null, 2)}

**Available Time Slots (next 7 days):**
${availableSlots.map((slot, i) => `${i + 1}. ${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`).join('\n')}

**Task:**
Analyze the available time slots and generate exactly 3 reschedule proposals. Consider:
1. Weather conditions are likely to improve (avoid similar conditions)
2. Student's training level requirements
3. Time of day preferences (morning flights often have better weather)
4. Proximity to original time (minimize disruption)
5. Weekend vs weekday (if original was weekend, prefer weekend)

For each proposal, provide:
1. Slot number (from the list above)
2. Score (0-100, higher is better)
3. Reasoning (2-3 sentences explaining why this is a good choice)

Respond in JSON format:
{
  "proposals": [
    {
      "slot_number": 1,
      "score": 95,
      "reasoning": "Morning flight with clear skies expected..."
    }
  ]
}

IMPORTANT: Return ONLY valid JSON, no additional text.`

  console.log('Calling OpenAI API...')
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an expert flight scheduler with deep knowledge of aviation weather and training requirements. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  })
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }
  
  const data = await response.json()
  const aiResponse = data.choices[0].message.content
  
  console.log('AI Response:', aiResponse)
  
  // Parse AI response
  let parsed
  try {
    parsed = JSON.parse(aiResponse)
  } catch (e) {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Failed to parse AI response as JSON')
    }
  }
  
  // Convert AI proposals to database format
  const proposals: RescheduleProposal[] = parsed.proposals.slice(0, 3).map((p: any) => {
    const slot = availableSlots[p.slot_number - 1]
    
    return {
      proposed_start: slot.start,
      proposed_end: slot.end,
      proposed_instructor_id: slot.instructor_id,
      proposed_aircraft_id: slot.aircraft_id,
      score: p.score,
      reasoning: p.reasoning
    }
  })
  
  return proposals
}

async function triggerNotificationSender(conflictId: string) {
  const qstashUrl = 'https://qstash.upstash.io/v2/publish'
  const targetUrl = `${SUPABASE_URL}/functions/v1/notification-sender`
  
  const response = await fetch(`${qstashUrl}/${targetUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${QSTASH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ conflict_id: conflictId })
  })
  
  if (!response.ok) {
    console.error('Failed to trigger notification sender:', await response.text())
  }
}

