/**
 * Student Dashboard Client Component
 * 
 * Client-side component that handles view switching between
 * list and calendar views for student bookings.
 */

'use client'

import { useState } from 'react'
import { BookingsList } from '@/components/booking/BookingsList'
import { StudentCalendarView } from '@/components/scheduling/StudentCalendarView'
import { Button } from '@/components/ui/button'
import { Calendar, List } from 'lucide-react'

export interface StudentDashboardClientProps {
  userId: string
}

export function StudentDashboardClient({ userId }: StudentDashboardClientProps) {
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

