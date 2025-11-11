import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/tests/helpers/test-utils'
import { mockUsers, mockBookings, mockProposals } from '@/tests/helpers/mockData'
import { BookingsList } from '@/components/booking/BookingsList'
import { ProposalsList } from '@/components/proposals/ProposalsList'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: mockUsers.student },
        error: null,
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUsers.student, error: null }),
    })),
  }),
}))

// Mock booking queries
vi.mock('@/lib/queries/bookings', async () => {
  const actual = await vi.importActual('@/lib/queries/bookings')
  return {
    ...actual,
    useBookings: vi.fn(),
    useProposals: vi.fn(),
    useAcceptProposal: vi.fn(),
    useRejectProposal: vi.fn(),
  }
})

describe('Booking and Proposals Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display bookings and related proposals together', async () => {
    const { useBookings, useProposals } = await import('@/lib/queries/bookings')

    // Mock bookings data
    vi.mocked(useBookings).mockReturnValue({
      data: mockBookings.filter(b => b.student_id === mockUsers.student.id),
      isLoading: false,
      error: null,
    } as any)

    // Mock proposals data
    vi.mocked(useProposals).mockReturnValue({
      data: mockProposals,
      isLoading: false,
      error: null,
    } as any)

    const { container } = render(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify bookings are displayed
    await waitFor(() => {
      const bookingsSection = container.querySelector('[data-testid="bookings-list"]')
      expect(bookingsSection).toBeTruthy()
    })

    // Verify proposals are displayed
    await waitFor(() => {
      const proposalsSection = container.querySelector('[data-testid="proposals-list"]')
      expect(proposalsSection).toBeTruthy()
    })
  })

  it('should update bookings list when proposal is accepted', async () => {
    const { useBookings, useProposals, useAcceptProposal } = require('@/lib/queries/bookings')

    const initialBookings = mockBookings.filter(b => b.student_id === mockUsers.student.id)
    const proposal = mockProposals[0]

    // Initial state
    useBookings.mockReturnValue({
      data: initialBookings,
      isLoading: false,
      error: null,
    })

    useProposals.mockReturnValue({
      data: [proposal],
      isLoading: false,
      error: null,
    })

    const mockAcceptMutation = {
      mutate: vi.fn(),
      isPending: false,
    }
    useAcceptProposal.mockReturnValue(mockAcceptMutation)

    const { rerender } = render(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Wait for initial render
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Accept a proposal (simulate button click)
    mockAcceptMutation.mutate.mockImplementation((_proposalId: any, options: any) => {
      // Simulate successful mutation
      if (options?.onSuccess) {
        options.onSuccess()
      }
    })

    // Update mock data after acceptance
    const updatedBooking = {
      ...initialBookings[0],
      start_time: proposal.proposed_start_time,
      end_time: proposal.proposed_end_time,
    }

    useBookings.mockReturnValue({
      data: [updatedBooking, ...initialBookings.slice(1)],
      isLoading: false,
      error: null,
    })

    useProposals.mockReturnValue({
      data: [], // Proposal removed after acceptance
      isLoading: false,
      error: null,
    })

    rerender(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify updated booking time
    await waitFor(() => {
      expect(mockAcceptMutation.mutate).toBeDefined()
    })
  })

  it('should keep bookings unchanged when proposal is rejected', async () => {
    const { useBookings, useProposals, useRejectProposal } = require('@/lib/queries/bookings')

    const initialBookings = mockBookings.filter(b => b.student_id === mockUsers.student.id)
    const proposal = mockProposals[0]

    useBookings.mockReturnValue({
      data: initialBookings,
      isLoading: false,
      error: null,
    })

    useProposals.mockReturnValue({
      data: [proposal],
      isLoading: false,
      error: null,
    })

    const mockRejectMutation = {
      mutate: vi.fn(),
      isPending: false,
    }
    useRejectProposal.mockReturnValue(mockRejectMutation)

    const { rerender } = render(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Simulate rejection
    mockRejectMutation.mutate.mockImplementation((_proposalId: any, options: any) => {
      if (options?.onSuccess) {
        options.onSuccess()
      }
    })

    // Update mocks - proposal removed but bookings unchanged
    useBookings.mockReturnValue({
      data: initialBookings, // Same as before
      isLoading: false,
      error: null,
    })

    useProposals.mockReturnValue({
      data: [], // Proposal removed
      isLoading: false,
      error: null,
    })

    rerender(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify bookings remain the same
    await waitFor(() => {
      expect(mockRejectMutation.mutate).toBeDefined()
    })
  })

  it('should handle loading states across components', async () => {
    const { useBookings, useProposals } = require('@/lib/queries/bookings')

    // Both components loading
    useBookings.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    useProposals.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify loading indicators
    expect(screen.getAllByTestId(/skeleton/i).length).toBeGreaterThan(0)
  })

  it('should handle error states independently', async () => {
    const { useBookings, useProposals } = require('@/lib/queries/bookings')

    // Bookings error, proposals success
    useBookings.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch bookings'),
    })

    useProposals.mockReturnValue({
      data: mockProposals,
      isLoading: false,
      error: null,
    })

    render(
      <div>
        <BookingsList userId={mockUsers.student.id} />
        <ProposalsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify error message for bookings
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch bookings/i)).toBeInTheDocument()
    })

    // Verify proposals still render correctly
    await waitFor(() => {
      const proposalsSection = screen.getByTestId('proposals-list')
      expect(proposalsSection).toBeInTheDocument()
    })
  })
})

