/**
 * Schedule-X Configuration
 * 
 * Central configuration for Schedule-X calendar instances.
 * Ensures consistent behavior across all calendar views.
 */

import { 
  createViewDay, 
  createViewWeek, 
  createViewMonthGrid,
  createViewMonthAgenda 
} from '@schedule-x/calendar'
import type { CalendarConfig } from '@schedule-x/calendar'

/**
 * Default calendar configuration
 * Used as base for all Schedule-X instances
 */
export const defaultCalendarConfig: Partial<CalendarConfig> = {
  // Week starts on Sunday (US standard for flight training)
  firstDayOfWeek: 0,
  
  // Use system locale
  locale: 'en-US',
  
  // Default to week view (most useful for scheduling)
  defaultView: 'week',
  
  // Day boundaries (flight training typically 6 AM - 10 PM)
  dayBoundaries: {
    start: '06:00',
    end: '22:00'
  },
  
  // Week view configuration
  weekOptions: {
    gridHeight: 2400, // Total height in pixels
    nDays: 7, // Show full week
    eventWidth: 95, // Event width percentage
    gridStep: 15 // 15-minute intervals
  },
  
  // Month grid options
  monthGridOptions: {
    nEventsPerDay: 3 // Show up to 3 events before "+X more"
  }
}

/**
 * Available calendar views
 * Create all views with consistent configuration
 */
export const calendarViews = [
  createViewDay(),
  createViewWeek(),
  createViewMonthGrid(),
  createViewMonthAgenda()
]

/**
 * Calendar categories for different booking types
 * Maps to booking status and lesson types
 */
export const calendarCategories = {
  // Booking status categories
  scheduled: {
    colorName: 'scheduled',
    lightColors: {
      main: '#10b981', // green-500
      container: '#d1fae5', // green-100
      onContainer: '#064e3b' // green-900
    },
    darkColors: {
      main: '#6ee7b7', // green-300
      onContainer: '#d1fae5', // green-100
      container: '#065f46' // green-800
    }
  },
  pending: {
    colorName: 'pending',
    lightColors: {
      main: '#f59e0b', // amber-500
      container: '#fef3c7', // amber-100
      onContainer: '#78350f' // amber-900
    },
    darkColors: {
      main: '#fbbf24', // amber-400
      onContainer: '#fef3c7', // amber-100
      container: '#92400e' // amber-800
    }
  },
  weatherConflict: {
    colorName: 'weather-conflict',
    lightColors: {
      main: '#ef4444', // red-500
      container: '#fee2e2', // red-100
      onContainer: '#7f1d1d' // red-900
    },
    darkColors: {
      main: '#f87171', // red-400
      onContainer: '#fee2e2', // red-100
      container: '#991b1b' // red-800
    }
  },
  cancelled: {
    colorName: 'cancelled',
    lightColors: {
      main: '#6b7280', // gray-500
      container: '#f3f4f6', // gray-100
      onContainer: '#1f2937' // gray-800
    },
    darkColors: {
      main: '#9ca3af', // gray-400
      onContainer: '#f3f4f6', // gray-100
      container: '#374151' // gray-700
    }
  }
}

/**
 * Get calendar category ID based on booking status
 */
export function getCalendarCategoryId(
  status: 'scheduled' | 'pending' | 'cancelled' | string,
  hasWeatherConflict: boolean = false
): keyof typeof calendarCategories {
  if (hasWeatherConflict) return 'weatherConflict'
  if (status === 'scheduled') return 'scheduled'
  if (status === 'pending') return 'pending'
  if (status === 'cancelled') return 'cancelled'
  return 'pending' // default fallback
}

/**
 * Timezone configuration
 * Uses browser's local timezone by default
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

