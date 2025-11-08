import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth Callback Route Handler
 * 
 * Handles the OAuth callback and email confirmation redirects from Supabase.
 * This route exchanges the auth code for a session and redirects the user
 * to their appropriate dashboard based on their role.
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Get user role to redirect appropriately
    if (data.user) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      const role = userProfile?.role || 'student'

      // Redirect based on role
      if (role === 'admin') {
        return NextResponse.redirect(`${origin}/dashboard/admin`)
      } else if (role === 'instructor') {
        return NextResponse.redirect(`${origin}/dashboard/instructor`)
      }
    }
  }

  // Default to student dashboard
  return NextResponse.redirect(`${origin}/dashboard/student`)
}

