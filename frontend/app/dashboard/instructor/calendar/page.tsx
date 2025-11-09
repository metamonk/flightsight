import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'
import { InstructorRealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { InstructorCalendarView } from '@/components/scheduling'
import { RoleBadge } from '@/components/shared/RoleBadge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

/**
 * Instructor Calendar Page
 * 
 * Full-page calendar view for flight instructors to manage their teaching schedule.
 * Shows all confirmed lessons, pending bookings, and weather conflicts.
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

  return (
    <InstructorRealtimeProvider instructorId={user.id}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/dashboard/instructor">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                  📅 Teaching Calendar
                </h1>
                <RoleBadge role="instructor" size="sm" />
              </div>
              <p className="text-sm text-muted-foreground ml-14">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="default" asChild>
                <Link href="/dashboard/instructor/availability">
                  ⏰ Manage Availability
                </Link>
              </Button>
              <Button variant="outline" size="default" asChild>
                <Link href="/profile">
                  ⚙️ Settings
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
          <InstructorCalendarView
            instructorId={user.id}
            initialView="week"
            height="900px"
          />
        </main>
      </div>
    </InstructorRealtimeProvider>
  )
}
