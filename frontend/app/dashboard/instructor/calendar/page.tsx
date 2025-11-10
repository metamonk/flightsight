import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InstructorCalendarClient from './InstructorCalendarClient'

/**
 * Instructor Calendar Page (Server Component)
 * 
 * Server-side page that verifies authentication and role,
 * then renders the client-side calendar component for instructors.
 */
export default async function InstructorCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is an instructor
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'instructor') {
    redirect('/dashboard/student')
  }

  return <InstructorCalendarClient instructorId={user.id} userEmail={user.email || ''} />
}
