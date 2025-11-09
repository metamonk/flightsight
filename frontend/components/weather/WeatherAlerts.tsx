'use client'

import { useState } from 'react'
import { useWeatherConflicts } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Sparkles, Clock, CloudRain, ChevronRight } from 'lucide-react'
import { WeatherConflictModal } from './WeatherConflictModal'

/**
 * Weather Alerts Component
 * 
 * Displays active weather conflicts for user's bookings.
 * Updates in real-time via Supabase Realtime subscriptions.
 * Click any alert to see detailed weather information.
 */

interface WeatherConflict {
  id: string
  booking_id: string
  detected_at: string
  status: string
  conflict_reasons: string[]
  weather_data: any
  resolved_at?: string
  booking: {
    id: string
    scheduled_start: string
    scheduled_end: string
    departure_airport: string
    destination_airport?: string
    lesson_type: string
    flight_type: string
    student: {
      full_name: string
      training_level?: string
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
  const [selectedConflict, setSelectedConflict] = useState<WeatherConflict | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleViewDetails = (conflict: WeatherConflict) => {
    setSelectedConflict(conflict)
    setModalOpen(true)
  }

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
    <>
      <div className="space-y-4">
        {(conflicts as unknown as WeatherConflict[]).map((conflict) => (
          <Alert 
            key={conflict.id} 
            variant="warning"
            className="cursor-pointer hover:border-destructive/50 transition-colors"
            onClick={() => handleViewDetails(conflict)}
          >
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

                <div className="flex items-center justify-between mt-3">
                  {conflict.status === 'proposals_ready' ? (
                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Proposals Ready
                    </span>
                  ) : conflict.status === 'ai_processing' ? (
                    <span className="text-xs italic text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Generating proposals...
                    </span>
                  ) : (
                    <span className="text-xs italic text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Processing...
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(conflict)
                    }}
                  >
                    <span className="text-xs flex items-center gap-1">
                      View Details
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </div>

      <WeatherConflictModal
        conflict={selectedConflict}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  )
}

