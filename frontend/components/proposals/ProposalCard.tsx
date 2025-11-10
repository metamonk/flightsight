'use client'

import { formatLocalTime } from '@/lib/utils/date'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProposalCardProps {
  proposal: {
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
  rank: number // 0=best, 1=second, 2=third
  onAccept?: (proposalId: string, bookingId?: string) => void
  onReject?: (proposalId: string) => void
  isLoading?: boolean
  variant: 'student' | 'instructor' // Controls which actions to show
  bookingId?: string // For instructor approval
}

/**
 * ProposalCard Component
 * 
 * Reusable card component for displaying AI-generated reschedule proposals.
 * Supports both student and instructor views with appropriate actions.
 */
export function ProposalCard({
  proposal,
  rank,
  onAccept,
  onReject,
  isLoading = false,
  variant,
  bookingId,
}: ProposalCardProps) {
  // Determine status based on student response (for student view) or instructor response (for instructor view)
  const response = variant === 'student' ? proposal.student_response : proposal.instructor_response
  const isAccepted = response === 'accepted'
  const isRejected = response === 'rejected'
  const isPending = !response || response === 'pending'

  // Rank badge configuration using Badge variants
  const getRankConfig = () => {
    switch (rank) {
      case 0:
        return {
          emoji: '🥇',
          label: 'Best Match',
          variant: 'default' as const,
        }
      case 1:
        return {
          emoji: '🥈',
          label: 'Option 2',
          variant: 'secondary' as const,
        }
      case 2:
        return {
          emoji: '🥉',
          label: 'Option 3',
          variant: 'outline' as const,
        }
      default:
        return {
          emoji: '📋',
          label: `Option ${rank + 1}`,
          variant: 'outline' as const,
        }
    }
  }

  const rankConfig = getRankConfig()

  // Format proposed time
  const getProposedTime = () => {
    if (proposal.proposed_start) {
      return {
        date: formatLocalTime(proposal.proposed_start, 'MMM d, yyyy'),
        timeRange: `${formatLocalTime(proposal.proposed_start, 'h:mm a')}${
          proposal.proposed_end ? ` - ${formatLocalTime(proposal.proposed_end, 'h:mm a')}` : ''
        }`,
      }
    }
    return { date: 'Unknown', timeRange: 'Unknown' }
  }

  const proposedTime = getProposedTime()

  // Handle accept action
  const handleAccept = () => {
    if (variant === 'instructor' && bookingId) {
      onAccept?.(proposal.id, bookingId)
    } else {
      onAccept?.(proposal.id)
    }
  }

  // Handle reject action
  const handleReject = () => {
    onReject?.(proposal.id)
  }

  return (
    <Card
      className={
        isAccepted
          ? 'border-primary/30 bg-primary/5'
          : isRejected
          ? 'border-muted bg-muted/50'
          : 'hover:border-primary/50 transition-colors'
      }
    >
      <CardContent>
        {/* Rank Badge & Score */}
        <div className="flex items-start justify-between mb-3">
          {variant === 'student' ? (
            <>
              <Badge variant={rankConfig.variant} className="gap-1">
                <span>{rankConfig.emoji}</span>
                <span>{rankConfig.label}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                Score: {Math.round((proposal.score || 0))}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg">{rankConfig.emoji}</span>
              <div>
                <p className="font-medium text-foreground">{proposedTime.date} • {proposedTime.timeRange}</p>
                <p className="text-xs text-muted-foreground">
                  AI Score: {Math.round((proposal.score || 0))}
                </p>
              </div>
            </div>
          )}

          {/* Status badges for instructor variant */}
          {variant === 'instructor' && (
            <>
              {isAccepted && (
                <Badge variant="default">
                  ✓ Approved
                </Badge>
              )}
              {isRejected && (
                <Badge variant="secondary">
                  Rejected
                </Badge>
              )}
            </>
          )}
        </div>

        {/* Proposed Time (Student view only) */}
        {variant === 'student' && (
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-1">Proposed Time:</p>
            <p className="font-semibold text-foreground">{proposedTime.date}</p>
            <p className="text-sm text-muted-foreground">{proposedTime.timeRange}</p>
          </div>
        )}

        {/* AI Reasoning */}
        {proposal.reasoning && (
          <div className="mb-4">
            <p className={`text-sm text-muted-foreground ${variant === 'student' ? 'line-clamp-3' : 'italic'}`}>
              {variant === 'instructor' && '"'}
              {variant === 'instructor' 
                ? proposal.reasoning.substring(0, 120) + '...' 
                : proposal.reasoning}
              {variant === 'instructor' && '"'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {isPending && onAccept && onReject && (
          <div className="flex gap-2">
            {variant === 'student' ? (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="flex-1"
                  variant="default"
                >
                  {isLoading ? 'Accepting...' : 'Accept'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  className="flex-1"
                  variant="outline"
                >
                  {isLoading ? 'Rejecting...' : 'Decline'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="flex-1"
                  variant="default"
                >
                  {isLoading ? 'Processing...' : '✓ Approve & Reschedule'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  variant="outline"
                >
                  ✕ Reject
                </Button>
              </>
            )}
          </div>
        )}

        {/* Status Badge (Student view only) */}
        {variant === 'student' && !isPending && (
          <div className="text-center">
            <Badge
              variant={isAccepted ? 'default' : 'secondary'}
            >
              {isAccepted ? '✓ Accepted' : 'Declined'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

