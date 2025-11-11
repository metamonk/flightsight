'use client'

import { DashboardNav } from '@/components/navigation/DashboardNav'
import { AvailabilityManagement } from '@/components/availability/AvailabilityManagement'
import { InstructorRealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { logout } from '@/app/auth/actions'

interface InstructorAvailabilityClientProps {
  instructorId: string
  userEmail: string
}

export function InstructorAvailabilityClient({ instructorId, userEmail }: InstructorAvailabilityClientProps) {
  return (
    <InstructorRealtimeProvider instructorId={instructorId}>
      <div className="min-h-screen bg-background">
        <DashboardNav
          userId={instructorId}
          userEmail={userEmail}
          role="instructor"
          currentPage="availability"
          onSignOut={logout}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Availability</h2>
            <p className="text-muted-foreground mt-2">
              Set your weekly schedule to let students know when you're available for lessons.
            </p>
          </div>

          <AvailabilityManagement />

          <div className="mt-6 rounded-lg border p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">How it works</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Students can only book lessons during your available hours</li>
              <li>• Set recurring patterns for your regular schedule</li>
              <li>• Add one-time blocks for special availability or time off</li>
              <li>• Existing bookings won't be affected by availability changes</li>
            </ul>
          </div>
        </main>
      </div>
    </InstructorRealtimeProvider>
  )
}

