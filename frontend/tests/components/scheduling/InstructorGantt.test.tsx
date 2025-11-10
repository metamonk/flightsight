/**
 * Tests for InstructorGantt Component
 * 
 * Tests the instructor Gantt chart wrapper with availability blocks.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { InstructorGantt, type Instructor, type InstructorAvailability } from '@/components/scheduling/InstructorGantt'

// Mock the Kibo UI Gantt component
vi.mock('@/components/kibo-ui/gantt', () => ({
  Gantt: ({ features, items, className }: any) => (
    <div data-testid="gantt-chart" className={className}>
      <div data-testid="gantt-features">
        {features?.map((f: any) => (
          <div key={f.id} data-testid={`feature-${f.id}`}>
            {f.title}
          </div>
        ))}
      </div>
      <div data-testid="gantt-items">
        {items?.map((item: any) => (
          <div key={item.id} data-testid={`item-${item.id}`} data-status={item.status}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  )
}))

describe('InstructorGantt', () => {
  const mockInstructors: Instructor[] = [
    {
      id: 'instructor-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      avatar_url: 'https://example.com/avatar1.jpg'
    },
    {
      id: 'instructor-2',
      full_name: 'Jane Smith',
      email: 'jane@example.com',
    }
  ]

  const mockAvailability: InstructorAvailability[] = [
    {
      id: 'avail-1',
      instructor_id: 'instructor-1',
      start_time: '2024-11-15T09:00:00Z',
      end_time: '2024-11-15T17:00:00Z',
      day_of_week: 1, // Monday
      is_recurring: true
    },
    {
      id: 'avail-2',
      instructor_id: 'instructor-2',
      start_time: '2024-11-15T10:00:00Z',
      end_time: '2024-11-15T16:00:00Z',
      day_of_week: 1, // Monday
      is_recurring: true
    }
  ]

  it('renders gantt chart with instructors', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    
    expect(screen.getByTestId('gantt-chart')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('transforms instructors to features correctly', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    
    expect(screen.getByTestId('feature-instructor-1')).toBeInTheDocument()
    expect(screen.getByTestId('feature-instructor-2')).toBeInTheDocument()
  })

  it('displays availability blocks', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    
    expect(screen.getByTestId('item-availability-avail-1')).toBeInTheDocument()
    expect(screen.getByTestId('item-availability-avail-2')).toBeInTheDocument()
  })

  it('handles empty instructors array', () => {
    render(
      <InstructorGantt
        instructors={[]}
        availability={[]}
      />
    )
    
    const ganttChart = screen.getByTestId('gantt-chart')
    expect(ganttChart).toBeInTheDocument()
  })

  it('handles empty availability array', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={[]}
      />
    )
    
    // Instructors should still be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays bookings with booked status', () => {
    const mockBookings = [
      {
        id: 'booking-1',
        instructor_id: 'instructor-1',
        scheduled_start: '2024-11-15T10:00:00Z',
        scheduled_end: '2024-11-15T12:00:00Z',
        lesson_type: 'Private Pilot',
        student: {
          full_name: 'Student One'
        }
      }
    ]

    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
        bookings={mockBookings}
      />
    )
    
    const bookingItem = screen.getByTestId('item-booking-booking-1')
    expect(bookingItem).toBeInTheDocument()
    expect(bookingItem).toHaveAttribute('data-status', 'booked')
    expect(screen.getByText('Private Pilot - Student One')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
        className="custom-gantt-class"
      />
    )
    
    const ganttChart = screen.getByTestId('gantt-chart')
    expect(ganttChart).toHaveClass('custom-gantt-class')
  })

  it('handles instructors without avatars', () => {
    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={mockAvailability}
      />
    )
    
    // Should render both instructors, one with avatar and one without
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('handles multiple availability blocks per instructor', () => {
    const multipleAvailability: InstructorAvailability[] = [
      ...mockAvailability,
      {
        id: 'avail-3',
        instructor_id: 'instructor-1',
        start_time: '2024-11-16T09:00:00Z',
        end_time: '2024-11-16T17:00:00Z',
        day_of_week: 2, // Tuesday
        is_recurring: true
      }
    ]

    render(
      <InstructorGantt
        instructors={mockInstructors}
        availability={multipleAvailability}
      />
    )
    
    expect(screen.getByTestId('item-availability-avail-1')).toBeInTheDocument()
    expect(screen.getByTestId('item-availability-avail-2')).toBeInTheDocument()
    expect(screen.getByTestId('item-availability-avail-3')).toBeInTheDocument()
  })
})

