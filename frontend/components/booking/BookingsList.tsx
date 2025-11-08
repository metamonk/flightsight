'use client'

import { useBookings } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Bookings List Component
 * 
 * Displays upcoming flight bookings for a student.
 * Uses React Query for data fetching and caching.
 */
export function BookingsList({ userId }: { userId: string }) {
  const { data: bookings, isLoading, error } = useBookings(userId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-destructive font-medium">Error loading bookings</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!bookings || bookings.length === 0) {
    return (
      <Card className="text-center py-8">
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
      {bookings.map((booking: any) => (
        <Card
          key={booking.id}
          className="hover:border-primary/50 transition-colors"
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {booking.lesson_type.replace('_', ' ').toUpperCase()}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {booking.aircraft?.registration || 'Aircraft TBD'}
                </p>
              </div>
              <Badge 
                variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
              >
                {booking.status}
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
      ))}
    </div>
  )
}

