/**
 * InstructorGanttView Component Tests
 * 
 * Tests for instructor availability Gantt chart functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InstructorGanttView } from '@/components/scheduling/InstructorGanttView'

// Mock the queries
vi.mock('@/lib/queries/availability', () => ({
  useAllInstructorsAvailability: vi.fn(),
  useUpdateAvailability: vi.fn(),
  useDeleteAvailability: vi.fn(),
}))

vi.mock('@/lib/queries/bookings', () => ({
  useInstructorBookings: vi.fn(),
}))

// Mock the Gantt component to avoid complex rendering
vi.mock('@/components/scheduling/InstructorGantt', () => ({
  InstructorGantt: ({ 
    instructors, 
    availability, 
    bookings,
    onItemChange,
    onItemClick,
  }: any) => (
    <div data-testid="instructor-gantt">
      <div data-testid="instructors-count">{instructors.length}</div>
      <div data-testid="availability-count">{availability.length}</div>
      <div data-testid="bookings-count">{bookings?.length || 0}</div>
      {instructors.map((instructor: any) => (
        <div key={instructor.id} data-testid={`instructor-${instructor.id}`}>
          {instructor.full_name}
        </div>
      ))}
      {availability.map((avail: any) => (
        <button
          key={avail.id}
          data-testid={`availability-${avail.id}`}
          onClick={() => onItemClick?.({
            id: `availability-${avail.id}`,
            featureId: avail.instructor_id,
            start: new Date(avail.start_time),
            end: new Date(avail.end_time),
            title: 'Available',
            status: 'available'
          })}
        >
          Availability {avail.id}
        </button>
      ))}
    </div>
  ),
}))

describe('InstructorGanttView', () => {
  let queryClient: QueryClient
  
  const mockInstructorData = [
    {
      id: '1',
      users: {
        id: '1',
        full_name: 'John Doe',
        email: 'john@example.com'
      },
      user_id: '1',
      start_time: '2025-01-15T09:00:00Z',
      end_time: '2025-01-15T17:00:00Z',
      day_of_week: 1,
      is_recurring: true
    },
    {
      id: '2',
      users: {
        id: '2',
        full_name: 'Jane Smith',
        email: 'jane@example.com'
      },
      user_id: '2',
      start_time: '2025-01-15T10:00:00Z',
      end_time: '2025-01-15T18:00:00Z',
      day_of_week: 2,
      is_recurring: true
    }
  ]
  
  const mockBookings = [
    {
      id: '1',
      instructor_id: '1',
      scheduled_start: '2025-01-15T10:00:00Z',
      scheduled_end: '2025-01-15T11:00:00Z',
      lesson_type: 'Ground School',
      student: {
        full_name: 'Student A'
      }
    }
  ]
  
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    
    // Reset mocks
    vi.clearAllMocks()
  })
  
  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <InstructorGanttView {...props} />
      </QueryClientProvider>
    )
  }
  
  it('renders loading state initially', () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: undefined,
      isLoading: true
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent({ showSkeleton: true })
    
    expect(screen.getByText(/Loading availability data/i)).toBeInTheDocument()
  })
  
  it('renders error state when data fails to load', () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch data')
    })
    
    useInstructorBookings.mockReturnValue({
      data: [],
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent()
    
    expect(screen.getByText(/Error Loading Availability/i)).toBeInTheDocument()
    expect(screen.getByText(/Failed to fetch data/i)).toBeInTheDocument()
  })
  
  it('renders empty state when no instructors found', () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: [],
      isLoading: false,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: [],
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent()
    
    expect(screen.getByText(/No instructors found/i)).toBeInTheDocument()
    expect(screen.getByText(/No availability set/i)).toBeInTheDocument()
  })
  
  it('displays instructors and availability data correctly', async () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: mockInstructorData,
      isLoading: false,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent()
    
    // Check that instructors are displayed
    expect(screen.getByTestId('instructor-1')).toBeInTheDocument()
    expect(screen.getByTestId('instructor-2')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    
    // Check counts
    expect(screen.getByTestId('instructors-count')).toHaveTextContent('2')
    expect(screen.getByTestId('availability-count')).toHaveTextContent('2')
    expect(screen.getByTestId('bookings-count')).toHaveTextContent('1')
  })
  
  it('filters data by instructor ID when provided', () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: mockInstructorData,
      isLoading: false,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: mockBookings,
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent({ instructorId: '1' })
    
    // Should only show instructor 1
    expect(screen.getByTestId('instructor-1')).toBeInTheDocument()
    expect(screen.queryByTestId('instructor-2')).not.toBeInTheDocument()
    expect(screen.getByTestId('instructors-count')).toHaveTextContent('1')
  })
  
  it('shows tip message when editable', () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: mockInstructorData,
      isLoading: false,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: [],
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent({ editable: true })
    
    expect(screen.getByText(/Drag to move availability blocks/i)).toBeInTheDocument()
    expect(screen.getByText(/Right-click blocks for more options/i)).toBeInTheDocument()
  })
  
  it('handles item click events', async () => {
    const { useAllInstructorsAvailability, useUpdateAvailability, useDeleteAvailability } = 
      require('@/lib/queries/availability')
    const { useInstructorBookings } = require('@/lib/queries/bookings')
    
    useAllInstructorsAvailability.mockReturnValue({
      data: mockInstructorData,
      isLoading: false,
      error: null
    })
    
    useInstructorBookings.mockReturnValue({
      data: [],
      isLoading: false
    })
    
    useUpdateAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    useDeleteAvailability.mockReturnValue({
      mutateAsync: vi.fn()
    })
    
    renderComponent({ editable: true })
    
    const user = userEvent.setup()
    
    // Click on an availability block
    const availabilityButton = screen.getByTestId('availability-1')
    await user.click(availabilityButton)
    
    // Toast should appear (mocked in test setup)
    await waitFor(() => {
      // In a real test, we'd check for toast message
      // For now, just verify the click doesn't crash
      expect(availabilityButton).toBeInTheDocument()
    })
  })
})

