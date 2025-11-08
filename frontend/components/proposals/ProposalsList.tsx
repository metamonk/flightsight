'use client'

import { useWeatherConflicts, useAcceptProposal, useRejectProposal } from '@/lib/queries/bookings'
import { ProposalCard } from './ProposalCard'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Proposals List Component
 * 
 * Displays AI-generated reschedule proposals for weather conflicts.
 * Allows students to accept or reject proposals.
 */
export function ProposalsList({ userId }: { userId: string }) {
  const { data: conflicts, isLoading } = useWeatherConflicts(userId)
  const { mutate: acceptProposal, isPending: isAccepting } = useAcceptProposal()
  const { mutate: rejectProposal, isPending: isRejecting } = useRejectProposal()

  // Get all proposals from conflicts
  const allProposals = conflicts?.flatMap((conflict: any) =>
    (conflict.reschedule_proposals || []).map((proposal: any) => ({
      ...proposal,
      conflict,
    }))
  )

  const handleAccept = (proposalId: string) => {
    if (confirm('Accept this reschedule proposal?')) {
      acceptProposal(proposalId)
    }
  }

  const handleReject = (proposalId: string) => {
    if (confirm('Reject this proposal?')) {
      rejectProposal(proposalId)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  if (!allProposals || allProposals.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🤖</div>
        <p className="text-muted-foreground">No reschedule proposals yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Proposals will appear when weather conflicts are detected
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {allProposals.slice(0, 3).map((proposal: any, index: number) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          rank={index}
          onAccept={handleAccept}
          onReject={handleReject}
          isLoading={isAccepting || isRejecting}
          variant="student"
        />
      ))}
    </div>
  )
}

