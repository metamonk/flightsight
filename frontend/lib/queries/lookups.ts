import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Airport = Database['public']['Tables']['airports']['Row']
type AirportInsert = Database['public']['Tables']['airports']['Insert']
type AirportUpdate = Database['public']['Tables']['airports']['Update']

type LessonType = Database['public']['Tables']['lesson_types']['Row']
type LessonTypeInsert = Database['public']['Tables']['lesson_types']['Insert']
type LessonTypeUpdate = Database['public']['Tables']['lesson_types']['Update']

const supabase = createClient()

// ============================================
// AIRPORTS
// ============================================

// Query to get all active airports
export function useActiveAirports() {
  return useQuery({
    queryKey: ['airports', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data as Airport[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Query to get all airports (admin only)
export function useAllAirports() {
  return useQuery({
    queryKey: ['airports', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('airports')
        .select('*')
        .order('name')

      if (error) throw error
      return data as Airport[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation to create airport
export function useCreateAirport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AirportInsert) => {
      const { data: result, error } = await supabase
        .from('airports')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] })
    },
  })
}

// Mutation to update airport
export function useUpdateAirport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AirportUpdate }) => {
      const { data: result, error } = await supabase
        .from('airports')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] })
    },
  })
}

// Mutation to delete airport (soft delete by setting is_active = false)
export function useDeactivateAirport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('airports')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] })
    },
  })
}

// Mutation to reactivate airport
export function useReactivateAirport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('airports')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['airports'] })
    },
  })
}

// ============================================
// LESSON TYPES
// ============================================

// Query to get all active lesson types
export function useActiveLessonTypes() {
  return useQuery({
    queryKey: ['lessonTypes', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_types')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('name')

      if (error) throw error
      return data as LessonType[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Query to get all lesson types (admin only)
export function useAllLessonTypes() {
  return useQuery({
    queryKey: ['lessonTypes', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_types')
        .select('*')
        .order('category')
        .order('name')

      if (error) throw error
      return data as LessonType[]
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Mutation to create lesson type
export function useCreateLessonType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LessonTypeInsert) => {
      const { data: result, error } = await supabase
        .from('lesson_types')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonTypes'] })
    },
  })
}

// Mutation to update lesson type
export function useUpdateLessonType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LessonTypeUpdate }) => {
      const { data: result, error } = await supabase
        .from('lesson_types')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonTypes'] })
    },
  })
}

// Mutation to delete lesson type (soft delete by setting is_active = false)
export function useDeactivateLessonType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('lesson_types')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonTypes'] })
    },
  })
}

// Mutation to reactivate lesson type
export function useReactivateLessonType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result, error } = await supabase
        .from('lesson_types')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonTypes'] })
    },
  })
}

