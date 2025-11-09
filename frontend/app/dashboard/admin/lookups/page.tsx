import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLookupsClient from './AdminLookupsClient'

export default async function AdminLookupsPage() {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', authUser.id)
    .single()

  if (userProfile?.role !== 'admin') {
    redirect('/dashboard/student')
  }

  return <AdminLookupsClient />
}

