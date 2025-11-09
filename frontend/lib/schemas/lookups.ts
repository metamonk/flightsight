import { z } from 'zod'

// ============================================
// AIRPORT SCHEMAS
// ============================================

export const airportSchema = z.object({
  code: z.string()
    .min(3, { message: 'Airport code must be at least 3 characters' })
    .max(10, { message: 'Airport code must be at most 10 characters' })
    .regex(/^[A-Z0-9]+$/, { message: 'Airport code must be uppercase letters and numbers only' }),
  name: z.string()
    .min(3, { message: 'Airport name must be at least 3 characters' })
    .max(255, { message: 'Airport name must be at most 255 characters' }),
  city: z.string()
    .min(2, { message: 'City must be at least 2 characters' })
    .max(100, { message: 'City must be at most 100 characters' })
    .optional()
    .nullable(),
  state: z.string()
    .max(50, { message: 'State must be at most 50 characters' })
    .optional()
    .nullable(),
  country: z.string()
    .max(50, { message: 'Country must be at most 50 characters' })
    .default('USA'),
  is_active: z.boolean().default(true),
})

export type AirportFormValues = z.infer<typeof airportSchema>

// ============================================
// LESSON TYPE SCHEMAS
// ============================================

export const lessonTypeCategories = ['primary', 'advanced', 'specialized'] as const

export const lessonTypeSchema = z.object({
  name: z.string()
    .min(3, { message: 'Lesson type name must be at least 3 characters' })
    .max(100, { message: 'Lesson type name must be at most 100 characters' }),
  description: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional()
    .nullable(),
  category: z.enum(lessonTypeCategories).optional().nullable(),
  is_active: z.boolean().default(true),
})

export type LessonTypeFormValues = z.infer<typeof lessonTypeSchema>

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format airport for display (e.g., "KJFK - John F. Kennedy International Airport")
export function formatAirportDisplay(airport: { code: string; name: string }): string {
  return `${airport.code} - ${airport.name}`
}

// Format airport with city/state (e.g., "KJFK - John F. Kennedy International Airport (New York, NY)")
export function formatAirportFull(airport: { 
  code: string; 
  name: string; 
  city?: string | null; 
  state?: string | null 
}): string {
  const location = [airport.city, airport.state].filter(Boolean).join(', ')
  return location 
    ? `${airport.code} - ${airport.name} (${location})`
    : `${airport.code} - ${airport.name}`
}

// Format lesson type for display
export function formatLessonTypeDisplay(lessonType: { name: string; category?: string | null }): string {
  return lessonType.category 
    ? `${lessonType.name} (${lessonType.category})`
    : lessonType.name
}

// Get lesson type category badge color
export function getLessonTypeCategoryColor(category: string | null | undefined): string {
  switch (category) {
    case 'primary':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'advanced':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    case 'specialized':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

// Get category label for display
export function getCategoryLabel(category: string | null | undefined): string {
  switch (category) {
    case 'primary':
      return 'Primary'
    case 'advanced':
      return 'Advanced'
    case 'specialized':
      return 'Specialized'
    default:
      return 'Uncategorized'
  }
}

