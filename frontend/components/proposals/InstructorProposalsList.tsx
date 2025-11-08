'use client'

import { useInstructorProposals, useApproveProposal, useRejectProposalAsInstructor } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { useState } from 'react'
import { ProposalCard } from './ProposalCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Instructor Proposals List Component
 * 
 * Displays AI-generated reschedule proposals for instructor's bookings
 * that have weather conflicts. Allows approving or rejecting proposals.
 */
export function InstructorProposalsList({ instructorId }: { instructorId: string }) {
  const { data: proposals, isLoading, error } = useInstructorProposals(instructorId)
  const approveMutation = useApproveProposal()
  const rejectMutation = useRejectProposalAsInstructor()
  const [loadingProposalId, setLoadingProposalId] = useState<string | null>(null)

  const handleApprove = async (proposalId: string, bookingId?: string) => {
    if (!bookingId) {
      console.error('Booking ID is required for approval')
      return
    }
    setLoadingProposalId(proposalId)
    try {
      await approveMutation.mutateAsync({ proposalId, bookingId })
    } finally {
      setLoadingProposalId(null)
    }
  }

  const handleReject = async (proposalId: string) => {
    setLoadingProposalId(proposalId)
    try {
      await rejectMutation.mutateAsync(proposalId)
    } finally {
      setLoadingProposalId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive font-medium">Error loading proposals</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    )
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <p className="text-muted-foreground text-lg">No pending proposals</p>
        <p className="text-sm text-muted-foreground mt-2">
          Reschedule requests from students will appear here
        </p>
      </div>
    )
  }

  // Group proposals by booking
  const groupedProposals = proposals.reduce((acc: any, proposal: any) => {
    const bookingId = proposal.conflict?.booking?.id
    if (!acc[bookingId]) {
      acc[bookingId] = {
        booking: proposal.conflict?.booking,
        conflict: proposal.conflict,
        proposals: [],
      }
    }
    acc[bookingId].proposals.push(proposal)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {Object.values(groupedProposals).map((group: any) => {
        const booking = group.booking
        const conflict = group.conflict
        const proposalsList = group.proposals

        return (
          <Card
            key={booking.id}
            className="border-destructive/20 bg-destructive/5"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Weather Conflict</span>
                </CardTitle>
                <Badge variant="destructive">
                  {conflict?.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Booking Details */}
              <Card>
                <CardContent className="pt-4">
                  <p className="font-medium text-foreground mb-1">
                    Student: {booking.student?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Original Time: {format(new Date(booking.scheduled_start), 'MMM d, yyyy • h:mm a')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aircraft: {booking.aircraft?.registration}
                  </p>
                </CardContent>
              </Card>

              {/* Weather violations */}
              {conflict?.weather_data?.violations && (
                <Card className="border-destructive/50 bg-destructive/10">
                  <CardContent className="pt-4">
                    <p className="text-sm font-medium text-destructive mb-1">
                      Weather Violations:
                    </p>
                    <ul className="text-sm text-destructive/80 space-y-1">
                      {conflict.weather_data.violations.map((v: string, i: number) => (
                        <li key={i}>• {v}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* AI Proposals */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  AI Recommendations ({proposalsList.length})
                </h4>
                
                {proposalsList
                  .sort((a: any, b: any) => (b.ai_score || 0) - (a.ai_score || 0))
                  .map((proposal: any, index: number) => {
                    const isLoading = loadingProposalId === proposal.id

                    return (
                      <ProposalCard
                        key={proposal.id}
                        proposal={proposal}
                        rank={index}
                        onAccept={handleApprove}
                        onReject={handleReject}
                        isLoading={isLoading}
                        variant="instructor"
                        bookingId={booking.id}
                      />
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

