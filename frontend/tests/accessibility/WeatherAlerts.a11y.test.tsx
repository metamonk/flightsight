import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'

// Mock React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      conflicts: [
        {
          id: '1',
          booking_id: 'booking-1',
          conflict_date: '2025-01-15',
          weather_conditions: 'High winds',
          severity: 'high',
          detected_at: '2025-01-10T00:00:00Z',
          booking: {
            aircraft: { tail_number: 'N12345' },
            lesson_type: { name: 'Private Pilot' },
            scheduled_start: '2025-01-15T10:00:00Z',
          },
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}))

describe('WeatherAlerts - Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<WeatherAlerts userId="test-user" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have accessible alert region', async () => {
    const { container } = render(<WeatherAlerts userId="test-user" />)
    
    // Alerts should use proper ARIA role or semantic HTML
    const alerts = container.querySelectorAll('[role="alert"], .alert')
    expect(alerts.length).toBeGreaterThan(0)
  })

  it('should have proper heading structure for accordion', async () => {
    const { container } = render(<WeatherAlerts userId="test-user" />)
    
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have sufficient color contrast for severity indicators', async () => {
    const { container } = render(<WeatherAlerts userId="test-user" />)
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('should have keyboard-accessible accordion', async () => {
    const { container } = render(<WeatherAlerts userId="test-user" />)
    
    // Accordion triggers should be focusable
    const triggers = container.querySelectorAll('[role="button"]')
    triggers.forEach((trigger) => {
      expect(trigger).not.toHaveAttribute('tabindex', '-1')
    })
  })
})

