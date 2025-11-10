import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { UserManagementClient } from './UserManagementClient'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Admin User Management Page
 * 
 * Main page for system administrators to:
 * - View and manage all users (students, instructors, admins)
 * - Search and filter users by role, email, and name
 * - View detailed user information including bookings and training level
 * - Edit user profiles and roles
 * - Promote students to instructors
 * - Create new admin accounts
 * - Deactivate/suspend users
 * - View user activity and statistics
 * 
 * Features:
 * - Real-time updates via Supabase Realtime
 * - React Query for efficient data caching
 * - Advanced filtering and search
 * - Role-based access control (admin only)
 * - Toast notifications for user actions
 */
export default async function UserManagementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is an admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    // Redirect to appropriate dashboard based on role
    if (userProfile?.role === 'instructor') {
      redirect('/dashboard/instructor')
    } else {
      redirect('/dashboard/student')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                👥 User Management
              </h1>
              <RoleBadge role="admin" size="sm" />
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="default" asChild>
              <Link href="/dashboard/admin">
                ← Back to Dashboard
              </Link>
            </Button>
            <Button variant="outline" size="default" asChild>
              <Link href="/dashboard/admin/aircraft">
                ✈️ Manage Aircraft
              </Link>
            </Button>
            <form>
              <Button
                formAction={logout}
                variant="destructive"
                size="default"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-primary/90 to-primary/70">
          <CardHeader>
            <CardTitle className="text-2xl text-primary-foreground">
              User Management 👥
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Manage all users, roles, and permissions across FlightSight.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Client-side User Management Content */}
        <UserManagementClient />
      </main>
    </div>
  )
}

