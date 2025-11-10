/**
 * Date/Time Formatting Utilities
 * 
 * Ensures consistent timezone handling across the application.
 * All dates in the database are stored in UTC, but displayed in user's local timezone.
 */

import { format as dateFnsFormat, parseISO } from 'date-fns'

/**
 * Format a UTC date string to user's local timezone
 * 
 * @param utcDateString - ISO 8601 date string from database (UTC)
 * @param formatString - date-fns format string (e.g., 'MMM d, yyyy', 'h:mm a')
 * @returns Formatted string in user's local timezone
 * 
 * @example
 * formatLocalTime('2025-11-09T22:00:00.000Z', 'h:mm a')
 * // If user is in CST (UTC-6), returns: "4:00 PM"
 * // If user is in EST (UTC-5), returns: "5:00 PM"
 */
export function formatLocalTime(utcDateString: string, formatString: string): string {
  if (!utcDateString) return ''
  
  try {
    // parseISO creates a Date object from the UTC string
    // The Date object automatically represents this in the browser's local timezone
    const date = parseISO(utcDateString)
    
    // format() then displays it in the local timezone
    return dateFnsFormat(date, formatString)
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', utcDateString)
    return 'Invalid date'
  }
}

/**
 * Convert local datetime-local input to UTC ISO string
 * This is used when submitting forms with datetime-local inputs
 * 
 * @param datetimeLocalValue - Value from datetime-local input (e.g., "2025-11-09T16:00")
 * @returns UTC ISO string for database storage
 * 
 * @example
 * // User in CST (UTC-6) selects 4:00 PM local time
 * localToUTC('2025-11-09T16:00')
 * // Returns: "2025-11-09T22:00:00.000Z" (10:00 PM UTC)
 */
export function localToUTC(datetimeLocalValue: string): string {
  if (!datetimeLocalValue) return ''
  
  // datetime-local gives us "YYYY-MM-DDTHH:mm" in local time
  // new Date() will parse this as local time, then toISOString() converts to UTC
  return new Date(datetimeLocalValue).toISOString()
}

/**
 * Convert UTC ISO string to datetime-local format
 * This is used when populating datetime-local inputs with existing data
 * 
 * @param utcDateString - ISO 8601 date string from database (UTC)
 * @returns Local datetime string in format "YYYY-MM-DDTHH:mm"
 * 
 * @example
 * // Database has: "2025-11-09T22:00:00.000Z" (10:00 PM UTC)
 * // User in CST (UTC-6)
 * utcToLocal('2025-11-09T22:00:00.000Z')
 * // Returns: "2025-11-09T16:00" (4:00 PM local)
 */
export function utcToLocal(utcDateString: string): string {
  if (!utcDateString) return ''
  
  try {
    const date = parseISO(utcDateString)
    
    // Get local time components
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Error converting UTC to local:', error)
    return ''
  }
}

/**
 * Get user's current timezone name
 * @example "America/Chicago", "America/New_York"
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}
