import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ProposalCard } from '@/components/proposals/ProposalCard'

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

describe('ProposalCard - Accessibility', () => {
  const mockProposal = {
    id: '1',
    booking_id: 'booking-1',
    proposed_date: '2025-01-15',
    proposed_time: '10:00',
    reason: 'Weather conditions',
    status: 'pending',
    compatibility_score: 0.95,
    created_at: '2025-01-10T00:00:00Z',
    booking: {
      student: { full_name: 'John Doe' },
      instructor: { full_name: 'Jane Smith' },
      aircraft: { tail_number: 'N12345' },
      lesson_type: { name: 'Private Pilot' },
    },
  }

  it('should have no accessibility violations', async () => {
    const { container } = render(<ProposalCard proposal={mockProposal as any} rank={0} variant="student" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have accessible button labels', async () => {
    const { getByRole } = render(<ProposalCard proposal={mockProposal as any} rank={0} variant="student" />)

    const acceptButton = getByRole('button', { name: /approve/i })
    const declineButton = getByRole('button', { name: /decline/i })

    expect(acceptButton).toBeInTheDocument()
    expect(declineButton).toBeInTheDocument()
  })

  it('should have proper heading structure', async () => {
    const { container } = render(<ProposalCard proposal={mockProposal as any} rank={0} variant="student" />)

    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have sufficient color contrast for status badges', async () => {
    const { container } = render(<ProposalCard proposal={mockProposal as any} rank={0} variant="student" />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', async () => {
    const { getByRole } = render(<ProposalCard proposal={mockProposal as any} rank={0} variant="student" />)

    const acceptButton = getByRole('button', { name: /approve/i })
    const declineButton = getByRole('button', { name: /decline/i })

    // Check that buttons are focusable
    expect(acceptButton).not.toHaveAttribute('tabindex', '-1')
    expect(declineButton).not.toHaveAttribute('tabindex', '-1')
  })
})

