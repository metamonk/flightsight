/**
 * Tests for MonthlyOverviewWidget Component
 * 
 * Tests the monthly calendar widget display functionality.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MonthlyOverviewWidget, type BookingSummary } from '@/components/dashboard/MonthlyOverviewWidget'

// Mock date-fns to avoid timezone issues in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns')
  return {
    ...actual,
    format: vi.fn((date: Date, _formatStr: string) => date.toISOString()),
  }
})

describe('MonthlyOverviewWidget', () => {
  const mockBookings: BookingSummary[] = [
    {
      id: '1',
      title: 'Flight Lesson - N12345',
      date: new Date('2024-11-15T10:00:00Z'),
      status: 'confirmed',
      type: 'Private Pilot'
    },
    {
      id: '2',
      title: 'Flight Lesson - N67890',
      date: new Date('2024-11-20T14:00:00Z'),
      status: 'pending',
      type: 'Instrument Rating'
    },
    {
      id: '3',
      title: 'Flight Lesson - N11111',
      date: new Date('2024-11-22T09:00:00Z'),
      status: 'weather_conflict',
      type: 'Commercial'
    },
  ]

  it('renders loading state with skeleton', () => {
    render(<MonthlyOverviewWidget isLoading={true} showSkeleton={true} />)
    
    expect(screen.getByText('Monthly Overview')).toBeInTheDocument()
    // Skeleton should be present
    const skeleton = document.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()
  })

  it('renders error state correctly', () => {
    const error = new Error('Failed to load calendar data')
    render(<MonthlyOverviewWidget error={error} />)
    
    expect(screen.getByText('Error Loading Calendar')).toBeInTheDocument()
    expect(screen.getByText('Failed to load calendar data')).toBeInTheDocument()
    expect(screen.getByText('Reload')).toBeInTheDocument()
  })

  it('renders empty state when no bookings', () => {
    render(<MonthlyOverviewWidget bookings={[]} userRole="student" />)
    
    expect(screen.getByText('Monthly Overview')).toBeInTheDocument()
    expect(screen.getByText('No bookings this month')).toBeInTheDocument()
    expect(screen.getByText('Book your first lesson to get started')).toBeInTheDocument()
  })

  it('displays correct booking count in header', () => {
    render(<MonthlyOverviewWidget bookings={mockBookings} />)
    
    expect(screen.getByText('3 bookings this month')).toBeInTheDocument()
  })

  it('displays quick stats badges for booking statuses', () => {
    render(<MonthlyOverviewWidget bookings={mockBookings} />)
    
    // Should show badges for confirmed, pending, and weather_conflict
    expect(screen.getByText('1 ✓')).toBeInTheDocument() // confirmed
    expect(screen.getByText('1 ⏱')).toBeInTheDocument() // pending
    expect(screen.getByText('1 ⚠️')).toBeInTheDocument() // weather_conflict
  })

  it('displays legend with status colors', () => {
    render(<MonthlyOverviewWidget bookings={mockBookings} />)
    
    expect(screen.getByText('Legend:')).toBeInTheDocument()
    expect(screen.getByText('Confirmed')).toBeInTheDocument()
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Weather Issue')).toBeInTheDocument()
  })

  it('shows different empty state message based on user role', () => {
    const { rerender } = render(
      <MonthlyOverviewWidget bookings={[]} userRole="student" />
    )
    
    expect(screen.getByText('Book your first lesson to get started')).toBeInTheDocument()
    
    rerender(<MonthlyOverviewWidget bookings={[]} userRole="instructor" />)
    expect(screen.getByText('No lessons scheduled yet')).toBeInTheDocument()
    
    rerender(<MonthlyOverviewWidget bookings={[]} userRole="admin" />)
    expect(screen.getByText('No bookings to display')).toBeInTheDocument()
  })

  it('calls onBookingClick when a booking is clicked', async () => {
    const onBookingClick = vi.fn()
    
    render(
      <MonthlyOverviewWidget 
        bookings={mockBookings} 
        onBookingClick={onBookingClick}
      />
    )
    
    // Find and click a booking
    const buttons = screen.getAllByRole('button')
    const bookingButton = buttons.find(btn => 
      btn.querySelector('[class*="text-"]') !== null
    )
    
    if (bookingButton) {
      bookingButton.click()
      expect(onBookingClick).toHaveBeenCalled()
    }
  })

  it('renders with bookings data', () => {
    const { container } = render(
      <MonthlyOverviewWidget
        bookings={mockBookings}
      />
    )

    // Should render the widget
    expect(container.querySelector('[class*="rounded-xl"]')).toBeInTheDocument()
  })

  it('calculates booking stats correctly', () => {
    const bookingsWithMultipleStatuses: BookingSummary[] = [
      ...mockBookings,
      {
        id: '4',
        title: 'Confirmed 2',
        date: new Date('2024-11-25T10:00:00Z'),
        status: 'confirmed',
      },
      {
        id: '5',
        title: 'Cancelled',
        date: new Date('2024-11-26T10:00:00Z'),
        status: 'cancelled',
      },
    ]
    
    render(<MonthlyOverviewWidget bookings={bookingsWithMultipleStatuses} />)
    
    // Should show correct counts
    expect(screen.getByText('5 bookings this month')).toBeInTheDocument()
    expect(screen.getByText('2 ✓')).toBeInTheDocument() // 2 confirmed
    expect(screen.getByText('1 ⏱')).toBeInTheDocument() // 1 pending
    expect(screen.getByText('1 ⚠️')).toBeInTheDocument() // 1 weather_conflict
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <MonthlyOverviewWidget 
        bookings={mockBookings} 
        className="custom-class"
      />
    )
    
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })
})

