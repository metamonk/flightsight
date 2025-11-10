/**
 * Tests for ProposalCard Component
 * 
 * Tests the proposal display card for both student and instructor views.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProposalCard } from '@/components/proposals/ProposalCard'

describe('ProposalCard', () => {
  const mockProposal = {
    id: 'proposal-1',
    proposed_start: '2024-11-20T14:00:00Z',
    proposed_end: '2024-11-20T16:00:00Z',
    score: 0.95,
    reasoning: 'Clear weather conditions and instructor availability confirmed.',
    student_response: undefined,
    instructor_response: undefined,
    student_responded_at: undefined,
    instructor_responded_at: undefined,
  }

  it('renders proposal details correctly', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
      />
    )
    
    // Should display time and score (score is rounded from 0.95 to 1)
    expect(screen.getByText('Score: 1')).toBeInTheDocument()
    expect(screen.getByText('Best Match')).toBeInTheDocument()
  })

  it('displays correct rank badge for best match', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
      />
    )
    
    expect(screen.getByText('🥇')).toBeInTheDocument()
    expect(screen.getByText('Best Match')).toBeInTheDocument()
  })

  it('displays correct rank badge for second option', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={1}
        variant="student"
      />
    )
    
    expect(screen.getByText('🥈')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('displays correct rank badge for third option', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={2}
        variant="student"
      />
    )
    
    expect(screen.getByText('🥉')).toBeInTheDocument()
    expect(screen.getByText('Option 3')).toBeInTheDocument()
  })

  it('calls onAccept when Accept button is clicked', () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
        onAccept={onAccept}
        onReject={onReject}
      />
    )
    
    const acceptButton = screen.getByText('Accept')
    fireEvent.click(acceptButton)
    
    expect(onAccept).toHaveBeenCalledWith('proposal-1')
  })

  it('calls onReject when Decline button is clicked', () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
        onAccept={onAccept}
        onReject={onReject}
      />
    )
    
    const rejectButton = screen.getByText('Decline')
    fireEvent.click(rejectButton)
    
    expect(onReject).toHaveBeenCalledWith('proposal-1')
  })

  it('disables buttons when isLoading is true', () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
        onAccept={onAccept}
        onReject={onReject}
        isLoading={true}
      />
    )
    
    const acceptButton = screen.getByText('Accepting...') as HTMLButtonElement
    const rejectButton = screen.getByText('Rejecting...') as HTMLButtonElement
    
    expect(acceptButton.disabled).toBe(true)
    expect(rejectButton.disabled).toBe(true)
  })

  it('shows accepted state when proposal is accepted by student', () => {
    const acceptedProposal = {
      ...mockProposal,
      student_response: 'accepted',
      student_responded_at: '2024-11-15T10:00:00Z',
    }
    
    render(
      <ProposalCard
        proposal={acceptedProposal}
        rank={0}
        variant="student"
      />
    )
    
    expect(screen.getByText('✓ Accepted')).toBeInTheDocument()
  })

  it('shows rejected state when proposal is rejected by student', () => {
    const rejectedProposal = {
      ...mockProposal,
      student_response: 'rejected',
      student_responded_at: '2024-11-15T10:00:00Z',
    }
    
    render(
      <ProposalCard
        proposal={rejectedProposal}
        rank={0}
        variant="student"
      />
    )
    
    expect(screen.getByText('Declined')).toBeInTheDocument()
  })

  it('renders instructor variant with Approve button', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="instructor"
        bookingId="booking-123"
        onAccept={vi.fn()}
        onReject={vi.fn()}
      />
    )
    
    expect(screen.getByText('✓ Approve & Reschedule')).toBeInTheDocument()
  })

  it('passes bookingId when instructor approves', () => {
    const onAccept = vi.fn()
    const onReject = vi.fn()
    
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="instructor"
        bookingId="booking-123"
        onAccept={onAccept}
        onReject={onReject}
      />
    )
    
    const approveButton = screen.getByText('✓ Approve & Reschedule')
    fireEvent.click(approveButton)
    
    expect(onAccept).toHaveBeenCalledWith('proposal-1', 'booking-123')
  })

  it('displays reasoning when provided', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
      />
    )
    
    expect(screen.getByText('Clear weather conditions and instructor availability confirmed.')).toBeInTheDocument()
  })

  it('hides buttons when no handlers provided', () => {
    render(
      <ProposalCard
        proposal={mockProposal}
        rank={0}
        variant="student"
      />
    )
    
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    expect(screen.queryByText('Decline')).not.toBeInTheDocument()
  })

  it('shows accepted state for instructor when proposal is approved', () => {
    const approvedProposal = {
      ...mockProposal,
      instructor_response: 'accepted',
      instructor_responded_at: '2024-11-15T10:00:00Z',
    }
    
    render(
      <ProposalCard
        proposal={approvedProposal}
        rank={0}
        variant="instructor"
      />
    )
    
    expect(screen.getByText('✓ Approved')).toBeInTheDocument()
  })

  it('shows rejected state for instructor when proposal is declined', () => {
    const declinedProposal = {
      ...mockProposal,
      instructor_response: 'rejected',
      instructor_responded_at: '2024-11-15T10:00:00Z',
    }
    
    render(
      <ProposalCard
        proposal={declinedProposal}
        rank={0}
        variant="instructor"
      />
    )
    
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })
})

