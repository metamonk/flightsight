/**
 * Tests for InstructorAvatarGroup Component
 * 
 * Tests the avatar stack display for available instructors.
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InstructorAvatarGroup } from '@/components/dashboard/InstructorAvatarGroup'
import * as userQueries from '@/lib/queries/users'

// Mock the queries module
vi.mock('@/lib/queries/users', () => ({
  useUsersByRole: vi.fn(),
}))

describe('InstructorAvatarGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isSuccess: false,
      isError: false,
      isFetching: false,
      isPending: true,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} />)
    
    expect(screen.getByText('Instructors')).toBeInTheDocument()
  })

  it('renders instructor avatars when data is loaded', () => {
    const mockInstructors = [
      {
        id: '1',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'instructor' as const,
        is_active: true,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'jane@example.com',
        full_name: 'Jane Smith',
        role: 'instructor' as const,
        is_active: true,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: mockInstructors,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} />)
    
    expect(screen.getByText('Available Instructors')).toBeInTheDocument()
    expect(screen.getByText('2 instructors on staff')).toBeInTheDocument()
  })

  it('displays correct count with more than maxDisplay instructors', () => {
    const mockInstructors = Array.from({ length: 7 }, (_, i) => ({
      id: String(i + 1),
      email: `instructor${i + 1}@example.com`,
      full_name: `Instructor ${i + 1}`,
      role: 'instructor' as const,
      is_active: true,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }))

    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: mockInstructors,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} maxDisplay={5} />)
    
    expect(screen.getByText('7 instructors on staff')).toBeInTheDocument()
    // Should show +2 for remaining count (7 - 5 = 2)
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('filters out inactive instructors when activeOnly is true', () => {
    const mockInstructors = [
      {
        id: '1',
        email: 'active@example.com',
        full_name: 'Active Instructor',
        role: 'instructor' as const,
        is_active: true,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        email: 'inactive@example.com',
        full_name: 'Inactive Instructor',
        role: 'instructor' as const,
        is_active: false,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: mockInstructors,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} activeOnly={true} />)
    
    // Should only show 1 active instructor
    expect(screen.getByText('1 instructor on staff')).toBeInTheDocument()
  })

  it('renders empty state when no instructors are available', () => {
    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} />)
    
    expect(screen.getByText('No instructors available')).toBeInTheDocument()
  })

  it('renders error state when query fails', () => {
    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
      isSuccess: false,
      isError: true,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    render(<InstructorAvatarGroup showCard={true} />)
    
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Failed to load instructors')).toBeInTheDocument()
  })

  it('renders without card wrapper when showCard is false', () => {
    const mockInstructors = [
      {
        id: '1',
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'instructor' as const,
        is_active: true,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    vi.mocked(userQueries.useUsersByRole).mockReturnValue({
      data: mockInstructors,
      isLoading: false,
      error: null,
      isSuccess: true,
      isError: false,
      isFetching: false,
      isPending: false,
      refetch: vi.fn(),
    } as any)

    const { container } = render(<InstructorAvatarGroup showCard={false} />)
    
    // Should not have Card component classes
    expect(container.querySelector('.rounded-xl')).not.toBeInTheDocument()
  })
})

