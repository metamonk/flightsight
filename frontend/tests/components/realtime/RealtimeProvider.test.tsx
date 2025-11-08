import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useRealtimeSubscription,
  useInstructorRealtimeSubscription,
  useAdminRealtimeSubscription,
  RealtimeProvider,
  InstructorRealtimeProvider,
  AdminRealtimeProvider,
} from '@/components/realtime/RealtimeProvider'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'

// Mock Supabase client
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnThis(),
}

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  removeChannel: vi.fn(),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}))

describe('RealtimeProvider - Unit Tests', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('useRealtimeSubscription Hook', () => {
    it('should create a channel with correct user ID', () => {
      const TestComponent = () => {
        useRealtimeSubscription('test-user-123')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('user-test-user-123-updates')
    })

    it('should set up all required postgres_changes subscriptions', () => {
      const TestComponent = () => {
        useRealtimeSubscription('test-user-123')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Should have 5 .on() calls (bookings, 2 weather conflicts, 2 proposals)
      expect(mockChannel.on).toHaveBeenCalledTimes(5)

      // Check bookings subscription
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          table: 'bookings',
          filter: 'student_id=eq.test-user-123',
        }),
        expect.any(Function)
      )

      // Check weather conflicts subscriptions
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'weather_conflicts',
        }),
        expect.any(Function)
      )

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          table: 'weather_conflicts',
        }),
        expect.any(Function)
      )

      // Check proposals subscriptions
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'reschedule_proposals',
        }),
        expect.any(Function)
      )

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'UPDATE',
          table: 'reschedule_proposals',
        }),
        expect.any(Function)
      )
    })

    it('should call subscribe after setting up event handlers', () => {
      const TestComponent = () => {
        useRealtimeSubscription('test-user-123')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      expect(mockChannel.subscribe).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should update connection status to connected on SUBSCRIBED', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      const TestComponent = () => {
        const { connectionStatus } = useRealtimeSubscription('test-user-123')
        return <div data-testid="status">{connectionStatus}</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Initially disconnected
      expect(screen.getByTestId('status')).toHaveTextContent('disconnected')

      // Simulate successful subscription
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
      })

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('connected')
      })
    })

    it('should handle connection errors and attempt reconnection', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      const TestComponent = () => {
        const { connectionStatus } = useRealtimeSubscription('test-user-123')
        return <div data-testid="status">{connectionStatus}</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Simulate channel error
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('Connection failed'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error')
      })

      // Should attempt to resubscribe after delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalledTimes(2) // Initial + 1 retry
      })
    })

    it('should debounce query invalidations', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const TestComponent = () => {
        useRealtimeSubscription('test-user-123')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Get the booking change handler
      const bookingHandler = mockChannel.on.mock.calls.find(
        (call) => call[1].table === 'bookings'
      )?.[2]

      // Simulate multiple rapid updates
      act(() => {
        bookingHandler?.({ eventType: 'UPDATE', new: { id: '1' } })
        bookingHandler?.({ eventType: 'UPDATE', new: { id: '2' } })
        bookingHandler?.({ eventType: 'UPDATE', new: { id: '3' } })
      })

      // Should not invalidate immediately
      expect(invalidateQueriesSpy).not.toHaveBeenCalled()

      // Wait for debounce delay (300ms)
      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Should only invalidate once after debounce
      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(1)
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['bookings', 'test-user-123'],
        })
      })
    })

    it('should cleanup channel on unmount', () => {
      const TestComponent = () => {
        useRealtimeSubscription('test-user-123')
        return <div>Test</div>
      }

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      unmount()

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel)
    })

    it('should reset reconnection state on cleanup', () => {
      const TestComponent = ({ userId }: { userId: string }) => {
        useRealtimeSubscription(userId)
        return <div>Test</div>
      }

      const { rerender } = render(
        <QueryClientProvider client={queryClient}>
          <TestComponent userId="user-1" />
        </QueryClientProvider>
      )

      // Change user ID to trigger cleanup and new subscription
      rerender(
        <QueryClientProvider client={queryClient}>
          <TestComponent userId="user-2" />
        </QueryClientProvider>
      )

      // Should create new channel for new user
      expect(mockSupabase.channel).toHaveBeenCalledWith('user-user-2-updates')
      // Should remove old channel
      expect(mockSupabase.removeChannel).toHaveBeenCalled()
    })
  })

  describe('useInstructorRealtimeSubscription Hook', () => {
    it('should create a channel with correct instructor ID', () => {
      const TestComponent = () => {
        useInstructorRealtimeSubscription('instructor-456')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('instructor-instructor-456-updates')
    })

    it('should filter bookings by instructor_id', () => {
      const TestComponent = () => {
        useInstructorRealtimeSubscription('instructor-456')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          table: 'bookings',
          filter: 'instructor_id=eq.instructor-456',
        }),
        expect.any(Function)
      )
    })
  })

  describe('useAdminRealtimeSubscription Hook', () => {
    it('should create a system-wide channel without user filters', () => {
      const TestComponent = () => {
        useAdminRealtimeSubscription()
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('admin-system-updates')
    })

    it('should subscribe to all tables without filters', () => {
      const TestComponent = () => {
        useAdminRealtimeSubscription()
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Check bookings subscription has no filter
      const bookingsSubscription = mockChannel.on.mock.calls.find(
        (call) => call[1].table === 'bookings'
      )
      expect(bookingsSubscription?.[1]).not.toHaveProperty('filter')

      // Should also subscribe to users table
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          table: 'users',
        }),
        expect.any(Function)
      )
    })

    it('should use longer debounce delays for admin views', async () => {
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const TestComponent = () => {
        useAdminRealtimeSubscription()
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Get the booking change handler
      const bookingHandler = mockChannel.on.mock.calls.find(
        (call) => call[1].table === 'bookings'
      )?.[2]

      // Simulate update
      act(() => {
        bookingHandler?.({ eventType: 'UPDATE', new: { id: '1' } })
      })

      // Should not invalidate at 300ms (user debounce delay)
      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(invalidateQueriesSpy).not.toHaveBeenCalled()

      // Should invalidate at 500ms (admin debounce delay)
      act(() => {
        vi.advanceTimersByTime(200)
      })

      await waitFor(() => {
        expect(invalidateQueriesSpy).toHaveBeenCalledWith({
          queryKey: ['admin-bookings'],
        })
      })
    })
  })

  describe('RealtimeProvider Component', () => {
    it('should render children when connected', () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider userId="test-user">
            <div data-testid="child">Child Content</div>
          </RealtimeProvider>
        </QueryClientProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('should show reconnecting message when disconnected', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider userId="test-user">
            <div data-testid="child">Child Content</div>
          </RealtimeProvider>
        </QueryClientProvider>
      )

      // Simulate disconnection
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.CLOSED)
      })

      await waitFor(() => {
        expect(screen.getByText(/Reconnecting to real-time updates/i)).toBeInTheDocument()
      })
    })

    it('should show error message on connection failure', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider userId="test-user">
            <div data-testid="child">Child Content</div>
          </RealtimeProvider>
        </QueryClientProvider>
      )

      // Simulate error
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('Failed'))
      })

      await waitFor(() => {
        expect(screen.getByText(/Connection failed/i)).toBeInTheDocument()
        expect(screen.getByText(/Please refresh the page/i)).toBeInTheDocument()
      })
    })

    it('should not show status indicator when connected', () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <RealtimeProvider userId="test-user">
            <div data-testid="child">Child Content</div>
          </RealtimeProvider>
        </QueryClientProvider>
      )

      expect(screen.queryByText(/Reconnecting/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/Connection failed/i)).not.toBeInTheDocument()
    })
  })

  describe('InstructorRealtimeProvider Component', () => {
    it('should use instructor subscription hook', () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <InstructorRealtimeProvider instructorId="instructor-123">
            <div>Instructor Dashboard</div>
          </InstructorRealtimeProvider>
        </QueryClientProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('instructor-instructor-123-updates')
    })
  })

  describe('AdminRealtimeProvider Component', () => {
    it('should use admin subscription hook', () => {
      mockChannel.subscribe.mockImplementation((callback) => {
        callback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
        return mockChannel
      })

      render(
        <QueryClientProvider client={queryClient}>
          <AdminRealtimeProvider>
            <div>Admin Dashboard</div>
          </AdminRealtimeProvider>
        </QueryClientProvider>
      )

      expect(mockSupabase.channel).toHaveBeenCalledWith('admin-system-updates')
    })
  })

  describe('Error Handling & Reconnection', () => {
    it('should exponentially backoff reconnection attempts', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      const TestComponent = () => {
        useRealtimeSubscription('test-user')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Simulate connection failure
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
      })

      // First retry after 1000ms
      act(() => {
        vi.advanceTimersByTime(1000)
      })
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(2)

      // Fail again
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
      })

      // Second retry after 2000ms (doubled)
      act(() => {
        vi.advanceTimersByTime(2000)
      })
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(3)

      // Fail again
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
      })

      // Third retry after 4000ms (doubled again)
      act(() => {
        vi.advanceTimersByTime(4000)
      })
      expect(mockChannel.subscribe).toHaveBeenCalledTimes(4)
    })

    it('should stop retrying after max attempts', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      const TestComponent = () => {
        const { connectionStatus } = useRealtimeSubscription('test-user')
        return <div data-testid="status">{connectionStatus}</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Fail 5 times (max attempts)
      for (let i = 0; i < 5; i++) {
        act(() => {
          subscribeCallback(REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR, new Error('Failed'))
        })

        act(() => {
          vi.advanceTimersByTime(30000) // Use max delay
        })
      }

      // Should show error status and stop retrying
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('error')
      })

      // Should not attempt more retries
      const callCountBefore = mockChannel.subscribe.mock.calls.length
      act(() => {
        vi.advanceTimersByTime(60000)
      })
      expect(mockChannel.subscribe.mock.calls.length).toBe(callCountBefore)
    })

    it('should reset reconnection count on successful connection', async () => {
      let subscribeCallback: any

      mockChannel.subscribe.mockImplementation((callback) => {
        subscribeCallback = callback
        return mockChannel
      })

      const TestComponent = () => {
        useRealtimeSubscription('test-user')
        return <div>Test</div>
      }

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      )

      // Fail once
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
      })

      // Wait for retry
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Successfully connect
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.SUBSCRIBED)
      })

      // Fail again - should start from 1000ms delay again, not 2000ms
      act(() => {
        subscribeCallback(REALTIME_SUBSCRIBE_STATES.TIMED_OUT)
      })

      const callCountBefore = mockChannel.subscribe.mock.calls.length

      // After 1000ms, should retry (proving delay was reset)
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(mockChannel.subscribe.mock.calls.length).toBe(callCountBefore + 1)
    })
  })
})

