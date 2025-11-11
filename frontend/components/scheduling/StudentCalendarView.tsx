/**
 * Student Calendar View Component
 * 
 * Schedule-X calendar implementation for student dashboard.
 * Displays upcoming bookings with weather conflicts and supports
 * drag-and-drop rescheduling.
 */

'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@schedule-x/calendar'
import { toast } from 'sonner'

import { ScheduleXCalendarWrapper } from './ScheduleXCalendar'
import { useBookings, useWeatherConflicts } from '@/lib/queries/bookings'
import {
  transformBookingsToEvents,
  transformConflictsToBackground,
  extractEventTimes,
  type BookingData,
} from '@/lib/schedule-x/events'
import { BookLessonButton } from '@/components/booking/BookLessonButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react'
import { RescheduleDialog } from '@/components/booking/RescheduleDialog'

export interface StudentCalendarViewProps {
  /** User ID of the student */
  userId: string
  
  /** Initial date to display (ISO string) */
  initialDate?: string
  
  /** Initial view ('day' | 'week' | 'month-grid') */
  initialView?: 'day' | 'week' | 'month-grid'
  
  /** Enable drag-and-drop rescheduling */
  enableRescheduling?: boolean
  
  /** Custom height for calendar */
  height?: string | number
  
  /** Show loading skeleton */
  showSkeleton?: boolean
}

/**
 * StudentCalendarView Component
 * 
 * Main calendar view for student dashboard with bookings and weather conflicts
 */
export function StudentCalendarView({
  userId,
  initialDate,
  initialView = 'week',
  enableRescheduling = true,
  height = '800px',
  showSkeleton = true,
}: StudentCalendarViewProps) {
  const router = useRouter()
  
  // Fetch bookings and weather conflicts
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useBookings(userId)
  const { data: conflicts, isLoading: conflictsLoading } = useWeatherConflicts(userId)
  
  // State for reschedule dialog
  const [rescheduleBookingId, setRescheduleBookingId] = useState<string | null>(null)
  const [proposedStartTime, setProposedStartTime] = useState<string | null>(null)
  const [proposedEndTime, setProposedEndTime] = useState<string | null>(null)
  
  // Transform bookings to Schedule-X events
  const calendarEvents = useMemo(() => {
    if (!bookings) return []
    return transformBookingsToEvents(bookings as any as BookingData[], conflicts as any || [])
  }, [bookings, conflicts])

  // Transform weather conflicts to background events
  const backgroundEvents = useMemo(() => {
    if (!conflicts) return []
    return transformConflictsToBackground(conflicts as any)
  }, [conflicts])

  /**
   * Handle event click - navigate to booking details
   */
  const handleEventClick = useCallback((event: CalendarEvent) => {
    const bookingId = (event._customContent as any)?.bookingId || event.id
    
    // Navigate to booking detail page
    router.push(`/dashboard/booking/${bookingId}`)
  }, [router])
  
  /**
   * Handle event drag/drop - open reschedule confirmation dialog
   */
  const handleEventUpdate = useCallback((event: CalendarEvent) => {
    if (!enableRescheduling) {
      toast.error('Drag-and-drop rescheduling is disabled')
      return
    }
    
    const bookingId = (event._customContent as any)?.bookingId || event.id
    const hasWeatherConflict = (event._customContent as any)?.hasWeatherConflict
    
    // Extract new times from dragged event
    const { scheduled_start, scheduled_end } = extractEventTimes(event)
    
    // Store proposed times
    setProposedStartTime(scheduled_start)
    setProposedEndTime(scheduled_end)
    setRescheduleBookingId(bookingId)
    
    // Show appropriate message based on conflict status
    if (hasWeatherConflict) {
      toast.info('⚠️ Rescheduling a booking with weather conflict', {
        description: 'Please confirm the new time slot',
      })
    } else {
      toast.info('✈️ Confirm rescheduling', {
        description: 'Drag complete - confirm your new time',
      })
    }
  }, [enableRescheduling])
  
  /**
   * Handle click on empty date/time slot - open booking form
   */
  const handleClickDateTime = useCallback((dateTime: Temporal.ZonedDateTime) => {
    // Format the datetime for the booking form
    const isoString = dateTime.toString()
    
    toast.info('📅 Create new booking', {
      description: 'Opening booking form...',
      duration: 2000,
    })
    
    // Navigate to booking form with pre-filled time
    // (In a real implementation, you might open a dialog instead)
    const url = new URL(window.location.href)
    url.searchParams.set('date', isoString)
    router.push(url.pathname + url.search)
  }, [router])
  
  /**
   * Handle reschedule dialog close
   */
  const handleRescheduleClose = useCallback(() => {
    setRescheduleBookingId(null)
    setProposedStartTime(null)
    setProposedEndTime(null)
  }, [])
  
  // Loading state
  if (bookingsLoading || conflictsLoading) {
    return showSkeleton ? (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Flight Schedule
          </CardTitle>
          <CardDescription>Loading your upcoming flights...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[800px] w-full" />
        </CardContent>
      </Card>
    ) : (
      <div className="flex items-center justify-center h-[800px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (bookingsError) {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Calendar
          </CardTitle>
          <CardDescription>
            {(bookingsError as Error).message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Reload Calendar
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Empty state
  if (!bookings || bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Flight Schedule
          </CardTitle>
          <CardDescription>No upcoming flights scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-lg font-medium mb-2">No flights scheduled yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Click on the calendar to schedule your first lesson
            </p>
            <BookLessonButton />
          </div>
          
          {/* Still show the calendar for date selection */}
          <div className="mt-6">
            <ScheduleXCalendarWrapper
              events={[]}
              backgroundEvents={[]}
              selectedDate={initialDate}
              defaultView={initialView}
              callbacks={{
                onClickDateTime: handleClickDateTime,
              }}
              enableDragDrop={false}
              height={height}
            />
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Flight Schedule
              </CardTitle>
              <CardDescription>
                {bookings.length} upcoming flight{bookings.length !== 1 ? 's' : ''}
                {conflicts && conflicts.length > 0 && (
                  <span className="text-destructive font-medium ml-2">
                    • {conflicts.length} weather conflict{conflicts.length !== 1 ? 's' : ''}
                  </span>
                )}
              </CardDescription>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">Scheduled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Weather Issue</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          {enableRescheduling && (
            <div className="mb-4 p-3 bg-accent/50 border border-border rounded-lg text-sm">
              💡 <strong>Tip:</strong> Drag and drop bookings to reschedule them. 
              Click empty time slots to create new bookings.
            </div>
          )}
          
          <div className="relative overflow-hidden rounded-lg">
            <ScheduleXCalendarWrapper
              events={calendarEvents}
              backgroundEvents={backgroundEvents}
              selectedDate={initialDate}
              defaultView={initialView}
              callbacks={{
                onEventClick: handleEventClick,
                onEventUpdate: handleEventUpdate,
                onClickDateTime: handleClickDateTime,
              }}
              enableDragDrop={enableRescheduling}
              enableResize={false}
              minHoursAdvance={1} // Require 1 hour advance notice
              height={height}
              className="rounded-lg"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Reschedule Confirmation Dialog */}
      {rescheduleBookingId && proposedStartTime && proposedEndTime && (
        <RescheduleDialog
          bookingId={rescheduleBookingId}
          proposedStart={proposedStartTime}
          proposedEnd={proposedEndTime}
          open={!!rescheduleBookingId}
          onClose={handleRescheduleClose}
        />
      )}
    </>
  )
}

export default StudentCalendarView

