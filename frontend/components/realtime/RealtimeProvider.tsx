'use client'

import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, REALTIME_SUBSCRIBE_STATES } from '@supabase/supabase-js'

/**
 * Debounce utility for high-frequency updates
 * Delays function execution until after a specified time has passed since the last call
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Realtime Subscription Hook
 * 
 * Subscribes to Supabase Realtime channels for real-time updates
 * on bookings, weather conflicts, and proposals.
 * 
 * Features:
 * - Automatic reconnection on connection drops
 * - Error handling with graceful fallbacks
 * - Debouncing for high-frequency updates
 * - Proper cleanup on unmount and user context changes
 * - Connection status monitoring
 * 
 * Automatically invalidates React Query cache when changes are detected.
 */
export function useRealtimeSubscription(userId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelayRef = useRef(1000) // Start with 1 second
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')

  // Debounced query invalidation functions
  const debouncedInvalidateBookings = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['bookings', userId] })
    }, 300),
    [queryClient, userId]
  )

  const debouncedInvalidateConflicts = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts', userId] })
    }, 300),
    [queryClient, userId]
  )

  const debouncedInvalidateProposals = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
    }, 300),
    [queryClient]
  )

  // Reconnection logic with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.')
      setConnectionStatus('error')
      return
    }

    reconnectAttemptsRef.current += 1
    const delay = reconnectDelayRef.current

    console.log(
      `🔄 Attempting to reconnect... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
    )

    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.subscribe()
      }
    }, delay)

    // Exponential backoff: double the delay for next attempt
    reconnectDelayRef.current = Math.min(delay * 2, 30000) // Cap at 30 seconds
  }, [])

  useEffect(() => {
    if (!userId) return

    console.log(`🔌 Setting up realtime subscriptions for user: ${userId}`)

    // Create a channel for this user's data
    const channel = supabase
      .channel(`user-${userId}-updates`)

      // Listen for booking changes where user is the student
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `student_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📅 Booking changed (as student):', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateBookings()
        }
      )

      // Also listen for bookings where user is the instructor
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `instructor_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📅 Booking changed (as instructor):', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateBookings()
        }
      )

      // Listen for new weather conflicts
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'weather_conflicts',
        },
        (payload) => {
          console.log('⚠️ New weather conflict detected:', (payload.new as any)?.id)
          debouncedInvalidateConflicts()
        }
      )

      // Listen for weather conflict updates (resolved status)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'weather_conflicts',
        },
        (payload) => {
          console.log('✏️ Weather conflict updated:', (payload.new as any)?.id, (payload.new as any)?.resolved)
          debouncedInvalidateConflicts()
        }
      )

      // Listen for new reschedule proposals
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reschedule_proposals',
        },
        (payload) => {
          console.log('💡 New proposal received:', (payload.new as any)?.id)
          debouncedInvalidateProposals()
        }
      )

      // Listen for proposal status changes
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reschedule_proposals',
        },
        (payload) => {
          console.log('📝 Proposal updated:', (payload.new as any)?.id, (payload.new as any)?.status)
          debouncedInvalidateProposals()
        }
      )

      .subscribe((status, error) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Realtime subscriptions active')
          setConnectionStatus('connected')
          reconnectAttemptsRef.current = 0 // Reset reconnect attempts on successful connection
          reconnectDelayRef.current = 1000 // Reset delay
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error('❌ Channel error:', error)
          setConnectionStatus('error')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.warn('⏱️ Connection timed out')
          setConnectionStatus('disconnected')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          console.warn('🔌 Connection closed')
          setConnectionStatus('disconnected')
          reconnect()
        }
      })

    channelRef.current = channel

    // Cleanup: unsubscribe when component unmounts or userId changes
    return () => {
      console.log(`🧹 Cleaning up realtime subscriptions for user: ${userId}`)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      reconnectAttemptsRef.current = 0
      reconnectDelayRef.current = 1000
      setConnectionStatus('disconnected')
    }
  }, [userId, queryClient, supabase, debouncedInvalidateBookings, debouncedInvalidateConflicts, debouncedInvalidateProposals, reconnect])

  return { connectionStatus }
}

/**
 * Instructor Realtime Subscription Hook
 * 
 * Subscribes to Supabase Realtime channels for instructor-specific real-time updates
 * on their bookings, weather conflicts, and proposals.
 * 
 * Features:
 * - Tracks instructor's own bookings
 * - Monitors proposals requiring instructor approval
 * - Includes same error handling and reconnection logic as user subscriptions
 */
export function useInstructorRealtimeSubscription(instructorId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelayRef = useRef(1000)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')

  // Debounced query invalidation functions
  const debouncedInvalidateInstructorBookings = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['instructor-bookings', instructorId] })
    }, 300),
    [queryClient, instructorId]
  )

  const debouncedInvalidateInstructorProposals = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['instructor-proposals', instructorId] })
    }, 300),
    [queryClient, instructorId]
  )

  const debouncedInvalidateConflicts = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts', instructorId] })
    }, 300),
    [queryClient, instructorId]
  )

  // Reconnection logic with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.')
      setConnectionStatus('error')
      return
    }

    reconnectAttemptsRef.current += 1
    const delay = reconnectDelayRef.current

    console.log(
      `🔄 Attempting to reconnect instructor channel... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
    )

    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.subscribe()
      }
    }, delay)

    reconnectDelayRef.current = Math.min(delay * 2, 30000)
  }, [])

  useEffect(() => {
    if (!instructorId) return

    console.log(`🔌 Setting up instructor realtime subscriptions for: ${instructorId}`)

    const channel = supabase
      .channel(`instructor-${instructorId}-updates`)

      // Listen for changes to bookings where they are the instructor
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `instructor_id=eq.${instructorId}`,
        },
        (payload) => {
          console.log('👨‍🏫 Instructor booking changed:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateInstructorBookings()
        }
      )

      // Listen for weather conflicts affecting instructor's bookings
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_conflicts',
        },
        (payload) => {
          console.log('⚠️ Weather conflict update:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateConflicts()
          debouncedInvalidateInstructorProposals()
        }
      )

      // Listen for proposal changes (especially student responses)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reschedule_proposals',
        },
        (payload) => {
          console.log('📝 Proposal updated for instructor:', (payload.new as any)?.id, (payload.new as any)?.student_response)
          debouncedInvalidateInstructorProposals()
        }
      )

      .subscribe((status, error) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Instructor realtime subscriptions active')
          setConnectionStatus('connected')
          reconnectAttemptsRef.current = 0
          reconnectDelayRef.current = 1000
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error('❌ Instructor channel error:', error)
          setConnectionStatus('error')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.warn('⏱️ Instructor connection timed out')
          setConnectionStatus('disconnected')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          console.warn('🔌 Instructor connection closed')
          setConnectionStatus('disconnected')
          reconnect()
        }
      })

    channelRef.current = channel

    return () => {
      console.log(`🧹 Cleaning up instructor realtime subscriptions: ${instructorId}`)
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      reconnectAttemptsRef.current = 0
      reconnectDelayRef.current = 1000
      setConnectionStatus('disconnected')
    }
  }, [instructorId, queryClient, supabase, debouncedInvalidateInstructorBookings, debouncedInvalidateInstructorProposals, debouncedInvalidateConflicts, reconnect])

  return { connectionStatus }
}

