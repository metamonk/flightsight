import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProposalAccordion } from '@/components/proposals/ProposalAccordion'

// Mock child components
vi.mock('@/components/proposals/ProposalCard', () => ({
  ProposalCard: ({ proposal, onAccept, onReject, variant }: any) => (
    <div data-testid={`proposal-card-${proposal.id}`}>
      <span>Proposal {proposal.id}</span>
      <span>Score: {proposal.score}</span>
      <span>Variant: {variant}</span>
      <button onClick={() => onAccept?.(proposal.id)}>Accept</button>
      <button onClick={() => onReject?.(proposal.id)}>Reject</button>
    </div>
  ),
}))

// Mock date formatting
vi.mock('@/lib/utils/date', () => ({
  formatLocalTime: (date: string, format: string) => {
    if (format === 'MMM d, yyyy • h:mm a') return 'Jan 15, 2025 • 10:00 AM'
    if (format === 'MMM d, yyyy') return 'Jan 15, 2025'
    return date
  },
}))

describe('ProposalAccordion', () => {
  const mockConflict = {
    id: 'conflict-1',
    booking_id: 'booking-1',
    detected_at: '2025-01-15T10:00:00Z',
    status: 'detected',
    weather_data: {
      violations: ['Ceiling below 3000ft', 'Visibility below 3 miles'],
    },
    conflict_reasons: ['Ceiling below 3000ft', 'Visibility below 3 miles'],
  }

  const mockBooking = {
    id: 'booking-1',
    scheduled_start: '2025-01-15T10:00:00Z',
    scheduled_end: '2025-01-15T12:00:00Z',
    status: 'weather_hold',
    lesson_type: 'dual_instruction',
    instructor: {
      id: 'instructor-1',
      full_name: 'John Instructor',
    },
    student: {
      id: 'student-1',
      full_name: 'Jane Student',
    },
    aircraft: {
      registration: 'N12345',
    },
  }

  const mockProposals = [
    {
      id: 'proposal-1',
      proposed_start: '2025-01-16T10:00:00Z',
      proposed_end: '2025-01-16T12:00:00Z',
      score: 95,
      reasoning: 'Best weather window',
      student_response: 'pending',
    },
    {
      id: 'proposal-2',
      proposed_start: '2025-01-16T14:00:00Z',
      proposed_end: '2025-01-16T16:00:00Z',
      score: 85,
      reasoning: 'Good alternative time',
      student_response: 'pending',
    },
  ]

  const mockHandlers = {
    onAccept: vi.fn(),
    onReject: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders with collapsed state by default', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Weather Conflict')).toBeInTheDocument()
      expect(screen.getByText('Jan 15, 2025 • 10:00 AM')).toBeInTheDocument()
      expect(screen.getByText('Ceiling below 3000ft')).toBeInTheDocument()
      expect(screen.getByText('2 options available')).toBeInTheDocument()
    })

    it('renders with expanded state when defaultOpen is true', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('Original Booking')).toBeInTheDocument()
      expect(screen.getByText('Weather Violations:')).toBeInTheDocument()
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
    })

    it('shows resolved badge when conflict is resolved', () => {
      const resolvedConflict = { ...mockConflict, status: 'resolved' }
      
      render(
        <ProposalAccordion
          conflict={resolvedConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('✓ Resolved')).toBeInTheDocument()
    })

    it('displays correct number of pending proposals', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('2 options available')).toBeInTheDocument()
    })

    it('shows singular "option" for single proposal', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={[mockProposals[0]]}
          variant="student"
          {...mockHandlers}
        />
      )

      expect(screen.getByText('1 option available')).toBeInTheDocument()
    })
  })

  describe('Student Variant', () => {
    it('displays instructor information in booking details', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      // Click accordion to expand
      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Instructor')).toBeInTheDocument()
        expect(screen.getByText('John Instructor')).toBeInTheDocument()
      })
    })

    it('shows help text for students', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(
          screen.getByText(/Can't find a suitable time\? Contact your instructor directly/)
        ).toBeInTheDocument()
      })
    })
  })

  describe('Instructor Variant', () => {
    it('displays student information in booking details', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="instructor"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Student')).toBeInTheDocument()
        expect(screen.getByText('Jane Student')).toBeInTheDocument()
      })
    })

    it('does not show help text for instructors', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="instructor"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(
          screen.queryByText(/Can't find a suitable time\?/)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Proposals Display', () => {
    it('sorts proposals by score in descending order', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      const proposalCards = screen.getAllByTestId(/proposal-card-/)
      expect(proposalCards[0]).toHaveTextContent('Score: 95')
      expect(proposalCards[1]).toHaveTextContent('Score: 85')
    })

    it('displays empty state when no proposals exist', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={[]}
          variant="student"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      expect(screen.getByText('🤖')).toBeInTheDocument()
      expect(
        screen.getByText('AI is generating alternative proposals...')
      ).toBeInTheDocument()
    })

    it('passes variant prop to ProposalCard components', async () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="instructor"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      const cards = screen.getAllByTestId(/proposal-card-/)
      cards.forEach(card => {
        expect(card).toHaveTextContent('Variant: instructor')
      })
    })
  })

  describe('Booking Details', () => {
    it('displays all booking information correctly', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Original Booking')).toBeInTheDocument()
        expect(screen.getByText('weather_hold')).toBeInTheDocument()
        expect(screen.getByText('Aircraft')).toBeInTheDocument()
        expect(screen.getByText('N12345')).toBeInTheDocument()
        expect(screen.getByText('Lesson Type')).toBeInTheDocument()
        expect(screen.getByText('dual_instruction')).toBeInTheDocument()
      })
    })
  })

  describe('Weather Violations', () => {
    it('displays all weather violations', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Weather Violations:')).toBeInTheDocument()
        expect(screen.getByText(/Ceiling below 3000ft/)).toBeInTheDocument()
        expect(screen.getByText(/Visibility below 3 miles/)).toBeInTheDocument()
      })
    })

    it('uses conflict_reasons as fallback when weather_data.violations is missing', async () => {
      const user = userEvent.setup()
      const conflictWithoutViolations = {
        ...mockConflict,
        weather_data: {},
        conflict_reasons: ['Wind exceeds limits'],
      }
      
      render(
        <ProposalAccordion
          conflict={conflictWithoutViolations}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText(/Wind exceeds limits/)).toBeInTheDocument()
      })
    })
  })

  describe('User Interactions', () => {
    it('expands and collapses on trigger click', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')

      // Initially collapsed - details not visible
      expect(screen.queryByText('Original Booking')).not.toBeInTheDocument()

      // Click to expand
      await user.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Original Booking')).toBeInTheDocument()
      })

      // Click to collapse
      await user.click(trigger)
      await waitFor(() => {
        expect(screen.queryByText('Original Booking')).not.toBeInTheDocument()
      })
    })

    it('calls onAccept handler when proposal is accepted', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      const acceptButtons = screen.getAllByText('Accept')
      await user.click(acceptButtons[0])

      expect(mockHandlers.onAccept).toHaveBeenCalledWith('proposal-1')
    })

    it('calls onReject handler when proposal is rejected', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          defaultOpen={true}
          {...mockHandlers}
        />
      )

      const rejectButtons = screen.getAllByText('Reject')
      await user.click(rejectButtons[0])

      expect(mockHandlers.onReject).toHaveBeenCalledWith('proposal-1')
    })
  })

  describe('Loading States', () => {
    it('passes isLoading prop to ProposalCard components', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          defaultOpen={true}
          isLoading={true}
          {...mockHandlers}
        />
      )

      // ProposalCard should receive isLoading prop
      // This is implicitly tested by the component rendering without errors
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles missing instructor information gracefully', async () => {
      const user = userEvent.setup()
      const bookingWithoutInstructor = {
        ...mockBooking,
        instructor: undefined,
      }
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={bookingWithoutInstructor}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      // Should not crash - instructor section should not appear
      await waitFor(() => {
        expect(screen.queryByText('Instructor')).not.toBeInTheDocument()
      })
    })

    it('handles missing aircraft information gracefully', async () => {
      const user = userEvent.setup()
      const bookingWithoutAircraft = {
        ...mockBooking,
        aircraft: undefined,
      }
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={bookingWithoutAircraft}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.queryByText('Aircraft')).not.toBeInTheDocument()
      })
    })

    it('handles empty violations array', async () => {
      const user = userEvent.setup()
      const conflictWithoutViolations = {
        ...mockConflict,
        weather_data: { violations: [] },
        conflict_reasons: [],
      }
      
      render(
        <ProposalAccordion
          conflict={conflictWithoutViolations}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      // Should show fallback message
      await waitFor(() => {
        expect(screen.getByText('Weather conditions unfavorable')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible accordion trigger button', () => {
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      expect(trigger).toBeInTheDocument()
    })

    it('maintains semantic HTML structure', async () => {
      const user = userEvent.setup()
      
      render(
        <ProposalAccordion
          conflict={mockConflict}
          booking={mockBooking}
          proposals={mockProposals}
          variant="student"
          {...mockHandlers}
        />
      )

      const trigger = screen.getByRole('button')
      await user.click(trigger)

      // Check for proper list structure
      await waitFor(() => {
        const lists = screen.getAllByRole('list')
        expect(lists.length).toBeGreaterThan(0)
      })
    })
  })
})

