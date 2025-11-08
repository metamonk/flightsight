import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const supabase = createClient()

/**
 * Fetch user's upcoming bookings
 */
export function useBookings(userId: string) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:users!bookings_student_id_fkey(id, full_name, email, avatar_url),
          instructor:users!bookings_instructor_id_fkey(id, full_name, email, avatar_url),
          aircraft(*)
        `)
        .eq('student_id', userId)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch active weather conflicts for user's bookings
 */
export function useWeatherConflicts(userId: string) {
  return useQuery({
    queryKey: ['weather-conflicts', userId],
    queryFn: async () => {
      // First, get user's booking IDs
      const { data: userBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .or(`student_id.eq.${userId},instructor_id.eq.${userId}`)

      if (bookingsError) throw bookingsError
      
      const bookingIds = userBookings?.map(b => b.id) || []
      
      if (bookingIds.length === 0) {
        return []
      }

      // Then fetch weather conflicts for those bookings
      const { data, error } = await supabase
        .from('weather_conflicts')
        .select(`
          *,
          booking:bookings(
            *,
            student:users!bookings_student_id_fkey(id, full_name, email),
            instructor:users!bookings_instructor_id_fkey(id, full_name, email),
            aircraft(*)
          )
        `)
        .in('booking_id', bookingIds)
        .is('resolved_at', null)
        .order('detected_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Fetch AI-generated reschedule proposals for user's conflicts
 */
export function useProposals(conflictId?: string) {
  return useQuery({
    queryKey: ['proposals', conflictId],
    queryFn: async () => {
      let query = supabase
        .from('reschedule_proposals')
        .select(`
          *,
          conflict:weather_conflicts(
            *,
            booking:bookings(*)
          )
        `)
        .order('ai_score', { ascending: false })

      if (conflictId) {
        query = query.eq('conflict_id', conflictId)
      }

      const { data, error } = await query

      if (error) throw error
      return data
    },
    enabled: !!conflictId, // Only run if conflictId is provided
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Accept a reschedule proposal (student action)
 */
export function useAcceptProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      // @ts-ignore - Type will be properly defined when database types are generated
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .update({ 
          status: 'accepted',
          student_response: 'accepted' 
        })
        .eq('id', proposalId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (proposalId) => {
      // Show loading toast
      toast.loading('Accepting proposal...', { id: proposalId })
    },
    onSuccess: (_data, proposalId) => {
      // Dismiss loading toast and show success
      toast.success('✅ Proposal accepted! Your instructor will be notified.', { 
        id: proposalId,
        duration: 4000,
      })
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error: Error, proposalId) => {
      // Dismiss loading toast and show error
      toast.error(`Failed to accept proposal: ${error.message}`, { 
        id: proposalId,
        duration: 5000,
      })
    },
    retry: 1, // Retry once on failure
  })
}

/**
 * Reject a reschedule proposal (student action)
 */
export function useRejectProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      // @ts-ignore - Type will be properly defined when database types are generated
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .update({ 
          status: 'rejected',
          student_response: 'rejected'
        })
        .eq('id', proposalId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (proposalId) => {
      toast.loading('Rejecting proposal...', { id: proposalId })
    },
    onSuccess: (_data, proposalId) => {
      toast.success('Proposal declined', { 
        id: proposalId,
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts'] })
    },
    onError: (error: Error, proposalId) => {
      toast.error(`Failed to reject proposal: ${error.message}`, { 
        id: proposalId,
        duration: 5000,
      })
    },
    retry: 1,
  })
}

/**
 * Fetch instructor's bookings (all bookings where they are the instructor)
 */
export function useInstructorBookings(instructorId: string) {
  return useQuery({
    queryKey: ['instructor-bookings', instructorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          student:users!bookings_student_id_fkey(id, full_name, email, avatar_url),
          instructor:users!bookings_instructor_id_fkey(id, full_name, email, avatar_url),
          aircraft(*)
        `)
        .eq('instructor_id', instructorId)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch all proposals for instructor's bookings
 */
