'use client'

import { useWeatherConflicts, useAcceptProposal, useRejectProposal } from '@/lib/queries/bookings'
import { formatLocalTime } from '@/lib/utils/date'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, Sparkles, Clock, CloudRain, Cloud, Wind, Eye, Gauge, Thermometer, Droplets, ChevronDown, ChevronUp } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ProposalCard } from '@/components/proposals/ProposalCard'
import { useState } from 'react'

/**
 * Weather Alerts Component with Inline Proposals
 * 
 * Displays active weather conflicts with expandable sections.
 * When proposals are ready, they appear inline within the alert.
 * Updates in real-time via Supabase Realtime subscriptions.
 */

interface WeatherConflict {
  id: string
  booking_id: string
  detected_at: string
  status: string
  conflict_reasons: string[]
  weather_data: any
  resolved_at?: string
  reschedule_proposals?: any[]
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
  const { mutate: acceptProposal, isPending: isAccepting } = useAcceptProposal()
  const { mutate: rejectProposal, isPending: isRejecting } = useRejectProposal()

  const handleAccept = (proposalId: string) => {
    if (confirm('Accept this reschedule proposal?')) {
      acceptProposal(proposalId)
    }
  }

  const handleReject = (proposalId: string) => {
    if (confirm('Decline this proposal? You can still accept other options.')) {
      rejectProposal(proposalId)
    }
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
        <div className="text-4xl mb-2" aria-hidden="true">☀️</div>
        <p className="text-muted-foreground text-sm">All clear! No weather conflicts.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {(conflicts as unknown as WeatherConflict[]).map((conflict) => {
        const proposals = (conflict.reschedule_proposals || [])
          .filter((p: any) => p.student_response !== 'rejected')
          .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
          .slice(0, 3)

        const hasProposals = proposals.length > 0

        return (
          <Accordion key={conflict.id} type="single" collapsible>
            <AccordionItem value={conflict.id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline [&[data-state=open]]:border-b">
                <div className="flex items-start justify-between w-full pr-2">
                  <div className="flex items-start gap-3 text-left">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Weather Conflict Detected</span>
                        {conflict.status === 'proposals_ready' && (
                          <Badge variant="default" className="text-xs gap-1">
                            <Sparkles className="h-3 w-3" />
                            Proposals Ready
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conflict.booking.lesson_type} • {formatLocalTime(conflict.booking.scheduled_start, 'EEE, MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4 pt-2">
                  {/* Flight Details */}
                  <Card className="bg-muted/30">
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Student</p>
                          <p className="font-medium">{conflict.booking.student.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Instructor</p>
                          <p className="font-medium">{conflict.booking.instructor.full_name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Aircraft</p>
                          <p className="font-medium">{conflict.booking.aircraft.tail_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {conflict.booking.aircraft.make} {conflict.booking.aircraft.model}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Violations */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      Why This Flight Cannot Proceed
                    </h4>
                    <div className="space-y-2">
                      {conflict.conflict_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs bg-destructive/5 border border-destructive/20 rounded-md p-2">
                          <span className="text-destructive">✕</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Weather Data */}
                  {conflict.weather_data && conflict.weather_data[0] && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        Current Conditions at {conflict.booking.departure_airport}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Card className="bg-muted/30">
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Cloud className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Cloud Cover</p>
                                <p className="text-sm font-medium">{conflict.weather_data[0].cloud_cover_percent}%</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Wind</p>
                                <p className="text-sm font-medium">{conflict.weather_data[0].wind_speed_knots} kts</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Visibility</p>
                                <p className="text-sm font-medium">{conflict.weather_data[0].visibility_miles} mi</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-muted/30">
                          <CardContent>
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs text-muted-foreground">Ceiling</p>
                                <p className="text-sm font-medium">{conflict.weather_data[0].ceiling_ft} ft</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* AI Proposals Section */}
                  {conflict.status === 'proposals_ready' && hasProposals && (
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI-Generated Reschedule Options
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {proposals.map((proposal: any, index: number) => (
                          <ProposalCard
                            key={proposal.id}
                            proposal={{
                              ...proposal,
                              conflict,
                            }}
                            rank={index}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            isLoading={isAccepting || isRejecting}
                            variant="student"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Processing Status */}
                  {conflict.status === 'ai_processing' && (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span>AI is generating reschedule proposals...</span>
                    </div>
                  )}

                  {conflict.status === 'detected' && !hasProposals && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 animate-pulse" />
                        <span>Processing weather conflict...</span>
                      </div>
                      <p className="text-xs text-center text-muted-foreground max-w-md">
                        Our AI is analyzing weather patterns and generating optimal reschedule options for you.
                        You'll be notified when proposals are ready (typically within 30 seconds).
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      })}
    </div>
  )
}
