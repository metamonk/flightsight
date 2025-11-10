import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { MonthlyOverviewWidget } from '@/components/dashboard/MonthlyOverviewWidget'

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      monthlyData: {
        totalFlights: 15,
        totalHours: 22.5,
        averageUtilization: 68,
        topAircraft: [
          { tail_number: 'N12345', flight_count: 8 },
          { tail_number: 'N67890', flight_count: 7 },
        ],
      },
    },
    isLoading: false,
    error: null,
  }),
}))

describe('MonthlyOverviewWidget - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MonthlyOverviewWidget />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper heading structure', async () => {
    const { container } = render(<MonthlyOverviewWidget />)
    
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have accessible data visualizations', async () => {
    const { container } = render(<MonthlyOverviewWidget />)
    
    // Data should be presented in accessible formats (not just visual)
    const results = await axe(container, {
      rules: {
        'svg-img-alt': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have sufficient color contrast for metrics', async () => {
    const { container } = render(<MonthlyOverviewWidget />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have semantic HTML for statistics', async () => {
    const { container } = render(<MonthlyOverviewWidget />)
    
    // Statistics should use appropriate semantic elements
    const lists = container.querySelectorAll('dl, ul, ol')
    expect(lists.length).toBeGreaterThan(0)
  })
})

