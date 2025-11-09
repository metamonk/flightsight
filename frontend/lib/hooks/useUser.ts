import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'student' | 'instructor' | 'admin'
}

/**
 * Hook to get the current authenticated user
 */
export function useUser() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        throw new Error('Not authenticated')
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', authUser.id)
        .single()

      if (profileError) throw profileError

      return userProfile as User
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

