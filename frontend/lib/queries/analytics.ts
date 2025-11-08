import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format, startOfWeek, endOfWeek, subDays, eachDayOfInterval } from 'date-fns'

const supabase = createClient()

/**
 * Admin Analytics Queries
 * 
 * React Query hooks for fetching system-wide analytics data
 * Used by the admin dashboard for visualizations and metrics
 */

/**
 * Fetch all bookings for analytics
 */
export function useAdminBookings() {
  return useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:students(*),
          instructor:instructors(*),
          aircraft(*)
        `)
        .gte('scheduled_start', subDays(new Date(), 30).toISOString())
        .order('scheduled_start', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch all weather conflicts
 */
export function useAdminWeatherConflicts() {
  return useQuery({
    queryKey: ['admin-weather-conflicts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weather_conflicts')
        .select(`
          *,
          booking:bookings(
            *,
            student:students(*),
            instructor:instructors(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch all proposals
 */
export function useAdminProposals() {
  return useQuery({
    queryKey: ['admin-proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .select(`
          *,
          conflict:weather_conflicts(
            *,
            booking:bookings(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch all users (instructors and students)
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Derived hook: Calculate booking trends over last 7 days
 */
export function useBookingTrends() {
  const { data: bookings } = useAdminBookings()

  return useQuery({
    queryKey: ['booking-trends', bookings],
    queryFn: () => {
      if (!bookings) return []

      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      })

      return last7Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const dayBookings = bookings.filter((b: any) => 
          b.scheduled_start?.startsWith(dayStr)
        )

        return {
          date: format(day, 'MM/dd'),
          confirmed: dayBookings.filter((b: any) => b.status === 'confirmed').length,
          weatherHold: dayBookings.filter((b: any) => b.status === 'weather_hold').length,
          cancelled: dayBookings.filter((b: any) => b.status === 'cancelled').length,
        }
      })
    },
    enabled: !!bookings,
  })
}

/**
 * Derived hook: Calculate conflict statistics by week
 */
export function useConflictStats() {
  const { data: conflicts } = useAdminWeatherConflicts()

  return useQuery({
    queryKey: ['conflict-stats', conflicts],
    queryFn: () => {
      if (!conflicts) return []

      const last4Weeks = Array.from({ length: 4 }, (_, i) => {
        const weekStart = startOfWeek(subDays(new Date(), i * 7))
        const weekEnd = endOfWeek(weekStart)
        
        const weekConflicts = conflicts.filter((c: any) => {
          const createdAt = new Date(c.created_at)
          return createdAt >= weekStart && createdAt <= weekEnd
        })

        return {
          period: `Week ${4 - i}`,
          total: weekConflicts.length,
          resolved: weekConflicts.filter((c: any) => c.resolved).length,
          pending: weekConflicts.filter((c: any) => !c.resolved).length,
        }
      })

      return last4Weeks.reverse()
    },
    enabled: !!conflicts,
  })
}

/**
 * Derived hook: Calculate instructor activity distribution
 */
export function useInstructorActivity() {
  const { data: bookings } = useAdminBookings()
  const { data: users } = useAdminUsers()

  return useQuery({
    queryKey: ['instructor-activity', bookings, users],
    queryFn: () => {
      if (!bookings || !users) return []

      const instructors = users.filter((u: any) => u.role === 'instructor')
      
      return instructors
        .map((instructor: any) => ({
          name: instructor.email?.split('@')[0] || 'Unknown',
          value: bookings.filter((b: any) => b.instructor_id === instructor.id).length,
        }))
        .filter(i => i.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 most active instructors
    },
    enabled: !!bookings && !!users,
  })
}

/**
 * Derived hook: Calculate system metrics
 */
export function useSystemMetrics() {
  const { data: bookings } = useAdminBookings()
  const { data: conflicts } = useAdminWeatherConflicts()
  const { data: users } = useAdminUsers()

  return useQuery({
    queryKey: ['system-metrics', bookings, conflicts, users],
    queryFn: () => {
      const activeBookings = bookings?.filter((b: any) => 
        b.status === 'confirmed' || b.status === 'weather_hold'
      ).length || 0

      const activeInstructors = users?.filter((u: any) => u.role === 'instructor').length || 0
      const activeStudents = users?.filter((u: any) => u.role === 'student').length || 0
      
      const totalConflicts = conflicts?.length || 0
      const resolvedConflicts = conflicts?.filter((c: any) => c.resolved).length || 0
      const activeConflicts = totalConflicts - resolvedConflicts
      
      const resolutionRate = totalConflicts > 0 
        ? Math.round((resolvedConflicts / totalConflicts) * 100)
        : 100

      return {
        totalBookings: activeBookings,
        activeInstructors,
        activeStudents,
        activeConflicts,
        resolutionRate,
      }
    },
    enabled: !!bookings && !!conflicts && !!users,
  })
}

