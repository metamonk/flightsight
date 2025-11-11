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
      if (!userId) {
        return []
      }
      
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
    enabled: !!userId, // Only run if userId is provided
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
          ),
          reschedule_proposals(*)
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
        .order('score', { ascending: false })

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
      // First, get the proposal details including conflict_id and booking_id
      const { data: proposal, error: fetchError } = await supabase
        .from('reschedule_proposals')
        .select('proposed_start, proposed_end, proposed_instructor_id, proposed_aircraft_id, conflict_id')
        .eq('id', proposalId)
        .single()

      if (fetchError || !proposal) throw fetchError || new Error('Proposal not found')

      // Get the booking_id from the weather_conflict
      const { data: conflict, error: conflictFetchError } = await supabase
        .from('weather_conflicts')
        .select('booking_id')
        .eq('id', proposal.conflict_id)
        .single()

      if (conflictFetchError || !conflict) throw conflictFetchError || new Error('Conflict not found')

      // Update the proposal with student acceptance
      const { error: proposalError } = await supabase
        .from('reschedule_proposals')
        .update({ 
          student_response: 'accepted',
          student_responded_at: new Date().toISOString(),
          accepted_at: new Date().toISOString()
        })
        .eq('id', proposalId)

      if (proposalError) throw proposalError

      // Update the booking with new times and status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          scheduled_start: proposal.proposed_start,
          scheduled_end: proposal.proposed_end,
          instructor_id: proposal.proposed_instructor_id || undefined,
          aircraft_id: proposal.proposed_aircraft_id || undefined,
          status: 'scheduled' // Change from weather_hold to scheduled
        })
        .eq('id', conflict.booking_id)

      if (bookingError) throw bookingError

      // Resolve the weather conflict
      const { error: conflictError } = await supabase
        .from('weather_conflicts')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolution_method: 'rescheduled'
        })
        .eq('id', proposal.conflict_id)

      if (conflictError) throw conflictError

      return { proposalId, bookingId: conflict.booking_id }
    },
    onMutate: async (proposalId) => {
      // Show loading toast
      toast.loading('Accepting proposal and rescheduling...', { id: proposalId })
    },
    onSuccess: (_data, proposalId) => {
      // Dismiss loading toast and show success
      toast.success('✅ Proposal accepted! Your lesson has been rescheduled.', { 
        id: proposalId,
        duration: 4000,
      })
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['proposals'] })
      queryClient.invalidateQueries({ queryKey: ['weather-conflicts'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] })
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
      const { data, error } = await supabase
        .from('reschedule_proposals')
        .update({ 
          student_response: 'rejected',
          student_responded_at: new Date().toISOString()
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
      if (!instructorId) {
        return []
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          student_id,
          instructor_id,
          aircraft_id,
          status,
          scheduled_start,
          scheduled_end,
          actual_start,
          actual_end,
          departure_airport_id,
          destination_airport_id,
          lesson_type_id,
          notes,
          hobbs_start,
          hobbs_end,
          flight_time,
          ground_time,
          created_at,
          updated_at,
          student:student_id(id, full_name, email, avatar_url),
          instructor:instructor_id(id, full_name, email, avatar_url),
          aircraft:aircraft_id(id, tail_number, make, model, year)
        `)
        .eq('instructor_id', instructorId)
        .gte('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })

      if (error) throw error
      return data
    },
    enabled: !!instructorId, // Only run if instructorId is provided
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
      // Update proposal with instructor acceptance
      const { error: proposalError } = await supabase
        .from('reschedule_proposals')
        .update({ 
          instructor_response: 'accepted',
          instructor_responded_at: new Date().toISOString(),
          accepted_at: new Date().toISOString()
        })
        .eq('id', proposalId)

      if (proposalError) throw proposalError

      // Get proposal details including conflict_id
      const { data: proposal } = await supabase
        .from('reschedule_proposals')
        .select('proposed_start, proposed_end, proposed_instructor_id, proposed_aircraft_id, conflict_id')
        .eq('id', proposalId)
        .single()

      if (proposal) {
        // Update booking with new time from proposal
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ 
            scheduled_start: proposal.proposed_start,
            scheduled_end: proposal.proposed_end,
            instructor_id: proposal.proposed_instructor_id || undefined,
            aircraft_id: proposal.proposed_aircraft_id || undefined,
            status: 'scheduled'
          })
          .eq('id', bookingId)

        if (bookingError) throw bookingError

        // Resolve the weather conflict
        const { error: conflictError } = await supabase
          .from('weather_conflicts')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolution_method: 'rescheduled'
          })
          .eq('id', proposal.conflict_id)

        if (conflictError) throw conflictError
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
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['student-bookings'] })
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
          instructor_response: 'rejected',
          instructor_responded_at: new Date().toISOString()
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
