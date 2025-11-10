'use client'

import { formatLocalTime } from '@/lib/utils/date'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProposalCard } from './ProposalCard'

interface Proposal {
  id: string
  proposed_start: string
  proposed_end: string
  score: number
  reasoning?: string
  student_response?: string
  instructor_response?: string
  student_responded_at?: string
  instructor_responded_at?: string
}

interface WeatherConflict {
  id: string
  booking_id: string
  detected_at: string
  status: string
  weather_data: {
    violations?: string[]
  }
  conflict_reasons: string[]
}

interface Booking {
  id: string
  scheduled_start: string
  scheduled_end: string
  status: string
  lesson_type: string
  instructor?: {
    id: string
    full_name: string
  }
  aircraft?: {
    registration: string
  }
  student?: {
    id: string
    full_name: string
  }
}

interface ProposalAccordionProps {
  conflict: WeatherConflict
  booking: Booking
  proposals: Proposal[]
  onAccept?: (proposalId: string, bookingId?: string) => void
  onReject?: (proposalId: string) => void
  isLoading?: boolean
  variant: 'student' | 'instructor'
  defaultOpen?: boolean
}

/**
 * ProposalAccordion Component
 * 
 * Displays weather conflict details and AI-generated reschedule proposals
 * in an expandable accordion format. Designed to be shown inline with bookings.
 * 
 * Features:
 * - Compact collapsed state showing weather alert summary
 * - Expanded view with conflict details and proposal options
 * - Visual indicators for conflict severity
 * - Responsive design for mobile and desktop
 */
export function ProposalAccordion({
  conflict,
  booking,
  proposals,
  onAccept,
  onReject,
  isLoading = false,
  variant,
  defaultOpen = false,
}: ProposalAccordionProps) {
  // Sort proposals by score (best first)
  const sortedProposals = [...proposals].sort((a, b) => (b.score || 0) - (a.score || 0))

  // Get conflict status
  const isResolved = conflict.status === 'resolved'
  const isAcknowledged = conflict.status === 'acknowledged'
  const isDetected = conflict.status === 'detected'

  // Get number of pending proposals
  const pendingProposals = sortedProposals.filter(
    (p) => !p.student_response || p.student_response === 'pending'
  ).length

  // Format conflict time
  const conflictTime = formatLocalTime(booking.scheduled_start, 'MMM d, yyyy • h:mm a')

  // Get violations summary
  const violations = conflict.weather_data?.violations || conflict.conflict_reasons || []
  const violationSummary = violations.length > 0 ? violations[0] : 'Weather conditions unfavorable'

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent>
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen ? 'proposals' : undefined}
        >
          <AccordionItem value="proposals" className="border-none">
            <AccordionTrigger className="hover:no-underline py-0">
              <div className="flex items-start justify-between w-full pr-4">
                <div className="flex items-start gap-3">
                  {/* Weather Icon */}
                  <div className="text-2xl mt-0.5">
                    ⚠️
                  </div>

                  {/* Conflict Summary */}
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-destructive">
                        Weather Conflict
                      </h4>
                      {!isResolved && pendingProposals > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {pendingProposals} {pendingProposals === 1 ? 'option' : 'options'} available
                        </Badge>
                      )}
                      {isResolved && (
                        <Badge variant="outline" className="text-xs">
                          ✓ Resolved
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conflictTime}
                    </p>
                    <p className="text-xs text-destructive/80 mt-1">
                      {violationSummary}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="space-y-4 mt-4">
                {/* Booking Details */}
                <Card>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          Original Booking
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {variant === 'student' && booking.instructor && (
                          <div>
                            <p className="text-muted-foreground">Instructor</p>
                            <p className="font-medium">{booking.instructor.full_name}</p>
                          </div>
                        )}
                        {variant === 'instructor' && booking.student && (
                          <div>
                            <p className="text-muted-foreground">Student</p>
                            <p className="font-medium">{booking.student.full_name}</p>
                          </div>
                        )}
                        {booking.aircraft && (
                          <div>
                            <p className="text-muted-foreground">Aircraft</p>
                            <p className="font-medium">{booking.aircraft.registration}</p>
                          </div>
                        )}
                      </div>

                      <div className="text-xs">
                        <p className="text-muted-foreground">Lesson Type</p>
                        <p className="font-medium">{booking.lesson_type}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weather Violations */}
                {violations.length > 0 && (
                  <Card className="border-destructive/50 bg-destructive/10">
                    <CardContent>
                      <p className="text-xs font-semibold text-destructive mb-2">
                        Weather Violations:
                      </p>
                      <ul className="text-xs text-destructive/80 space-y-1">
                        {violations.map((violation, index) => (
                          <li key={index}>• {violation}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* AI Proposals */}
                {sortedProposals.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        AI Recommendations
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {sortedProposals.length} {sortedProposals.length === 1 ? 'option' : 'options'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {sortedProposals.map((proposal, index) => (
                        <ProposalCard
                          key={proposal.id}
                          proposal={proposal}
                          rank={index}
                          onAccept={onAccept}
                          onReject={onReject}
                          isLoading={isLoading}
                          variant={variant}
                          bookingId={booking.id}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <Card className="text-center">
                    <CardContent>
                      <div className="text-3xl mb-2">🤖</div>
                      <p className="text-sm text-muted-foreground">
                        AI is generating alternative proposals...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This usually takes a few moments
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Additional Actions */}
                {!isResolved && variant === 'student' && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      Can't find a suitable time? Contact your instructor directly.
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}

