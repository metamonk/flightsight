import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { StudentDashboardClient, StudentBookingsView } from './StudentDashboardClient'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { MonthlyOverview, InstructorAvatarGroup } from '@/components/dashboard'
import { DashboardNav } from '@/components/navigation/DashboardNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Student Dashboard Page
 * 
 * Main dashboard for student pilots to view their bookings,
 * weather alerts, and AI-generated reschedule proposals.
 * 
 * Features:
 * - Real-time updates via Supabase Realtime
 * - React Query for data fetching and caching
 * - Calendar and list views for bookings
 * - Responsive layout with Tailwind v4
 */
export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user role from database
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = userProfile?.role || 'student'

  // Verify user has appropriate access
  // Redirect admins and instructors to their respective dashboards
  if (role === 'admin') {
    redirect('/dashboard/admin')
  } else if (role === 'instructor') {
    redirect('/dashboard/instructor')
  }

  return (
      <div className="min-h-screen bg-background">
        <DashboardNav
          userId={user.id}
          userEmail={user.email!}
          role="student"
          currentPage="dashboard"
          onSignOut={logout}
        />

      {/* Main Content - Wrapped in RealtimeProvider via StudentDashboardClient */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <Card className="mb-8 border-0 bg-gradient-to-r from-primary/90 to-primary/70">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-foreground">
                Welcome back! 👋
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Your next lesson is automatically monitored for safe weather conditions.
              </CardDescription>
            </CardHeader>
          </Card>

        {/* Dashboard Grid - Wrapped with Realtime Subscriptions */}
        <StudentDashboardClient userId={user.id}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Flights - with view toggle */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📅 Upcoming Flights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StudentBookingsView userId={user.id} />
                </CardContent>
              </Card>
              
              {/* Monthly Overview Widget */}
              <MonthlyOverview
                userId={user.id}
                userRole="student"
              />
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Available Instructors */}
              <InstructorAvatarGroup />
              
              {/* Weather Alerts with Inline Proposals */}
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🌦️ Weather Alerts
                  </CardTitle>
                  <CardDescription>
                    Weather conflicts with AI reschedule options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WeatherAlerts userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>
        </StudentDashboardClient>
        </main>
      </div>
  )
}
