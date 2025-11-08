'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BookingCalendar from '@/components/booking/BookingCalendar'
import { useInstructorBookings } from '@/lib/queries/bookings'
import { logout } from '@/app/auth/actions'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InstructorCalendarClientProps {
  userId: string
  userEmail: string
}

/**
 * Instructor Calendar Client Component
 * 
 * Client-side component that fetches instructor bookings using React Query
 * and displays them in a calendar view.
 */
export default function InstructorCalendarClient({ userId, userEmail }: InstructorCalendarClientProps) {
  const router = useRouter()
  const { data: bookings, isLoading, error } = useInstructorBookings(userId)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event)
    // Could open a modal or navigate to booking details
    console.log('Selected event:', event)
  }

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Could open a modal to view availability or suggest to students
    console.log('Selected slot:', slotInfo)
  }

  return (
    <RealtimeProvider userId={userId}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
                📅 Teaching Calendar
              </h1>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="default"
                onClick={() => router.push('/dashboard/instructor')}
              >
                Back to Dashboard
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
          {/* Calendar Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-card-foreground mb-2">Your Teaching Schedule</h2>
            <p className="text-muted-foreground">
              View all your upcoming lessons with students in calendar format.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your calendar...</p>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="p-6 text-center">
                <p className="text-destructive font-semibold mb-2">Error loading bookings</p>
                <p className="text-destructive/80 text-sm">{error.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Calendar */}
          {!isLoading && !error && (
            <BookingCalendar
              bookings={bookings || []}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
            />
          )}

          {/* Selected Event Details */}
          {selectedEvent && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Lesson Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Lesson Type</p>
                    <p className="font-medium text-card-foreground">{selectedEvent.lessonType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aircraft</p>
                    <p className="font-medium text-card-foreground">{selectedEvent.aircraftTailNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium text-card-foreground">{selectedEvent.resource?.student?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-card-foreground capitalize">{selectedEvent.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-card-foreground">
                      {selectedEvent.start.toLocaleString()} - {selectedEvent.end.toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedEvent(null)}
                  variant="secondary"
                  className="mt-4"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </RealtimeProvider>
  )
}

