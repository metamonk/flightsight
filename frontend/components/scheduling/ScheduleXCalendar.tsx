/**
 * Schedule-X Calendar Wrapper Component
 * 
 * Main wrapper for Schedule-X calendar with FlightSight-specific configuration.
 * Handles events, theming, callbacks, and timezone management.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import { createDragAndDropPlugin } from '@schedule-x/drag-and-drop'
import type { CalendarEvent } from '@schedule-x/calendar'
import 'temporal-polyfill/global'
import '@schedule-x/theme-default/dist/index.css'
import '@/lib/schedule-x/calendar-containment.css'

import { 
  defaultCalendarConfig, 
  calendarViews, 
  calendarCategories,
  getUserTimezone
} from '@/lib/schedule-x/config'
import { createDefaultCallbacks, createValidationCallback } from '@/lib/schedule-x/callbacks'
import type { CalendarCallbacks } from '@/lib/schedule-x/callbacks'

export interface ScheduleXCalendarProps {
  /** Events to display on the calendar */
  events?: CalendarEvent[]
  
  /** Background events (e.g., weather conflicts) */
  backgroundEvents?: CalendarEvent[]
  
  /** Initial selected date (ISO string or Temporal.PlainDate) */
  selectedDate?: string | Temporal.PlainDate
  
  /** Which view to show initially */
  defaultView?: 'day' | 'week' | 'month-grid' | 'month-agenda'
  
  /** Event callbacks */
  callbacks?: CalendarCallbacks
  
  /** Enable drag and drop */
  enableDragDrop?: boolean
  
  /** Enable resize */
  enableResize?: boolean
  
  /** Minimum hours in advance for bookings */
  minHoursAdvance?: number
  
  /** Enable debug logging */
  enableLogging?: boolean
  
  /** Custom CSS class */
  className?: string
  
  /** Calendar height */
  height?: string | number
}

/**
 * ScheduleXCalendar Component
 * 
 * Primary calendar component for FlightSight scheduling.
 * Integrates Schedule-X with our booking system and design.
 */
export function ScheduleXCalendarWrapper({
  events = [],
  backgroundEvents = [],
  selectedDate,
  defaultView = 'week',
  callbacks = {},
  enableDragDrop = true,
  enableResize = false,
  minHoursAdvance = 1,
  enableLogging = false,
  className = '',
  height = '800px'
}: ScheduleXCalendarProps) {
  // Create events service plugin (for programmatic event management)
  const [eventsService] = useState(() => createEventsServicePlugin())
  
  // Create drag and drop plugin
  const [dragDropPlugin] = useState(() => 
    enableDragDrop ? createDragAndDropPlugin(15) : undefined // 15-minute snapping
  )
  
  // Merge user callbacks with defaults
  const mergedCallbacks = {
    ...createDefaultCallbacks({
      onEventClick: callbacks.onEventClick,
      onEventUpdate: callbacks.onEventUpdate,
      onClickDateTime: callbacks.onClickDateTime,
      enableLogging
    }),
    ...(callbacks.onRangeUpdate && { onRangeUpdate: callbacks.onRangeUpdate }),
    ...(callbacks.onSelectedDateUpdate && { onSelectedDateUpdate: callbacks.onSelectedDateUpdate }),
    ...(callbacks.onBeforeEventUpdate || minHoursAdvance > 0 
      ? { onBeforeEventUpdate: callbacks.onBeforeEventUpdate || createValidationCallback({ minHoursAdvance }) }
      : {})
  }
  
  // Parse selected date
  const parsedDate = selectedDate 
    ? typeof selectedDate === 'string'
      ? Temporal.PlainDate.from(selectedDate)
      : selectedDate
    : Temporal.Now.plainDateISO()
  
  // Initialize calendar app
  const calendar = useCalendarApp({
    ...defaultCalendarConfig,
    defaultView,
    selectedDate: parsedDate,
    timezone: getUserTimezone(),
    views: calendarViews,
    calendars: calendarCategories,
    events: [...events, ...backgroundEvents],
    callbacks: mergedCallbacks,
    plugins: [
      eventsService,
      ...(dragDropPlugin ? [dragDropPlugin] : [])
    ].filter(Boolean)
  })
  
  // Update events when props change
  useEffect(() => {
    if (!eventsService) return
    
    // Get current events
    const currentEvents = eventsService.getAll()
    const currentEventIds = new Set(currentEvents.map(e => e.id))
    
    // Get new event IDs
    const allNewEvents = [...events, ...backgroundEvents]
    const newEventIds = new Set(allNewEvents.map(e => e.id))
    
    // Remove events that are no longer present
    currentEvents.forEach(event => {
      if (!newEventIds.has(event.id)) {
        eventsService.remove(event.id)
      }
    })
    
    // Add or update events
    allNewEvents.forEach(event => {
      if (currentEventIds.has(event.id)) {
        eventsService.update(event)
      } else {
        eventsService.add(event)
      }
    })
  }, [events, backgroundEvents, eventsService])
  
  return (
    <div 
      className={`schedule-x-wrapper ${className}`}
      style={{ 
        height: typeof height === 'number' ? `${height}px` : height,
        maxWidth: '100%',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate' // Create stacking context to contain absolute elements
      }}
    >
      <ScheduleXCalendar 
        calendarApp={calendar}
        // Apply our custom theme class
        className="sx-react-calendar-wrapper"
      />
    </div>
  )
}

export default ScheduleXCalendarWrapper

