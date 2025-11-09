import { z } from 'zod'

/**
 * Aircraft schema for add/edit forms
 * 
 * Comprehensive validation to prevent logical impossibilities:
 * - Year must be between 1900 and current year + 1
 * - Hourly rate must be positive and reasonable
 * - Weather minimums must be logically valid
 * - Crosswind cannot exceed total wind speed
 * - Ceiling and visibility must be reasonable values
 */
export const aircraftSchema = z.object({
  tail_number: z
    .string()
    .min(3, { message: 'Tail number must be at least 3 characters' })
    .max(10, { message: 'Tail number must be at most 10 characters' })
    .regex(/^[A-Z0-9-]+$/, { message: 'Tail number must contain only uppercase letters, numbers, and hyphens' })
    .transform(val => val.toUpperCase()),
  
  make: z
    .string()
    .min(2, { message: 'Make must be at least 2 characters' })
    .max(100, { message: 'Make must be at most 100 characters' }),
  
  model: z
    .string()
    .min(1, { message: 'Model is required' })
    .max(100, { message: 'Model must be at most 100 characters' }),
  
  year: z
    .number()
    .int()
    .min(1900, { message: 'Year must be 1900 or later' })
    .max(new Date().getFullYear() + 1, { message: `Year cannot be later than ${new Date().getFullYear() + 1}` })
    .optional()
    .nullable(),
  
  category: z
    .string()
    .min(1, { message: 'Category is required' })
    .max(50, { message: 'Category must be at most 50 characters' }),
  
  hourly_rate: z
    .number()
    .positive({ message: 'Hourly rate must be positive' })
    .min(10, { message: 'Hourly rate must be at least $10' })
    .max(10000, { message: 'Hourly rate must be less than $10,000' })
    .optional()
    .nullable(),
  
  is_active: z.boolean(),
  
  maintenance_notes: z
    .string()
    .max(1000, { message: 'Maintenance notes must be at most 1000 characters' })
    .optional()
    .nullable(),
  
  // Weather minimums (stored as JSONB)
  minimum_weather_requirements: z.object({
    ceiling_ft: z
      .number()
      .int()
      .min(0, { message: 'Ceiling must be 0 or greater' })
      .max(50000, { message: 'Ceiling must be less than 50,000 ft' }),
    
    visibility_miles: z
      .number()
      .positive({ message: 'Visibility must be greater than 0' })
      .min(0.25, { message: 'Visibility must be at least 0.25 miles' })
      .max(50, { message: 'Visibility must be less than 50 miles' }),
    
    wind_speed_knots: z
      .number()
      .int()
      .min(0, { message: 'Wind speed must be 0 or greater' })
      .max(200, { message: 'Wind speed must be less than 200 knots' }),
    
    crosswind_knots: z
      .number()
      .int()
      .min(0, { message: 'Crosswind must be 0 or greater' })
      .max(100, { message: 'Crosswind must be less than 100 knots' }),
  }).optional(),
})
  // Validation: Crosswind cannot exceed total wind speed
  .refine(
    (data) => {
      if (data.minimum_weather_requirements) {
        const { wind_speed_knots, crosswind_knots } = data.minimum_weather_requirements
        return crosswind_knots <= wind_speed_knots
      }
      return true
    },
    {
      message: 'Crosswind limit cannot exceed total wind speed limit',
      path: ['minimum_weather_requirements', 'crosswind_knots'],
    }
  )

export type AircraftFormValues = z.infer<typeof aircraftSchema>

// Common aircraft categories
export const AIRCRAFT_CATEGORIES = [
  'Airplane Single-Engine Land (ASEL)',
  'Airplane Multi-Engine Land (AMEL)',
  'Airplane Single-Engine Sea (ASES)',
  'Airplane Multi-Engine Sea (AMES)',
  'Helicopter',
  'Glider',
  'Light Sport Aircraft (LSA)',
] as const

// Helper to format hourly rate for display
export function formatHourlyRate(rate: number | null | undefined): string {
  if (rate === null || rate === undefined) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rate)
}

// Helper to format aircraft display name
export function formatAircraftName(aircraft: { tail_number: string; make: string; model: string }): string {
  return `${aircraft.tail_number} - ${aircraft.make} ${aircraft.model}`
}

// Status badge variants
export function getAircraftStatusVariant(isActive: boolean): 'default' | 'secondary' {
  return isActive ? 'default' : 'secondary'
}

export function getAircraftStatusLabel(isActive: boolean): string {
  return isActive ? 'Active' : 'Inactive'
}

