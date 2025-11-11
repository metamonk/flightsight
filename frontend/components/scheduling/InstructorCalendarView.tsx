/**
 * Instructor Calendar View Component
 * 
 * Schedule-X calendar implementation for instructor dashboard.
 * Displays confirmed lessons and allows management of teaching schedule.
 */

'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { CalendarEvent } from '@schedule-x/calendar'
import { toast } from 'sonner'

import { ScheduleXCalendarWrapper } from './ScheduleXCalendar'
import { useInstructorBookings, useWeatherConflicts } from '@/lib/queries/bookings'
import {
  transformBookingsToEvents,
  transformConflictsToBackground,
  type BookingData,
} from '@/lib/schedule-x/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react'

export interface InstructorCalendarViewProps {
  /** User ID of the instructor */
  instructorId: string
  
  /** Initial date to display (ISO string) */
  initialDate?: string
  
  /** Initial view ('day' | 'week' | 'month-grid') */
  initialView?: 'day' | 'week' | 'month-grid'
  
  /** Custom height for calendar */
  height?: string | number
  
  /** Show loading skeleton */
  showSkeleton?: boolean
}

/**
 * InstructorCalendarView Component
 * 
 * Main calendar view for instructor dashboard with lessons and availability
 */
export function InstructorCalendarView({
  instructorId,
  initialDate,
  initialView = 'week',
  height = '800px',
  showSkeleton = true,
}: InstructorCalendarViewProps) {
  const router = useRouter()
  
  // Fetch bookings where user is the instructor
  const { data: bookings, isLoading: bookingsLoading, error: bookingsError } = useInstructorBookings(instructorId)
  const { data: conflicts, isLoading: conflictsLoading } = useWeatherConflicts(instructorId)
  
  // Transform bookings to Schedule-X events
  const calendarEvents = useMemo(() => {
    if (!bookings) return []
    return transformBookingsToEvents(bookings as BookingData[], conflicts || [])
  }, [bookings, conflicts])
  
  // Transform weather conflicts to background events
  const backgroundEvents = useMemo(() => {
    if (!conflicts) return []
    return transformConflictsToBackground(conflicts)
  }, [conflicts])
  
  /**
   * Handle event click - navigate to booking details
   */
  const handleEventClick = useCallback((event: CalendarEvent) => {
    const bookingId = event._customContent?.bookingId || event.id
    
    // Navigate to booking detail page
    router.push(`/dashboard/booking/${bookingId}`)
  }, [router])
  
  /**
   * Handle click on empty date/time slot
   * Instructors might want to set availability or view open slots
   */
  const handleClickDateTime = useCallback((_dateTime: Temporal.ZonedDateTime) => {
    toast.info('📅 Open time slot', {
      description: 'Click "Manage Availability" to set your teaching hours',
      duration: 3000,
    })
  }, [])
  
  // Loading state
  if (bookingsLoading || conflictsLoading) {
    return showSkeleton ? (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Teaching Schedule
          </CardTitle>
          <CardDescription>Loading your lessons...</CardDescription>
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
            Teaching Schedule
          </CardTitle>
          <CardDescription>No lessons scheduled yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <p className="text-lg font-medium mb-2">No upcoming lessons</p>
            <p className="text-sm text-muted-foreground mb-4">
              Students will book lessons with you based on your availability
            </p>
            <Button onClick={() => router.push('/dashboard/instructor/availability')}>
              Set Your Availability
            </Button>
          </div>
          
          {/* Still show the calendar for viewing open time slots */}
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Teaching Schedule
            </CardTitle>
            <CardDescription>
              {bookings.length} upcoming lesson{bookings.length !== 1 ? 's' : ''}
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
      <CardContent>
        <div className="mb-4 p-3 bg-accent/50 border border-border rounded-lg text-sm">
          💡 <strong>Tip:</strong> Click on lessons to view details. 
          Use "Manage Availability" to control when students can book with you.
        </div>
        
        <ScheduleXCalendarWrapper
          events={calendarEvents}
          backgroundEvents={backgroundEvents}
          selectedDate={initialDate}
          defaultView={initialView}
          callbacks={{
            onEventClick: handleEventClick,
            onClickDateTime: handleClickDateTime,
          }}
          enableDragDrop={false} // Instructors shouldn't drag student bookings
          enableResize={false}
          height={height}
          className="rounded-lg"
        />
      </CardContent>
    </Card>
  )
}

export default InstructorCalendarView

