'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema, type BookingFormData } from '@/lib/schemas/booking'

/**
 * Server Action: Create Booking
 * Task 22.13
 * 
 * Creates a new flight booking for a student.
 * Validates input, checks authentication, and enforces RLS policies.
 */
export async function createBooking(formData: BookingFormData) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'You must be logged in to create a booking',
    }
  }

  // Validate form data
  const validation = bookingSchema.safeParse(formData)
  
  if (!validation.success) {
    return {
      error: 'Invalid form data',
      details: validation.error.flatten().fieldErrors,
    }
  }

  const data = validation.data

  // Calculate flight distance and type (simplified - in production would use actual coordinates)
  const flightDistance = data.flight_type === 'local' ? 0 : 
                        data.flight_type === 'short_xc' ? 75 : 150

  // Create booking in database
  // RLS policy ensures student_id = auth.uid()
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      student_id: user.id, // Authenticated user is the student
      instructor_id: data.instructor_id,
      aircraft_id: data.aircraft_id,
      scheduled_start: data.scheduled_start,
      scheduled_end: data.scheduled_end,
      status: 'scheduled',
      departure_airport: data.departure_airport,
      destination_airport: data.destination_airport || null,
      flight_distance_nm: flightDistance,
      flight_type: data.flight_type,
      lesson_type: data.lesson_type,
      lesson_notes: data.lesson_notes || null,
    })
    .select()
    .single()

  if (bookingError) {
    console.error('Booking creation error:', bookingError)
    return {
      error: `Failed to create booking: ${bookingError.message}`,
    }
  }

  // Revalidate the bookings cache
  revalidatePath('/dashboard/student', 'page')
  revalidatePath('/dashboard/instructor', 'page')

  return {
    success: true,
    booking,
  }
}

