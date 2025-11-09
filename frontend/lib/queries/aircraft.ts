import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Aircraft = Database['public']['Tables']['aircraft']['Row']
type AircraftInsert = Database['public']['Tables']['aircraft']['Insert']
type AircraftUpdate = Database['public']['Tables']['aircraft']['Update']

const supabase = createClient()

// Query to get all aircraft (admin view)
export function useAllAircraft(includeInactive = false) {
  return useQuery({
    queryKey: ['aircraft', 'all', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('aircraft')
        .select('*')
        .order('tail_number', { ascending: true })

      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Aircraft[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query to get single aircraft by ID
export function useAircraftById(aircraftId?: string) {
  return useQuery({
    queryKey: ['aircraft', aircraftId],
    queryFn: async () => {
      if (!aircraftId) return null

      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .eq('id', aircraftId)
        .single()

      if (error) throw error
      return data as Aircraft
    },
    enabled: !!aircraftId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query to get aircraft usage statistics
export function useAircraftUsageStats(aircraftId: string) {
  return useQuery({
    queryKey: ['aircraft', aircraftId, 'stats'],
    queryFn: async () => {
      // Get booking count and total hours
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('scheduled_start, scheduled_end, status')
        .eq('aircraft_id', aircraftId)
        .in('status', ['scheduled', 'completed'])

      if (error) throw error

      const totalBookings = bookings?.length || 0
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
      
      // Calculate total hours flown (completed bookings only)
      const totalHours = bookings
        ?.filter(b => b.status === 'completed')
        .reduce((acc, booking) => {
          const start = new Date(booking.scheduled_start)
          const end = new Date(booking.scheduled_end)
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
          return acc + hours
        }, 0) || 0

      return {
        totalBookings,
        completedBookings,
        upcomingBookings: totalBookings - completedBookings,
        totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      }
    },
    enabled: !!aircraftId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Mutation to create aircraft
export function useCreateAircraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AircraftInsert) => {
      const { data: result, error } = await supabase
        .from('aircraft')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      // Invalidate aircraft queries
      queryClient.invalidateQueries({ queryKey: ['aircraft'] })
    },
  })
}

// Mutation to update aircraft
export function useUpdateAircraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AircraftUpdate }) => {
      const { data: result, error } = await supabase
        .from('aircraft')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (result) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['aircraft'] })
      queryClient.invalidateQueries({ queryKey: ['aircraft', result.id] })
    },
  })
}

// Mutation to deactivate aircraft (soft delete)
export function useDeactivateAircraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (aircraftId: string) => {
      const { data, error } = await supabase
        .from('aircraft')
        .update({ is_active: false })
        .eq('id', aircraftId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate aircraft queries
      queryClient.invalidateQueries({ queryKey: ['aircraft'] })
    },
  })
}

// Mutation to reactivate aircraft
export function useReactivateAircraft() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (aircraftId: string) => {
      const { data, error } = await supabase
        .from('aircraft')
        .update({ is_active: true })
        .eq('id', aircraftId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate aircraft queries
      queryClient.invalidateQueries({ queryKey: ['aircraft'] })
    },
  })
}

