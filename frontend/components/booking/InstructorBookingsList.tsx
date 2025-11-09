'use client'

import { useInstructorBookings, useWeatherConflicts } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, CloudRain } from 'lucide-react'
import { useMemo } from 'react'
import Link from 'next/link'

/**
 * Instructor Bookings List Component
 * 
 * Displays all upcoming flight bookings where the user is the instructor.
 * Shows student information and weather status for each booking.
 */
export function InstructorBookingsList({ instructorId }: { instructorId: string }) {
  const { data: bookings, isLoading, error } = useInstructorBookings(instructorId)
  const { data: conflicts } = useWeatherConflicts(instructorId)

  // Create a map of booking IDs to their weather conflicts
  const weatherConflictMap = useMemo(() => {
    const map = new Map()
    if (conflicts && Array.isArray(conflicts)) {
      conflicts.forEach((conflict: any) => {
        if (conflict.booking_id && conflict.status !== 'resolved') {
          map.set(conflict.booking_id, conflict)
        }
      })
    }
    return map
  }, [conflicts])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center">
        <CardContent>
          <p className="text-destructive font-medium">Error loading bookings</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="text-center">
        <CardContent>
          <div className="text-6xl mb-4">📅</div>
          <p className="text-muted-foreground text-lg">No upcoming lessons scheduled</p>
          <p className="text-sm text-muted-foreground mt-2">
            Your schedule will appear here once students book lessons
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking: any) => {
        const weatherConflict = weatherConflictMap.get(booking.id)
        const hasWeatherIssue = !!weatherConflict

        return (
          <Link key={booking.id} href={`/dashboard/booking/${booking.id}`}>
            <Card
              className={`hover:border-primary/50 hover:shadow-md transition-all cursor-pointer ${hasWeatherIssue ? 'border-destructive/30' : ''}`}
            >
              <CardContent>
                {/* Header with student name and status */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                        👤 {booking.student?.name || 'Student Name'}
                      </h3>
                      {hasWeatherIssue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Weather
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.student?.email || 'student@email.com'}
                    </p>
                    {hasWeatherIssue && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <CloudRain className="h-3 w-3" />
                        {weatherConflict.conflict_reasons?.[0] || 'Weather conflict detected'}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={
                      hasWeatherIssue ? 'destructive' :
                      booking.status === 'confirmed' 
                        ? 'default' 
                        : booking.status === 'pending'
                        ? 'secondary'
                        : booking.status === 'weather_hold' || booking.status === 'rescheduling'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {hasWeatherIssue ? 'Weather Issue' : booking.status === 'pending' ? 'Needs Confirmation' : booking.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Lesson details */}
                <Card className="bg-muted/50 mb-3">
                  <CardContent>
                    <p className="font-medium text-foreground mb-1">
                      {booking.lesson_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aircraft: {booking.aircraft?.registration || 'TBD'} ({booking.aircraft?.make} {booking.aircraft?.model})
                    </p>
                  </CardContent>
                </Card>

                {/* Schedule info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>📅</span>
                    <span className="font-medium">
                      {format(new Date(booking.scheduled_start), 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>🕐</span>
                    <span className="font-medium">
                      {format(new Date(booking.scheduled_start), 'h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>⏱️</span>
                    <span>{booking.duration_minutes || 60} min</span>
                  </div>
                </div>

                {/* Status indicators */}
                {booking.status === 'pending' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-primary/80 flex items-center gap-1">
                      ⏳ Awaiting your confirmation - Click to review
                    </p>
                  </div>
                )}
                {booking.status === 'weather_hold' && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-destructive/80 flex items-center gap-1">
                      ⚠️ Weather hold - Reschedule proposals available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