/**
 * Admin Realtime Subscription Hook
 * 
 * Subscribes to Supabase Realtime channels for system-wide real-time updates
 * for admin dashboards.
 * 
 * Features:
 * - Monitors all bookings, conflicts, and proposals system-wide
 * - Updates admin analytics in real-time
 * - Includes same error handling and reconnection logic
 */
export function useAdminRealtimeSubscription() {
  const queryClient = useQueryClient()
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelayRef = useRef(1000)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')

  // Debounced query invalidation functions
  const debouncedInvalidateAdminBookings = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    }, 500), // Slightly longer delay for admin views
    [queryClient]
  )

  const debouncedInvalidateAdminConflicts = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-weather-conflicts'] })
    }, 500),
    [queryClient]
  )

  const debouncedInvalidateAdminProposals = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-proposals'] })
    }, 500),
    [queryClient]
  )

  const debouncedInvalidateAdminUsers = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    }, 1000), // Even longer for user changes
    [queryClient]
  )

  const debouncedInvalidateAirports = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['airports'] })
    }, 500),
    [queryClient]
  )

  const debouncedInvalidateLessonTypes = useCallback(
    debounce(() => {
      queryClient.invalidateQueries({ queryKey: ['lessonTypes'] })
    }, 500),
    [queryClient]
  )

  // Reconnection logic with exponential backoff
  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Please refresh the page.')
      setConnectionStatus('error')
      return
    }

    reconnectAttemptsRef.current += 1
    const delay = reconnectDelayRef.current

    console.log(
      `🔄 Attempting to reconnect admin channel... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
    )

    setTimeout(() => {
      if (channelRef.current) {
        channelRef.current.subscribe()
      }
    }, delay)

    reconnectDelayRef.current = Math.min(delay * 2, 30000)
  }, [])

  useEffect(() => {
    console.log('🔌 Setting up admin realtime subscriptions (system-wide)')

    const channel = supabase
      .channel('admin-system-updates')

      // Listen for all booking changes system-wide
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('🛫 System booking changed:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateAdminBookings()
        }
      )

      // Listen for all weather conflicts
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_conflicts',
        },
        (payload) => {
          console.log('🌦️ System weather conflict:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateAdminConflicts()
        }
      )

      // Listen for all proposals
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reschedule_proposals',
        },
        (payload) => {
          console.log('📊 System proposal update:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateAdminProposals()
        }
      )

      // Listen for user changes (new registrations, profile updates)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('👤 User update:', payload.eventType, (payload.new as any)?.id)
          debouncedInvalidateAdminUsers()
        }
      )

      // Listen for airport changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'airports',
        },
        (payload) => {
          console.log('✈️ Airport update:', payload.eventType, (payload.new as any)?.code)
          debouncedInvalidateAirports()
        }
      )

      // Listen for lesson type changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lesson_types',
        },
        (payload) => {
          console.log('📚 Lesson type update:', payload.eventType, (payload.new as any)?.name)
          debouncedInvalidateLessonTypes()
        }
      )

      .subscribe((status, error) => {
        if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
          console.log('✅ Admin realtime subscriptions active')
          setConnectionStatus('connected')
          reconnectAttemptsRef.current = 0
          reconnectDelayRef.current = 1000
        } else if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
          console.error('❌ Admin channel error:', error)
          setConnectionStatus('error')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.TIMED_OUT) {
          console.warn('⏱️ Admin connection timed out')
          setConnectionStatus('disconnected')
          reconnect()
        } else if (status === REALTIME_SUBSCRIBE_STATES.CLOSED) {
          console.warn('🔌 Admin connection closed')
          setConnectionStatus('disconnected')
          reconnect()
        }
      })

    channelRef.current = channel

    return () => {
      console.log('🧹 Cleaning up admin realtime subscriptions')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      reconnectAttemptsRef.current = 0
      reconnectDelayRef.current = 1000
      setConnectionStatus('disconnected')
    }
  }, [queryClient, supabase, debouncedInvalidateAdminBookings, debouncedInvalidateAdminConflicts, debouncedInvalidateAdminProposals, debouncedInvalidateAdminUsers, debouncedInvalidateAirports, debouncedInvalidateLessonTypes, reconnect])

  return { connectionStatus }
}

/**
 * Realtime Provider Component (Student View)
 * 
 * Wrap this around student dashboard components that need real-time updates.
 * It handles the subscription setup and cleanup automatically.
 * 
 * Features:
 * - Displays connection status indicator
 * - Shows error message on connection failures
 * - Provides visual feedback for reconnection attempts
 */
export function RealtimeProvider({
  userId,
  children,
}: {
  userId: string
  children: React.ReactNode
}) {
  const { connectionStatus } = useRealtimeSubscription(userId)

  return (
    <>
      {/* Connection Status Indicator - Only show when not connected */}
      {connectionStatus !== 'connected' && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
            connectionStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {connectionStatus === 'error' ? (
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>Connection failed. Please refresh the page.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              <span>Reconnecting to real-time updates...</span>
            </div>
          )}
        </div>
      )}
      {children}
    </>
  )
}

/**
 * Instructor Realtime Provider Component
 * 
 * Wrap this around instructor dashboard components that need real-time updates.
 */
export function InstructorRealtimeProvider({
  instructorId,
  children,
}: {
  instructorId: string
  children: React.ReactNode
}) {
  const { connectionStatus } = useInstructorRealtimeSubscription(instructorId)

  return (
    <>
      {connectionStatus !== 'connected' && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
            connectionStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {connectionStatus === 'error' ? (
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>Connection failed. Please refresh the page.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              <span>Reconnecting to real-time updates...</span>
            </div>
          )}
        </div>
      )}
      {children}
    </>
  )
}

/**
 * Admin Realtime Provider Component
 * 
 * Wrap this around admin dashboard components that need real-time updates.
 */
export function AdminRealtimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { connectionStatus } = useAdminRealtimeSubscription()

  return (
    <>
      {connectionStatus !== 'connected' && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-all ${
            connectionStatus === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}
        >
          {connectionStatus === 'error' ? (
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>Connection failed. Please refresh the page.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="animate-spin">🔄</span>
              <span>Reconnecting to real-time updates...</span>
            </div>
          )}
        </div>
      )}
      {children}
    </>
  )
}

