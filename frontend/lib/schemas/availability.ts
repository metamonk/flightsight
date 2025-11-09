import { z } from 'zod'

/**
 * Availability pattern schema
 * 
 * Comprehensive validation to prevent logical impossibilities:
 * - Day of week must be 0-6 (Sunday-Saturday)
 * - Times must be in HH:MM format
 * - End time must be after start time
 * - Minimum duration must be at least 30 minutes
 * - Maximum duration cannot exceed 12 hours
 * - Valid until must be after valid from
 * - Cannot create availability patterns more than 2 years in the future
 * - Cannot create expired patterns (valid_until in the past)
 */
export const availabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6, { message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Start time must be in HH:MM format' }),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'End time must be in HH:MM format' }),
  is_recurring: z.boolean(),
  valid_from: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
})
  // Validation 1: End time must be after start time
  .refine(data => {
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes > startMinutes
  }, {
    message: 'End time must be after start time',
    path: ['end_time'],
  })
  // Validation 2: Minimum duration must be at least 30 minutes
  .refine(data => {
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    return duration >= 30
  }, {
    message: 'Availability block must be at least 30 minutes',
    path: ['end_time'],
  })
  // Validation 3: Maximum duration cannot exceed 12 hours
  .refine(data => {
    const [startHour, startMin] = data.start_time.split(':').map(Number)
    const [endHour, endMin] = data.end_time.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    return duration <= 720 // 12 hours = 720 minutes
  }, {
    message: 'Availability block cannot exceed 12 hours',
    path: ['end_time'],
  })
  // Validation 4: Valid until must be after valid from (if both provided)
  .refine(data => {
    if (data.valid_from && data.valid_until) {
      return new Date(data.valid_until) >= new Date(data.valid_from)
    }
    return true
  }, {
    message: 'End date must be on or after start date',
    path: ['valid_until'],
  })
  // Validation 5: Cannot create expired patterns (valid_until in the past)
  .refine(data => {
    if (data.valid_until) {
      const validUntil = new Date(data.valid_until)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Start of today
      return validUntil >= today
    }
    return true
  }, {
    message: 'End date cannot be in the past',
    path: ['valid_until'],
  })
  // Validation 6: Cannot create availability patterns more than 2 years in the future
  .refine(data => {
    if (data.valid_from) {
      const validFrom = new Date(data.valid_from)
      const twoYearsFromNow = new Date()
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
      return validFrom <= twoYearsFromNow
    }
    return true
  }, {
    message: 'Cannot create availability more than 2 years in advance',
    path: ['valid_from'],
  })
  // Validation 7: Date range cannot span more than 1 year
  .refine(data => {
    if (data.valid_from && data.valid_until) {
      const from = new Date(data.valid_from)
      const until = new Date(data.valid_until)
      const oneYearLater = new Date(from)
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1)
      return until <= oneYearLater
    }
    return true
  }, {
    message: 'Availability date range cannot exceed 1 year',
    path: ['valid_until'],
  })

export type AvailabilityFormValues = z.infer<typeof availabilitySchema>

// Day of week labels for display
export const DAY_LABELS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

// Helper to format time for display (HH:MM to hh:MM AM/PM)
export function formatTimeDisplay(time: string): string {
  const [hour, minute] = time.split(':').map(Number)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

// Helper to format date for display
export function formatDateDisplay(date: string | null | undefined): string {
  if (!date) return 'Ongoing'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

