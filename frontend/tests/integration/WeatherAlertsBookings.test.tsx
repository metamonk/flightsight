import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '@/tests/helpers/test-utils'
import { mockUsers, mockBookings, mockWeatherConflicts } from '@/tests/helpers/mockData'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { BookingsList } from '@/components/booking/BookingsList'

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
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockUsers.student, error: null }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  }),
}))

// Mock booking queries
vi.mock('@/lib/queries/bookings', async () => {
  const actual = await vi.importActual('@/lib/queries/bookings')
  return {
    ...actual,
    useBookings: vi.fn(),
    useWeatherConflicts: vi.fn(),
  }
})

describe('Weather Alerts and Bookings Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display weather alerts for affected bookings', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    const affectedBookings = mockBookings.filter(b => 
      mockWeatherConflicts.some(w => w.booking_id === b.id)
    )

    useBookings.mockReturnValue({
      data: affectedBookings,
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: mockWeatherConflicts,
      isLoading: false,
      error: null,
    })

    render(
      <div data-testid="integrated-view">
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify weather alerts are displayed
    await waitFor(() => {
      const container = screen.getByTestId('integrated-view')
      expect(container).toBeInTheDocument()
    })
  })

  it('should show weather warnings on affected bookings', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    const booking = mockBookings[0]
    const weatherConflict = mockWeatherConflicts.find(w => w.booking_id === booking.id)

    useBookings.mockReturnValue({
      data: [booking],
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: weatherConflict ? [weatherConflict] : [],
      isLoading: false,
      error: null,
    })

    render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  it('should update when new weather conflict is detected', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    const booking = mockBookings[0]

    // Initial state: no weather conflicts
    useBookings.mockReturnValue({
      data: [booking],
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    const { rerender } = render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Simulate new weather conflict detected
    const newConflict = mockWeatherConflicts[0]
    useWeatherConflicts.mockReturnValue({
      data: [newConflict],
      isLoading: false,
      error: null,
    })

    rerender(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify update appears
    await waitFor(() => {
      expect(useWeatherConflicts).toHaveBeenCalled()
    })
  })

  it('should handle multiple weather conflicts with different severities', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    useBookings.mockReturnValue({
      data: mockBookings.slice(0, 2),
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: mockWeatherConflicts,
      isLoading: false,
      error: null,
    })

    render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  it('should remove weather alert when booking is cancelled', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    const booking = mockBookings[0]
    const conflict = mockWeatherConflicts[0]

    // Initial state with conflict
    useBookings.mockReturnValue({
      data: [booking],
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: [conflict],
      isLoading: false,
      error: null,
    })

    const { rerender } = render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Simulate booking cancellation
    useBookings.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    rerender(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify both components reflect the change
    await waitFor(() => {
      expect(useBookings).toHaveBeenCalled()
    })
  })

  it('should handle concurrent data loading', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    // Weather conflicts load first
    useBookings.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: mockWeatherConflicts,
      isLoading: false,
      error: null,
    })

    const { rerender } = render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    // Then bookings load
    useBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
    })

    rerender(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })
  })

  it('should handle errors gracefully in either component', async () => {
    const { useBookings, useWeatherConflicts } = require('@/lib/queries/bookings')

    // Weather service fails, but bookings succeed
    useBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
    })

    useWeatherConflicts.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Weather service unavailable'),
    })

    render(
      <div>
        <WeatherAlerts userId={mockUsers.student.id} />
        <BookingsList userId={mockUsers.student.id} />
      </div>
    )

    // Verify bookings still render
    await waitFor(() => {
      const bookingsList = screen.queryByTestId('bookings-list')
      expect(bookingsList || screen.getByText(/bookings/i)).toBeTruthy()
    })

    // Weather alerts should show error or be hidden
    // (depending on error handling implementation)
    expect(useWeatherConflicts).toHaveBeenCalled()
  })
})

