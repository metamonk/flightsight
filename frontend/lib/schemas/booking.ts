import { z } from 'zod'

/**
 * Booking creation validation schema
 * Task 22.11
 * 
 * Comprehensive validation to prevent logical impossibilities:
 * - End time must be after start time
 * - Booking duration must be reasonable (15 min - 8 hours)
 * - Booking must be in the future (not past dates)
 * - Booking cannot be more than 1 year in advance
 * - Destination required for cross-country flights
 * - Destination must differ from departure for cross-country
 * - Airport codes must be valid format (4 uppercase letters)
 */
export const bookingSchema = z.object({
  instructor_id: z.string().uuid('Please select an instructor'),
  aircraft_id: z.string().uuid('Please select an aircraft'),
  scheduled_start: z.string().datetime('Please select a valid date and time'),
  scheduled_end: z.string().datetime('Please select a valid end time'),
  lesson_type: z.string().min(1, 'Please enter a lesson type'),
  flight_type: z.enum(['local', 'short_xc', 'long_xc']),
  departure_airport: z.string().length(4, 'Airport code must be 4 characters (e.g., KAUS)').toUpperCase(),
  destination_airport: z.string().length(4, 'Airport code must be 4 characters').toUpperCase().optional().or(z.literal('')),
  lesson_notes: z.string().optional(),
})
  // Validation 1: End time must be after start time
  .refine(
    (data) => {
      const start = new Date(data.scheduled_start)
      const end = new Date(data.scheduled_end)
      return end > start
    },
    {
      message: 'End time must be after start time',
      path: ['scheduled_end'],
    }
  )
  // Validation 2: Booking duration must be reasonable (15 minutes minimum, 8 hours maximum)
  .refine(
    (data) => {
      const start = new Date(data.scheduled_start)
      const end = new Date(data.scheduled_end)
      const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
      return durationMinutes >= 15 && durationMinutes <= 480
    },
    {
      message: 'Booking duration must be between 15 minutes and 8 hours',
      path: ['scheduled_end'],
    }
  )
  // Validation 3: Booking must be in the future
  .refine(
    (data) => {
      const start = new Date(data.scheduled_start)
      const now = new Date()
      return start > now
    },
    {
      message: 'Booking must be scheduled for a future date and time',
      path: ['scheduled_start'],
    }
  )
  // Validation 4: Booking cannot be more than 1 year in advance
  .refine(
    (data) => {
      const start = new Date(data.scheduled_start)
      const oneYearFromNow = new Date()
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
      return start <= oneYearFromNow
    },
    {
      message: 'Bookings cannot be made more than 1 year in advance',
      path: ['scheduled_start'],
    }
  )
  // Validation 5: Cross-country flights require destination airport
  .refine(
    (data) => {
      if (data.flight_type === 'short_xc' || data.flight_type === 'long_xc') {
        return data.destination_airport && data.destination_airport.length === 4
      }
      return true
    },
    {
      message: 'Destination airport is required for cross-country flights',
      path: ['destination_airport'],
    }
  )
  // Validation 6: Destination must differ from departure for cross-country flights
  .refine(
    (data) => {
      if (data.flight_type === 'short_xc' || data.flight_type === 'long_xc') {
        return data.destination_airport !== data.departure_airport
      }
      return true
    },
    {
      message: 'Destination airport must be different from departure airport for cross-country flights',
      path: ['destination_airport'],
    }
  )
  // Validation 7: Local flights should not have a destination
  .refine(
    (data) => {
      if (data.flight_type === 'local') {
        return !data.destination_airport || data.destination_airport === ''
      }
      return true
    },
    {
      message: 'Local flights should not have a destination airport',
      path: ['destination_airport'],
    }
  )

export type BookingFormData = z.infer<typeof bookingSchema>

