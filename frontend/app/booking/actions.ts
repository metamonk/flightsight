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
      status: 'pending', // New bookings start as pending, awaiting instructor confirmation
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

/**
 * Server Action: Confirm Booking (Instructor)
 * 
 * Allows an instructor to confirm a pending booking.
 */
export async function confirmBooking(bookingId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'You must be logged in to confirm a booking',
    }
  }

  // Verify user is the instructor for this booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('instructor_id, status')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return {
      error: 'Booking not found',
    }
  }

  if (booking.instructor_id !== user.id) {
    return {
      error: 'You are not authorized to confirm this booking',
    }
  }

  if (booking.status !== 'pending') {
    return {
      error: `Cannot confirm booking with status: ${booking.status}`,
    }
  }

  // Update booking status to scheduled (confirmed by instructor)
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Booking confirmation error:', updateError)
    return {
      error: `Failed to confirm booking: ${updateError.message}`,
    }
  }

  // Revalidate the bookings cache
  revalidatePath('/dashboard/student', 'page')
  revalidatePath('/dashboard/instructor', 'page')
  revalidatePath(`/dashboard/booking/${bookingId}`, 'page')

  return {
    success: true,
  }
}

/**
 * Server Action: Cancel Booking
 * 
 * Allows either the student or instructor to cancel a booking.
 */
export async function cancelBooking(bookingId: string, reason: string) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'You must be logged in to cancel a booking',
    }
  }

  // Verify user is either the student or instructor for this booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('student_id, instructor_id, status')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return {
      error: 'Booking not found',
    }
  }

  if (booking.student_id !== user.id && booking.instructor_id !== user.id) {
    return {
      error: 'You are not authorized to cancel this booking',
    }
  }

  if (booking.status === 'cancelled') {
    return {
      error: 'Booking is already cancelled',
    }
  }

  // Update booking status to cancelled
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancellation_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Booking cancellation error:', updateError)
    return {
      error: `Failed to cancel booking: ${updateError.message}`,
    }
  }

  // Revalidate the bookings cache
  revalidatePath('/dashboard/student', 'page')
  revalidatePath('/dashboard/instructor', 'page')
  revalidatePath(`/dashboard/booking/${bookingId}`, 'page')

  return {
    success: true,
  }
}

/**
 * Server Action: Request Reschedule
 * 
 * Allows either party to request a reschedule with a new time.
 */
export async function requestReschedule(
  bookingId: string,
  newStart: string,
  newEnd: string,
  reason: string
) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'You must be logged in to request a reschedule',
    }
  }

  // Verify user is either the student or instructor for this booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('student_id, instructor_id, status, scheduled_start, scheduled_end')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return {
      error: 'Booking not found',
    }
  }

  if (booking.student_id !== user.id && booking.instructor_id !== user.id) {
    return {
      error: 'You are not authorized to reschedule this booking',
    }
  }

  if (booking.status === 'cancelled') {
    return {
      error: 'Cannot reschedule a cancelled booking',
    }
  }

  // Validate new times
  const newStartDate = new Date(newStart)
  const newEndDate = new Date(newEnd)
  const now = new Date()

  if (newStartDate < now) {
    return {
      error: 'New start time must be in the future',
    }
  }

  if (newEndDate <= newStartDate) {
    return {
      error: 'End time must be after start time',
    }
  }

  const durationMinutes = (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60)
  if (durationMinutes < 15 || durationMinutes > 480) {
    return {
      error: 'Booking duration must be between 15 minutes and 8 hours',
    }
  }

  // Update booking with new times and set status to rescheduling
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      scheduled_start: newStart,
      scheduled_end: newEnd,
      status: 'rescheduling',
      lesson_notes: booking.lesson_notes 
        ? `${booking.lesson_notes}\n\n[Reschedule Request by ${user.email}]: ${reason}`
        : `[Reschedule Request by ${user.email}]: ${reason}`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Booking reschedule error:', updateError)
    return {
      error: `Failed to reschedule booking: ${updateError.message}`,
    }
  }

  // Revalidate the bookings cache
  revalidatePath('/dashboard/student', 'page')
  revalidatePath('/dashboard/instructor', 'page')
  revalidatePath(`/dashboard/booking/${bookingId}`, 'page')

  return {
    success: true,
  }
}

/**
 * Server Action: Approve Reschedule
 * 
 * Allows the other party to approve a reschedule request.
 */
export async function approveReschedule(bookingId: string) {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      error: 'You must be logged in to approve a reschedule',
    }
  }

  // Verify user is either the student or instructor for this booking
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('student_id, instructor_id, status')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return {
      error: 'Booking not found',
    }
  }

  if (booking.student_id !== user.id && booking.instructor_id !== user.id) {
    return {
      error: 'You are not authorized to approve this reschedule',
    }
  }

  if (booking.status !== 'rescheduling') {
    return {
      error: 'No pending reschedule request for this booking',
    }
  }

  // Update booking status to scheduled (approved reschedule)
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ 
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('Reschedule approval error:', updateError)
    return {
      error: `Failed to approve reschedule: ${updateError.message}`,
    }
  }

  // Revalidate the bookings cache
  revalidatePath('/dashboard/student', 'page')
  revalidatePath('/dashboard/instructor', 'page')
  revalidatePath(`/dashboard/booking/${bookingId}`, 'page')

  return {
    success: true,
  }
}
