import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { InstructorGantt } from '@/components/scheduling/InstructorGantt'

// Mock React Query and dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      instructors: [
        {
          id: '1',
          full_name: 'John Instructor',
          bookings: [],
          availability: [],
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}))

vi.mock('@uidotdev/usehooks', () => ({
  useDebounce: (value: any) => value,
}))

describe('InstructorGantt - Accessibility', () => {
  const mockInstructors = [
    {
      id: '1',
      full_name: 'John Instructor',
      email: 'john@example.com',
    },
  ]

  const mockAvailability = [
    {
      id: '1',
      instructor_id: '1',
      start_time: '2025-01-15T09:00:00Z',
      end_time: '2025-01-15T17:00:00Z',
      day_of_week: 1,
      is_recurring: true,
    },
  ]

  it('should have no accessibility violations', async () => {
    const { container } = render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have accessible date picker controls', async () => {
    const { container } = render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )

    // Check for interactive elements
    const interactiveElements = container.querySelectorAll('button, [role="button"]')
    expect(interactiveElements.length).toBeGreaterThan(0)
  })

  it('should have proper ARIA labels for time slots', async () => {
    const { container } = render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )

    // Time slots should have descriptive labels
    const results = await axe(container, {
      rules: {
        'aria-allowed-attr': { enabled: true },
        'aria-required-attr': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have sufficient color contrast for time blocks', async () => {
    const { container } = render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should be keyboard navigable', async () => {
    const { container } = render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )

    // Interactive elements should be focusable
    const interactiveElements = container.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])')
    expect(interactiveElements.length).toBeGreaterThan(0)
  })
})

