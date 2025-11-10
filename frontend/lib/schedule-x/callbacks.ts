/**
 * Schedule-X Callbacks
 * 
 * Event handlers for Schedule-X calendar interactions.
 * Provides type-safe callbacks for common calendar actions.
 */

import type { CalendarEvent } from '@schedule-x/calendar'
import type { Temporal } from 'temporal-polyfill'

/**
 * Callback function types
 */
export interface CalendarCallbacks {
  /** User clicks an event */
  onEventClick?: (event: CalendarEvent) => void | Promise<void>
  
  /** User updates event (drag/drop/resize) */
  onEventUpdate?: (updatedEvent: CalendarEvent) => void | Promise<void>
  
  /** User clicks empty time slot */
  onClickDateTime?: (dateTime: Temporal.ZonedDateTime) => void | Promise<void>
  
  /** User clicks empty date (month view) */
  onClickDate?: (date: Temporal.PlainDate) => void | Promise<void>
  
  /** Calendar range changes (navigation) */
  onRangeUpdate?: (range: { start: Temporal.PlainDate; end: Temporal.PlainDate }) => void | Promise<void>
  
  /** Selected date changes */
  onSelectedDateUpdate?: (date: Temporal.PlainDate) => void | Promise<void>
  
  /** Before event update - return false to cancel */
  onBeforeEventUpdate?: (oldEvent: CalendarEvent, newEvent: CalendarEvent) => boolean | Promise<boolean>
}

/**
 * Create default callbacks with common patterns
 */
export function createDefaultCallbacks(options?: {
  onEventClick?: CalendarCallbacks['onEventClick']
  onEventUpdate?: CalendarCallbacks['onEventUpdate']
  onClickDateTime?: CalendarCallbacks['onClickDateTime']
  enableLogging?: boolean
}): Required<Omit<CalendarCallbacks, 'onBeforeEventUpdate'>> {
  const log = options?.enableLogging 
    ? (action: string, data: any) => console.log(`[Schedule-X] ${action}:`, data)
    : () => {}
  
  return {
    onEventClick: (event) => {
      log('Event clicked', { id: event.id, title: event.title })
      options?.onEventClick?.(event)
    },
    
    onEventUpdate: (event) => {
      log('Event updated', { 
        id: event.id, 
        start: event.start.toString(), 
        end: event.end.toString() 
      })
      options?.onEventUpdate?.(event)
    },
    
    onClickDateTime: (dateTime) => {
      log('DateTime clicked', dateTime.toString())
      options?.onClickDateTime?.(dateTime)
    },
    
    onClickDate: (date) => {
      log('Date clicked', date.toString())
    },
    
    onRangeUpdate: (range) => {
      log('Range updated', { 
        start: range.start.toString(), 
        end: range.end.toString() 
      })
    },
    
    onSelectedDateUpdate: (date) => {
      log('Selected date updated', date.toString())
    }
  }
}

/**
 * Validation callback for drag/drop
 * Prevents moving events to invalid times
 */
export function createValidationCallback(options?: {
  /** Minimum hours in advance for booking */
  minHoursAdvance?: number
  /** Business hours start (24h format) */
  businessHoursStart?: number
  /** Business hours end (24h format) */
  businessHoursEnd?: number
}): CalendarCallbacks['onBeforeEventUpdate'] {
  const { 
    minHoursAdvance = 1, 
    businessHoursStart = 6, 
    businessHoursEnd = 22 
  } = options || {}
  
  return (oldEvent, newEvent) => {
    const start = newEvent.start as Temporal.ZonedDateTime
    const end = newEvent.end as Temporal.ZonedDateTime
    const now = Temporal.Now.zonedDateTimeISO()
    
    // Check 1: Must be in the future
    const hoursUntilStart = (start.epochMilliseconds - now.epochMilliseconds) / (1000 * 60 * 60)
    if (hoursUntilStart < minHoursAdvance) {
      console.warn('Cannot schedule booking less than', minHoursAdvance, 'hour(s) in advance')
      return false
    }
    
    // Check 2: Must be within business hours
    const startHour = start.hour
    const endHour = end.hour
    if (startHour < businessHoursStart || endHour > businessHoursEnd) {
      console.warn('Booking must be within business hours:', businessHoursStart, '-', businessHoursEnd)
      return false
    }
    
    // Check 3: End must be after start
    if (end.epochMilliseconds <= start.epochMilliseconds) {
      console.warn('End time must be after start time')
      return false
    }
    
    return true
  }
}

