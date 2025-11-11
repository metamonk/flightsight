/**
 * Schedule-X Event Transformations
 * 
 * Utilities to transform our booking data into Schedule-X event format
 * and handle timezone conversions using Temporal API.
 */

import 'temporal-polyfill/global'
import type { CalendarEvent } from '@schedule-x/calendar'
import { getCalendarCategoryId } from './config'

/**
 * Booking data from database (Supabase)
 */
export interface BookingData {
  id: string
  scheduled_start: string // ISO string (UTC)
  scheduled_end: string // ISO string (UTC)
  status: 'pending' | 'scheduled' | 'cancelled' | string
  lesson_type: string
  duration_minutes?: number
  student: {
    id: string
    full_name: string
    avatar_url?: string
  }
  instructor?: {
    id: string
    full_name: string
    avatar_url?: string
  }
  aircraft?: {
    id: string
    registration: string
    make: string
    model: string
  }
  flight_type?: string
  departure_airport?: string
  destination_airport?: string
}

/**
 * Weather conflict data from database
 */
export interface WeatherConflictData {
  id: string
  booking_id: string
  detected_at: string
  status: 'detected' | 'proposals_ready' | 'resolved'
  conflict_reasons: string[]
  booking: BookingData
}

/**
 * Transform booking to Schedule-X event
 */
export function transformBookingToEvent(
  booking: BookingData,
  hasWeatherConflict: boolean = false
): CalendarEvent {
  // Convert UTC ISO strings to Temporal ZonedDateTime
  // Parse ISO strings as Instant first, then convert to ZonedDateTime in UTC
  const start = Temporal.Instant.from(booking.scheduled_start).toZonedDateTimeISO('UTC')
  const end = Temporal.Instant.from(booking.scheduled_end).toZonedDateTimeISO('UTC')
  
  // Build title with instructor and aircraft info
  const parts = [
    booking.lesson_type,
    booking.instructor?.full_name || 'Instructor TBD',
    booking.aircraft?.registration || 'Aircraft TBD'
  ]
  const title = parts.join(' • ')
  
  // Build description with more details
  const description = [
    `Student: ${booking.student.full_name}`,
    booking.instructor ? `Instructor: ${booking.instructor.full_name}` : '',
    booking.aircraft ? `Aircraft: ${booking.aircraft.make} ${booking.aircraft.model}` : '',
    booking.flight_type ? `Type: ${booking.flight_type}` : '',
    booking.departure_airport ? `From: ${booking.departure_airport}` : '',
    booking.destination_airport ? `To: ${booking.destination_airport}` : ''
  ].filter(Boolean).join('\n')
  
  return {
    id: booking.id,
    title,
    start,
    end,
    description,
    calendarId: getCalendarCategoryId(booking.status, hasWeatherConflict),

    // Store original data for later use
    _customContent: {
      bookingId: booking.id,
      studentId: booking.student.id,
      instructorId: booking.instructor?.id,
      aircraftId: booking.aircraft?.id,
      lessonType: booking.lesson_type,
      status: booking.status,
      hasWeatherConflict,
      studentName: booking.student.full_name,
      instructorName: booking.instructor?.full_name,
      aircraftReg: booking.aircraft?.registration,
      studentAvatar: booking.student.avatar_url,
      instructorAvatar: booking.instructor?.avatar_url
    }
  } as any
}

/**
 * Transform multiple bookings to events
 */
export function transformBookingsToEvents(
  bookings: BookingData[],
  conflicts: WeatherConflictData[] = []
): CalendarEvent[] {
  // Create set of booking IDs with conflicts
  const conflictedBookingIds = new Set(
    conflicts
      .filter(c => c.status !== 'resolved')
      .map(c => c.booking_id)
  )
  
  return bookings.map(booking => 
    transformBookingToEvent(booking, conflictedBookingIds.has(booking.id))
  )
}

/**
 * Transform weather conflict to background event
 * Background events show as stripes/patterns behind regular events
 */
export function transformConflictToBackground(
  conflict: WeatherConflictData
): CalendarEvent {
  const start = Temporal.Instant.from(conflict.booking.scheduled_start).toZonedDateTimeISO('UTC')
  const end = Temporal.Instant.from(conflict.booking.scheduled_end).toZonedDateTimeISO('UTC')
  
  // Build description with weather reasons
  const description = [
    'Weather Conflict',
    ...conflict.conflict_reasons
  ].join('\n')
  
  return {
    id: `conflict-${conflict.id}`,
    title: '⚠️ Weather Conflict',
    start,
    end,
    description,

    // Use weatherConflict calendar category for special styling
    calendarId: 'weatherConflict' as const,

    // Background event styling
    _customContent: {
      isBackground: true,
      conflictId: conflict.id,
      bookingId: conflict.booking_id,
      weatherReasons: conflict.conflict_reasons
    }
  } as any
}

/**
 * Transform multiple conflicts to background events
 */
export function transformConflictsToBackground(
  conflicts: WeatherConflictData[]
): CalendarEvent[] {
  return conflicts
    .filter(c => c.status !== 'resolved')
    .map(transformConflictToBackground)
}

/**
 * Create event from datetime click (for new booking)
 * Defaults to 1 hour duration
 */
export function createEventFromClick(
  dateTime: Temporal.ZonedDateTime,
  defaultDuration: number = 60
): Partial<BookingData> {
  const start = dateTime
  const end = dateTime.add({ minutes: defaultDuration })
  
  return {
    scheduled_start: start.toString(),
    scheduled_end: end.toString(),
    duration_minutes: defaultDuration,
    status: 'pending'
  }
}

/**
 * Extract updated times from drag/drop event
 */
export function extractEventTimes(event: CalendarEvent): {
  scheduled_start: string
  scheduled_end: string
  duration_minutes: number
} {
  const start = event.start as Temporal.ZonedDateTime
  const end = event.end as Temporal.ZonedDateTime
  
  // Calculate duration
  const duration = Math.round(
    (end.epochMilliseconds - start.epochMilliseconds) / (1000 * 60)
  )
  
  return {
    scheduled_start: start.toString(),
    scheduled_end: end.toString(),
    duration_minutes: duration
  }
}

