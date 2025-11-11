import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { InstructorDashboardClient } from './InstructorDashboardClient'
import { InstructorBookingsList } from '@/components/booking/InstructorBookingsList'
import { InstructorProposalsList } from '@/components/proposals/InstructorProposalsList'
import { InstructorGanttView } from '@/components/scheduling/InstructorGanttView'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { DashboardNav } from '@/components/navigation/DashboardNav'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Instructor Dashboard Page
 * 
 * Main dashboard for flight instructors to view their bookings,
 * manage student proposals, and monitor their teaching schedule.
 * 
 * Features:
 * - Real-time updates via Supabase Realtime
 * - React Query for data fetching and caching
 * - Responsive layout with Tailwind v4
 * - Proposal approval/rejection workflow
 */
export default async function InstructorDashboard() {
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

  return (
      <div className="min-h-screen bg-background">
        <DashboardNav
          userId={user.id}
          userEmail={user.email!}
          role="instructor"
          currentPage="dashboard"
          onSignOut={logout}
        />

      {/* Main Content - Wrapped in InstructorRealtimeProvider via InstructorDashboardClient */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Banner */}
          <Card className="mb-8 border-0 bg-gradient-to-r from-primary/90 to-primary/70">
            <CardHeader>
              <CardTitle className="text-2xl text-primary-foreground">
                Welcome back, Instructor! 👋
              </CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Manage your teaching schedule and approve student reschedule requests.
              </CardDescription>
            </CardHeader>
          </Card>

        {/* Dashboard Content - Wrapped with Realtime Subscriptions */}
        <InstructorDashboardClient instructorId={user.id}>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Lessons */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📅 Teaching Schedule
                  </CardTitle>
                  <CardDescription>
                    Your upcoming lessons with students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InstructorBookingsList instructorId={user.id} />
                </CardContent>
              </Card>
            </div>

            {/* Weather Alerts & Quick Stats */}
            <div className="space-y-6">
              {/* Weather Alerts */}
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🌦️ Weather Alerts
                  </CardTitle>
                  <CardDescription>
                    Affected lessons in your schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WeatherAlerts userId={user.id} />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide">
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">This Week</span>
                    <span className="text-2xl font-bold text-card-foreground">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">This Month</span>
                    <span className="text-2xl font-bold text-card-foreground">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Students</span>
                    <span className="text-2xl font-bold text-card-foreground">-</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Stats coming soon
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Availability Timeline Section */}
          <div className="mt-6">
            <InstructorGanttView 
              instructorId={user.id} 
              editable={true}
              height="500px"
            />
          </div>

          {/* Reschedule Proposals Section */}
          <div className="mt-6">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  🤖 Reschedule Requests
                </CardTitle>
                <CardDescription>
                  Review and approve AI-generated reschedule proposals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InstructorProposalsList instructorId={user.id} />
              </CardContent>
            </Card>
          </div>
        </InstructorDashboardClient>
        </main>
      </div>
  )
}

