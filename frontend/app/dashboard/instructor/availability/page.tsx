import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InstructorAvailabilityClient } from './InstructorAvailabilityClient'

export default async function InstructorAvailabilityPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get user role
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || !userData) {
    redirect('/auth/login')
  }

  const role = userData.role

  // Redirect if not instructor
  if (role !== 'instructor') {
    redirect('/dashboard/student')
  }

  return <InstructorAvailabilityClient instructorId={user.id} userEmail={user.email!} />
}

