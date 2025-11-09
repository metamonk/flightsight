import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingDetailClient from './BookingDetailClient'

/**
 * Booking Detail Page (Server Component)
 * 
 * Displays detailed information about a single booking.
 * Accessible by both students and instructors.
 */
export default async function BookingDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await params in Next.js 15+
  const { id } = await params
  
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user role
  const { data: userProfile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = userProfile?.role || 'student'

  // Fetch booking details with related data
  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id (
        id,
        full_name,
        email
      ),
      instructor:instructor_id (
        id,
        full_name,
        email
      ),
      aircraft:aircraft_id (
        id,
        tail_number,
        make,
        model,
        year
      )
    `)
    .eq('id', id)
    .single()

  if (error || !booking) {
    redirect('/dashboard/student')
  }

  // Verify user has access to this booking
  if (booking.student_id !== user.id && booking.instructor_id !== user.id && role !== 'admin') {
    redirect('/dashboard/student')
  }

  return (
    <BookingDetailClient 
      booking={booking} 
      userId={user.id} 
      userRole={role}
      userName={userProfile?.full_name || user.email || 'User'}
    />
  )
}

