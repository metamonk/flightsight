import { z } from 'zod'

// Availability pattern schema
export const availabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6, { message: 'Day of week must be between 0 (Sunday) and 6 (Saturday)' }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'Start time must be in HH:MM format' }),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'End time must be in HH:MM format' }),
  is_recurring: z.boolean().default(true),
  valid_from: z.string().optional().nullable(),
  valid_until: z.string().optional().nullable(),
}).refine(data => {
  // Validate that end_time is after start_time
  const [startHour, startMin] = data.start_time.split(':').map(Number)
  const [endHour, endMin] = data.end_time.split(':').map(Number)
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  return endMinutes > startMinutes
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
}).refine(data => {
  // Validate that valid_until is after valid_from (if both are provided)
  if (data.valid_from && data.valid_until) {
    return new Date(data.valid_until) >= new Date(data.valid_from)
  }
  return true
}, {
  message: 'End date must be on or after start date',
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

