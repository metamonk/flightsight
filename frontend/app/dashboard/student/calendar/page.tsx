import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StudentCalendarClient from './StudentCalendarClient'

/**
 * Student Calendar Page (Server Component)
 * 
 * Server-side page that verifies authentication and renders
 * the client-side calendar component for students.
 */
export default async function StudentCalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <StudentCalendarClient userId={user.id} userEmail={user.email || ''} />
}

