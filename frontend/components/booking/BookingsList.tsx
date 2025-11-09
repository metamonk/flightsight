'use client'

import { useBookings, useWeatherConflicts } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CloudRain, AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'

/**
 * Bookings List Component
 * 
 * Displays upcoming flight bookings for a student with weather status badges.
 * Uses React Query for data fetching and caching.
 */
export function BookingsList({ userId }: { userId: string }) {
  const { data: bookings, isLoading, error } = useBookings(userId)
  const { data: conflicts } = useWeatherConflicts(userId)

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
              <Skeleton className="h-24 w-full" />
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
          <p className="text-muted-foreground">No upcoming flights scheduled</p>
          <Button className="mt-4">
            Schedule a Lesson
          </Button>
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
          <Card
            key={booking.id}
            className={`hover:border-primary/50 transition-colors ${hasWeatherIssue ? 'border-destructive/30' : ''}`}
          >
            <CardContent>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {booking.lesson_type.replace('_', ' ').toUpperCase()}
                    </h3>
                    {hasWeatherIssue && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Weather Alert
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {booking.aircraft?.registration || 'Aircraft TBD'}
                  </p>
                  {hasWeatherIssue && (
                    <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                      <CloudRain className="h-3 w-3" />
                      {weatherConflict.conflict_reasons?.[0] || 'Unsafe weather conditions detected'}
                    </p>
                  )}
                </div>
                <Badge 
                  variant={
                    hasWeatherIssue ? 'destructive' : 
                    booking.status === 'confirmed' ? 'default' : 'secondary'
                  }
                >
                  {hasWeatherIssue ? 'Weather Issue' : booking.status}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{format(new Date(booking.scheduled_start), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🕐</span>
                  <span>{format(new Date(booking.scheduled_start), 'h:mm a')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👨‍✈️</span>
                  <span>{booking.instructor?.name || 'Instructor TBD'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

