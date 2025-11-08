import { z } from 'zod'

/**
 * Booking creation validation schema
 * Task 22.11
 */
export const bookingSchema = z.object({
  instructor_id: z.string().uuid('Please select an instructor'),
  aircraft_id: z.string().uuid('Please select an aircraft'),
  scheduled_start: z.string().datetime('Please select a valid date and time'),
  scheduled_end: z.string().datetime('Please select a valid end time'),
  lesson_type: z.string().min(1, 'Please enter a lesson type'),
  flight_type: z.enum(['local', 'short_xc', 'long_xc'], {
    errorMap: () => ({ message: 'Please select a valid flight type' }),
  }),
  departure_airport: z.string().length(4, 'Airport code must be 4 characters (e.g., KAUS)').toUpperCase(),
  destination_airport: z.string().length(4, 'Airport code must be 4 characters').toUpperCase().optional().or(z.literal('')),
  lesson_notes: z.string().optional(),
}).refine(
  (data) => {
    // Ensure scheduled_end is after scheduled_start
    return new Date(data.scheduled_end) > new Date(data.scheduled_start)
  },
  {
    message: 'End time must be after start time',
    path: ['scheduled_end'],
  }
).refine(
  (data) => {
    // If flight type is cross-country, destination is required
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

export type BookingFormData = z.infer<typeof bookingSchema>