export function useInstructorProposals(instructorId: string) {
  return useQuery({
    queryKey: ['instructor-proposals', instructorId],
    queryFn: async () => {
      // First, get instructor's booking IDs
      const { data: instructorBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('instructor_id', instructorId)

      if (bookingsError) throw bookingsError
      
      const bookingIds = instructorBookings?.map(b => b.id) || []
      
      if (bookingIds.length === 0) {
        return []
      }

      // Get conflicts for those bookings
      const { data: conflicts, error: conflictsError } = await supabase
        .from('weather_conflicts')
        .select('id')
        .in('booking_id', bookingIds)

      if (conflictsError) throw conflictsError

      const conflictIds = conflicts?.map(c => c.id) || []

      if (conflictIds.length === 0) {
        return []
      }

      // Finally, get proposals for those conflicts
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .select(`
          *,
          conflict:weather_conflicts(
            *,
            booking:bookings(
              *,
              student:users!bookings_student_id_fkey(id, full_name, email),
              aircraft(*)
            )
          )
        `)
        .in('conflict_id', conflictIds)
        .in('student_response', ['accepted', 'pending'])
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Approve a reschedule proposal (instructor action)
 */
export function useApproveProposal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ proposalId, bookingId }: { proposalId: string; bookingId: string }) => {
      // Update proposal status to accepted
      const { error: proposalError } = await supabase
        .from('reschedule_proposals')
        .update({ status: 'accepted', instructor_approved_at: new Date().toISOString() })
        .eq('id', proposalId)

      if (proposalError) throw proposalError

      // Update booking with new time from proposal
      const { data: proposal } = await supabase
        .from('reschedule_proposals')
        .select('proposed_time')
        .eq('id', proposalId)
        .single()

      if (proposal) {
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ 
            scheduled_start: proposal.proposed_time,
            status: 'confirmed'
          })
          .eq('id', bookingId)

        if (bookingError) throw bookingError
      }

      return { proposalId, bookingId }
    },
    onMutate: async ({ proposalId }) => {
      toast.loading('Approving and rescheduling...', { id: proposalId })
    },
    onSuccess: (data) => {
      toast.success('✅ Proposal approved and booking rescheduled!', { 
        id: data.proposalId,
        duration: 4000,
      })
      queryClient.invalidateQueries({ queryKey: ['instructor-proposals'] })
      queryClient.invalidateQueries({ queryKey: ['instructor-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts'] })
    },
    onError: (error: Error, { proposalId }) => {
      toast.error(`Failed to approve proposal: ${error.message}`, { 
        id: proposalId,
        duration: 5000,
      })
    },
    retry: 1,
  })
}

/**
 * Reject a proposal as instructor
 */
export function useRejectProposalAsInstructor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .update({ 
          status: 'rejected',
          instructor_rejected_at: new Date().toISOString() 
        })
        .eq('id', proposalId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (proposalId) => {
      toast.loading('Rejecting proposal...', { id: proposalId })
    },
    onSuccess: (_data, proposalId) => {
      toast.success('Proposal rejected', { 
        id: proposalId,
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['instructor-proposals'] })
    },
    onError: (error: Error, proposalId) => {
      toast.error(`Failed to reject proposal: ${error.message}`, { 
        id: proposalId,
        duration: 5000,
      })
    },
    retry: 1,
  })
}

/**
 * Fetch available instructors for booking
 * Task 22.1
 */
export function useInstructors() {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .eq('role', 'instructor')
        .order('full_name', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - instructors don't change frequently
  })
}

/**
 * Fetch available aircraft for booking
 * Task 22.2
 */
export function useAircraft() {
  return useQuery({
    queryKey: ['aircraft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .eq('is_active', true)
        .order('tail_number', { ascending: true })

      if (error) throw error
      return data
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - aircraft list changes infrequently
  })
}
