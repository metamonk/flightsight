import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'student' | 'instructor' | 'admin'
export type TrainingLevel = 'student_pilot' | 'private_pilot' | 'instrument_rated' | 'commercial_pilot'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  training_level?: TrainingLevel | null
  phone?: string | null
  avatar_url?: string | null
  is_active: boolean
  preferences?: {
    notifications?: {
      email?: boolean
      in_app?: boolean
      sms?: boolean
    }
    weather_alerts?: boolean
    auto_reschedule?: boolean
  }
  created_at: string
  updated_at: string
  last_login_at?: string | null
}

export interface UserWithStats extends User {
  bookingCount?: number
  lastBookingDate?: string | null
}

const supabase = createClient()

// Query to get all users (admin view)
export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as unknown as User[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query to get users by role
export function useUsersByRole(role?: UserRole) {
  return useQuery({
    queryKey: ['users', 'by-role', role],
    queryFn: async () => {
      if (!role) return []

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', role)
        .order('full_name', { ascending: true })

      if (error) throw error
      return data as unknown as User[]
    },
    enabled: !!role,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query to get single user by ID with booking stats
export function useUserById(userId?: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: async () => {
      if (!userId) return null

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get booking count and last booking date
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('scheduled_start, status')
        .or(`student_id.eq.${userId},instructor_id.eq.${userId}`)
        .order('scheduled_start', { ascending: false })

      if (bookingsError) throw bookingsError

      const lastBooking = bookings?.[0]
      
      return {
        ...user,
        bookingCount: bookings?.length || 0,
        lastBookingDate: lastBooking?.scheduled_start || null,
      } as UserWithStats
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Query to get user statistics
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'stats'],
    queryFn: async () => {
      // Get user data for login activity
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at, last_login_at')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Get booking statistics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('scheduled_start, scheduled_end, status, created_at')
        .or(`student_id.eq.${userId},instructor_id.eq.${userId}`)
        .order('scheduled_start', { ascending: false })

      if (bookingsError) throw bookingsError

      const now = new Date()
      const totalBookings = bookings?.length || 0
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0
      const upcomingBookings = bookings?.filter(b => 
        b.status === 'scheduled' && new Date(b.scheduled_start) > now
      ).length || 0

      // Calculate total flight hours (completed bookings only)
      const totalHours = bookings
        ?.filter(b => b.status === 'completed')
        .reduce((acc, booking) => {
          const start = new Date(booking.scheduled_start)
          const end = new Date(booking.scheduled_end)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          return acc + hours
        }, 0) || 0

      // Calculate activity metrics
      const accountAge = userData?.created_at 
        ? Math.floor((now.getTime() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      const daysSinceLastLogin = userData?.last_login_at
        ? Math.floor((now.getTime() - new Date(userData.last_login_at).getTime()) / (1000 * 60 * 60 * 24))
        : null

      // Calculate booking frequency (bookings per month)
      const monthsSinceJoined = accountAge / 30
      const bookingsPerMonth = monthsSinceJoined > 0 
        ? Math.round((totalBookings / monthsSinceJoined) * 10) / 10
        : 0

      // Calculate completion rate
      const completionRate = totalBookings > 0
        ? Math.round((completedBookings / totalBookings) * 100)
        : 0

      // Calculate cancellation rate
      const cancellationRate = totalBookings > 0
        ? Math.round((cancelledBookings / totalBookings) * 100)
        : 0

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const recentBookings = bookings?.filter(b => 
        new Date(b.created_at) > thirtyDaysAgo
      ).length || 0

      // Get booking trends (last 3 months, month by month)
      const monthlyBookings = []
      for (let i = 0; i < 3; i++) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
        const count = bookings?.filter(b => {
          const bookingDate = new Date(b.created_at)
          return bookingDate >= monthStart && bookingDate <= monthEnd
        }).length || 0
        
        monthlyBookings.unshift({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          count
        })
      }

      return {
        // Basic stats
        totalBookings,
        completedBookings,
        cancelledBookings,
        upcomingBookings,
        totalHours: Math.round(totalHours * 10) / 10,
        
        // Activity metrics
        accountAgeDays: accountAge,
        daysSinceLastLogin,
        bookingsPerMonth,
        recentBookings,
        
        // Performance metrics
        completionRate,
        cancellationRate,
        
        // Trends
        monthlyBookings,
      }
    },
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutation to update user (admin only)
// Task 24.9 - Now uses server action instead of direct Supabase call
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string
      data: Partial<User>
    }) => {
      // Import server action
      const { updateUser } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await updateUser(id, data as any)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user')
      }
      
      return result.data as unknown as User
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', result.id] })
    },
  })
}

// Mutation to promote user to instructor
// Task 24.9 - Now uses server action instead of direct Supabase call
export function usePromoteToInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Import server action
      const { promoteToInstructor } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await promoteToInstructor(userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to promote user to instructor')
      }
      
      return result.data as unknown as User
    },
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Mutation to demote instructor to student
// Task 24.9 - Now uses server action instead of direct Supabase call
export function useDemoteToStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Import server action
      const { demoteToStudent } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await demoteToStudent(userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to demote instructor to student')
      }
      
      return result.data as unknown as User
    },
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Mutation to create admin account
export function useCreateAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      email, 
      password,
      full_name 
    }: { 
      email: string
      password: string
      full_name: string
    }) => {
      // Import the server action dynamically to avoid issues
      const { createAdminAccount } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await createAdminAccount({ 
        email, 
        password, 
        confirmPassword: password, // Pass same as password for server validation
        full_name 
      })
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create admin account')
      }
      
      return result.data
    },
    onSuccess: () => {
      // Invalidate users queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Mutation to deactivate user (mark as inactive)
// Task 24.9 - Now uses server action instead of direct Supabase call
export function useDeactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Import server action
      const { deactivateUser } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await deactivateUser(userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to deactivate user')
      }
      
      return result.data as unknown as User
    },
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// Mutation to reactivate user (mark as active)
// Task 24.9 - Now uses server action instead of direct Supabase call
export function useReactivateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      // Import server action
      const { reactivateUser } = await import('@/app/dashboard/admin/users/actions')
      
      const result = await reactivateUser(userId)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reactivate user')
      }
      
      return result.data as unknown as User
    },
    onSuccess: () => {
      // Invalidate all user queries
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

