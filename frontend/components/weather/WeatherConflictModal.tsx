'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'
import { AlertTriangle, Cloud, Wind, Eye, Gauge, CloudRain, Thermometer, Droplets, X } from 'lucide-react'

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

interface WeatherConflictModalProps {
  conflict: WeatherConflict | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Weather Conflict Detail Modal
 * 
 * Shows detailed weather information and conflict reasons for a specific booking.
 * Displays weather data from all checkpoints (departure, enroute, destination).
 */
export function WeatherConflictModal({ conflict, open, onOpenChange }: WeatherConflictModalProps) {
  if (!conflict) return null

  const { booking, weather_data, conflict_reasons, status } = conflict

  // Extract weather conditions from checkpoints
  const checkpoints = weather_data?.checkpoints || []
  const departureWeather = checkpoints[0]
  const enrouteWeather = checkpoints[1]
  const destinationWeather = checkpoints[2]

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'detected':
        return 'destructive'
      case 'ai_processing':
        return 'secondary'
      case 'proposals_ready':
        return 'default'
      case 'resolved':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  // Format weather condition text
  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Weather metric card component
  const WeatherMetric = ({ 
    icon: Icon, 
    label, 
    value, 
    unit, 
    isBad 
  }: { 
    icon: any
    label: string
    value: string | number
    unit?: string
    isBad?: boolean
  }) => (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${isBad ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/50'}`}>
      <Icon className={`h-5 w-5 ${isBad ? 'text-destructive' : 'text-muted-foreground'}`} />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-semibold ${isBad ? 'text-destructive' : ''}`}>
          {value}{unit && <span className="text-xs ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Weather Conflict Detected
              </DialogTitle>
              <DialogDescription className="mt-2">
                Detected {format(new Date(conflict.detected_at), 'MMM d, yyyy • h:mm a')}
              </DialogDescription>
            </div>
            <Badge variant={getStatusVariant(status)}>
              {status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{booking.lesson_type}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(booking.scheduled_start), 'EEEE, MMMM d, yyyy • h:mm a')} - {format(new Date(booking.scheduled_end), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Student</p>
                  <p className="font-medium">{booking.student.full_name}</p>
                  {booking.student.training_level && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {booking.student.training_level.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground">Instructor</p>
                  <p className="font-medium">{booking.instructor.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Aircraft</p>
                  <p className="font-medium">{booking.aircraft.tail_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.aircraft.make} {booking.aircraft.model}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conflict Reasons */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Why This Flight Cannot Proceed
            </h3>
            <div className="space-y-2">
              {conflict_reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <X className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weather Details by Checkpoint */}
          {checkpoints.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Weather Conditions</h3>
              <div className="space-y-4">
                {/* Departure */}
                {departureWeather && (
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <CloudRain className="h-4 w-4" />
                        <h4 className="font-semibold">Departure: {booking.departure_airport}</h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <WeatherMetric
                          icon={Cloud}
                          label="Condition"
                          value={formatCondition(departureWeather.condition)}
                          isBad={departureWeather.hasThunderstorms || departureWeather.hasIcing}
                        />
                        <WeatherMetric
                          icon={Eye}
                          label="Visibility"
                          value={departureWeather.visibility_miles}
                          unit="mi"
                          isBad={departureWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Gauge}
                          label="Ceiling"
                          value={departureWeather.ceiling_ft}
                          unit="ft"
                          isBad={departureWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Wind}
                          label="Wind"
                          value={`${departureWeather.wind_speed_knots} @ ${departureWeather.wind_direction_deg}°`}
                          unit="kt"
                          isBad={departureWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Thermometer}
                          label="Temperature"
                          value={departureWeather.temp_f}
                          unit="°F"
                        />
                        <WeatherMetric
                          icon={Droplets}
                          label="Cloud Cover"
                          value={departureWeather.cloud_cover_pct}
                          unit="%"
                          isBad={departureWeather.meetsMinimums === false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Enroute */}
                {enrouteWeather && (
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <CloudRain className="h-4 w-4" />
                        <h4 className="font-semibold">Enroute Conditions</h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <WeatherMetric
                          icon={Cloud}
                          label="Condition"
                          value={formatCondition(enrouteWeather.condition)}
                          isBad={enrouteWeather.hasThunderstorms || enrouteWeather.hasIcing}
                        />
                        <WeatherMetric
                          icon={Eye}
                          label="Visibility"
                          value={enrouteWeather.visibility_miles}
                          unit="mi"
                          isBad={enrouteWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Wind}
                          label="Wind"
                          value={`${enrouteWeather.wind_speed_knots} @ ${enrouteWeather.wind_direction_deg}°`}
                          unit="kt"
                          isBad={enrouteWeather.meetsMinimums === false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Destination */}
                {destinationWeather && booking.destination_airport && (
                  <Card>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <CloudRain className="h-4 w-4" />
                        <h4 className="font-semibold">Destination: {booking.destination_airport}</h4>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <WeatherMetric
                          icon={Cloud}
                          label="Condition"
                          value={formatCondition(destinationWeather.condition)}
                          isBad={destinationWeather.hasThunderstorms || destinationWeather.hasIcing}
                        />
                        <WeatherMetric
                          icon={Eye}
                          label="Visibility"
                          value={destinationWeather.visibility_miles}
                          unit="mi"
                          isBad={destinationWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Gauge}
                          label="Ceiling"
                          value={destinationWeather.ceiling_ft}
                          unit="ft"
                          isBad={destinationWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Wind}
                          label="Wind"
                          value={`${destinationWeather.wind_speed_knots} @ ${destinationWeather.wind_direction_deg}°`}
                          unit="kt"
                          isBad={destinationWeather.meetsMinimums === false}
                        />
                        <WeatherMetric
                          icon={Thermometer}
                          label="Temperature"
                          value={destinationWeather.temp_f}
                          unit="°F"
                        />
                        <WeatherMetric
                          icon={Droplets}
                          label="Cloud Cover"
                          value={destinationWeather.cloud_cover_pct}
                          unit="%"
                          isBad={destinationWeather.meetsMinimums === false}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {status === 'proposals_ready' ? (
                <span className="flex items-center gap-2 text-primary font-medium">
                  ✨ AI Proposals Available
                </span>
              ) : status === 'ai_processing' ? (
                <span className="flex items-center gap-2">
                  ⏳ AI is generating alternative schedules...
                </span>
              ) : status === 'resolved' ? (
                <span className="flex items-center gap-2 text-green-600">
                  ✅ Resolved {conflict.resolved_at && `on ${format(new Date(conflict.resolved_at), 'MMM d')}`}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  🔍 Processing conflict...
                </span>
              )}
            </div>
            {status === 'proposals_ready' && (
              <Button
                onClick={() => {
                  onOpenChange(false)
                  // Scroll to proposals section after modal closes
                  setTimeout(() => {
                    const proposalsSection = document.querySelector('[data-proposals-section]')
                    proposalsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }, 300)
                }}
              >
                View AI Proposals →
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

