'use client'

import { useWeatherConflicts } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import Link from 'next/link'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Sparkles, Clock, CloudRain } from 'lucide-react'

/**
 * Weather Alerts Component
 * 
 * Displays active weather conflicts for user's bookings.
 * Updates in real-time via Supabase Realtime subscriptions.
 */

interface WeatherConflict {
  id: string
  booking_id: string
  detected_at: string
  status: string
  conflict_reasons: string[]
  weather_data: any
  booking: {
    id: string
    scheduled_start: string
    scheduled_end: string
    departure_airport: string
    destination_airport?: string
    student: {
      full_name: string
    }
    instructor: {
      full_name: string
    }
    aircraft: {
      tail_number: string
      make: string
      model: string
    }
  }
}

export function WeatherAlerts({ userId }: { userId: string }) {
  const { data: conflicts, isLoading, error } = useWeatherConflicts(userId)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Alerts</AlertTitle>
        <AlertDescription>
          Unable to load weather alerts. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">☀️</div>
        <p className="text-muted-foreground text-sm">All clear! No weather conflicts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(conflicts as unknown as WeatherConflict[]).map((conflict) => (
        <Alert key={conflict.id} variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Weather Conflict
            <span className="text-xs font-normal opacity-70">
              {format(new Date(conflict.booking.scheduled_start), 'MMM d, h:mm a')}
            </span>
          </AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-xs opacity-80">
                <CloudRain className="inline h-3 w-3 mr-1" />
                {conflict.booking.departure_airport}
                {conflict.booking.destination_airport && ` → ${conflict.booking.destination_airport}`}
              </p>

              <div className="space-y-1">
                {conflict.conflict_reasons.slice(0, 3).map((reason, idx) => (
                  <p key={idx} className="text-xs">
                    • {reason}
                  </p>
                ))}
                {conflict.conflict_reasons.length > 3 && (
                  <p className="text-xs italic opacity-70">
                    + {conflict.conflict_reasons.length - 3} more issues
                  </p>
                )}
              </div>

              {conflict.status === 'proposals_ready' ? (
                <Link
                  href={`/dashboard/student?conflict=${conflict.id}`}
                  className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 hover:underline"
                >
                  View AI Proposals →
                </Link>
              ) : conflict.status === 'ai_processing' ? (
                <p className="mt-2 text-xs italic text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  AI is generating reschedule proposals...
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Processing conflict...
                </p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}

