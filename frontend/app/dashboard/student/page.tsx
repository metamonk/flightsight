import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { BookingsList } from '@/components/booking/BookingsList'
import { WeatherAlerts } from '@/components/weather/WeatherAlerts'
import { ProposalsList } from '@/components/proposals/ProposalsList'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Button } from '@/components/ui/button'
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
    <RealtimeProvider userId={user.id}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  ✈️ Student Dashboard
                </h1>
                <RoleBadge role={role as 'student' | 'instructor' | 'admin'} size="sm" />
              </div>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="default" asChild>
                <Link href="/dashboard/student/calendar">
                  📅 Calendar View
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

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Flights */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📅 Upcoming Flights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <BookingsList userId={user.id} />
                </CardContent>
              </Card>
            </div>

            {/* Weather Alerts */}
            <div>
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    🌦️ Weather Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <WeatherAlerts userId={user.id} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Proposals Section */}
          <div className="mt-6">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  🤖 Reschedule Proposals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ProposalsList userId={user.id} />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </RealtimeProvider>
  )
}
