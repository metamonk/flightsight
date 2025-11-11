import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database.types'

type AvailabilityPattern = Database['public']['Tables']['availability']['Row']
type AvailabilityInsert = Database['public']['Tables']['availability']['Insert']
type AvailabilityUpdate = Database['public']['Tables']['availability']['Update']

const supabase = createClient()

// Query to get instructor's availability patterns
export function useInstructorAvailability(instructorId?: string) {
  return useQuery({
    queryKey: ['instructorAvailability', instructorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('user_id', instructorId!)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      return data as AvailabilityPattern[]
    },
    enabled: !!instructorId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Query to get all instructors' availability (for admin view)
export function useAllInstructorsAvailability() {
  return useQuery({
    queryKey: ['allInstructorsAvailability'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability')
        .select(`
          id,
          user_id,
          day_of_week,
          start_time,
          end_time,
          is_recurring,
          created_at,
          updated_at,
          users:user_id (
            id,
            full_name,
            email
          )
        `)
        .order('day_of_week', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Query to find available instructors for a specific time range
export function useAvailableInstructors(
  startTime?: string,
  endTime?: string
) {
  return useQuery({
    queryKey: ['availableInstructors', startTime, endTime],
    queryFn: async () => {
      if (!startTime || !endTime) return []

      // Call the find_available_instructors_v2 database function
      const { data, error } = await supabase.rpc('find_available_instructors_v2', {
        p_start_time: startTime,
        p_end_time: endTime,
      })

      if (error) throw error
      return data
    },
    enabled: !!startTime && !!endTime,
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Mutation to create availability pattern
export function useCreateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AvailabilityInsert) => {
      const { data: result, error } = await supabase
        .from('availability')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['instructorAvailability', variables.user_id] })
      queryClient.invalidateQueries({ queryKey: ['allInstructorsAvailability'] })
      queryClient.invalidateQueries({ queryKey: ['availableInstructors'] })
    },
  })
}

// Mutation to update availability pattern
export function useUpdateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AvailabilityUpdate }) => {
      const { data: result, error } = await supabase
        .from('availability')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (result: AvailabilityPattern) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['instructorAvailability', result.user_id] })
      queryClient.invalidateQueries({ queryKey: ['allInstructorsAvailability'] })
      queryClient.invalidateQueries({ queryKey: ['availableInstructors'] })
    },
  })
}

// Mutation to delete availability pattern
export function useDeleteAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { id, userId }
    },
    onSuccess: (variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['instructorAvailability', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['allInstructorsAvailability'] })
      queryClient.invalidateQueries({ queryKey: ['availableInstructors'] })
    },
  })
}

