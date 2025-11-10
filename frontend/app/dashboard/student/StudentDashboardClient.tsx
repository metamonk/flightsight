/**
 * Student Dashboard Client Component
 * 
 * Client-side component that handles:
 * - Real-time subscriptions via RealtimeProvider
 * - View switching between list and calendar
 * - All interactive dashboard logic
 * 
 * This component wraps the entire student dashboard content
 * with the RealtimeProvider to ensure real-time updates work
 * correctly within the client component boundary.
 */

'use client'

import { useState, type ReactNode } from 'react'
import { BookingsList } from '@/components/booking/BookingsList'
import { StudentCalendarView } from '@/components/scheduling/StudentCalendarView'
import { RealtimeProvider } from '@/components/realtime/RealtimeProvider'
import { Button } from '@/components/ui/button'
import { Calendar, List } from 'lucide-react'

export interface StudentDashboardClientProps {
  userId: string
  children?: ReactNode
}

/**
 * Bookings View Component
 * Handles view switching between list and calendar
 */
export function StudentBookingsView({ userId }: { userId: string }) {
  const [view, setView] = useState<'list' | 'calendar'>('calendar')
  
  return (
    <div>
      {/* View Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/50">
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>
      
      {/* Content */}
      {view === 'list' ? (
        <BookingsList userId={userId} />
      ) : (
        <StudentCalendarView 
          userId={userId}
          enableRescheduling={true}
          height="700px"
        />
      )}
    </div>
  )
}

/**
 * Main Student Dashboard Client Component
 * 
 * Wraps content with RealtimeProvider to establish
 * real-time subscriptions within client boundary.
 * 
 * Can be used in two ways:
 * 1. With children - wraps provided content with RealtimeProvider
 * 2. Without children - renders default booking view
 */
export function StudentDashboardClient({ userId, children }: StudentDashboardClientProps) {
  return (
    <RealtimeProvider userId={userId}>
      {children}
    </RealtimeProvider>
  )
}

