'use client'

import { Calendar, dateFnsLocalizer, Event, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useState, useMemo } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface BookingEvent extends Event {
  id: string
  bookingId: string
  lessonType: string
  aircraftTailNumber: string
  instructorName: string
  status: string
  resource?: any
}

interface BookingCalendarProps {
  bookings: any[]
  onSelectEvent?: (event: BookingEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
}

export default function BookingCalendar({
  bookings,
  onSelectEvent,
  onSelectSlot,
}: BookingCalendarProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  // Convert bookings to calendar events
  const events: BookingEvent[] = useMemo(() => {
    if (!bookings) return []

    return bookings.map((booking) => ({
      id: booking.id,
      bookingId: booking.id,
      title: `${booking.lesson_type} - ${booking.aircraft?.tail_number || 'N/A'}`,
      start: new Date(booking.scheduled_start),
      end: new Date(booking.scheduled_end || booking.scheduled_start),
      lessonType: booking.lesson_type,
      aircraftTailNumber: booking.aircraft?.tail_number || 'N/A',
      instructorName: booking.instructor?.name || 'Unassigned',
      status: booking.status,
      resource: booking,
    }))
  }, [bookings])

  // Custom event style based on booking status using theme colors
  const eventStyleGetter = (event: BookingEvent) => {
    // Use CSS variables from the theme
    let backgroundColor = 'hsl(var(--chart-1))' // primary for confirmed
    
    if (event.status === 'pending') {
      backgroundColor = 'hsl(var(--chart-2))' // secondary for pending
    } else if (event.status === 'cancelled') {
      backgroundColor = 'hsl(var(--destructive))' // destructive for cancelled
    } else if (event.status === 'completed') {
      backgroundColor = 'hsl(var(--chart-3))' // success green for completed
    }

    return {
      style: {
        backgroundColor,
        borderRadius: 'var(--radius-sm)',
        opacity: 0.9,
        color: 'hsl(var(--primary-foreground))',
        border: '0px',
        display: 'block',
      },
    }
  }

  return (
    <Card className="h-[600px] p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        popup
        tooltipAccessor={(event: BookingEvent) => 
          `${event.lessonType}\nInstructor: ${event.instructorName}\nAircraft: ${event.aircraftTailNumber}\nStatus: ${event.status}`
        }
        style={{ height: '100%' }}
      />
      
      {/* Legend using shadcn Badge component */}
      <div className="flex gap-4 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-1))' }}></div>
          <span className="text-muted-foreground">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
          <span className="text-muted-foreground">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
          <span className="text-muted-foreground">Cancelled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }}></div>
          <span className="text-muted-foreground">Completed</span>
        </div>
      </div>
    </Card>
  )
}

