/**
 * Monthly Overview Widget with Data Integration
 * 
 * Connected version that fetches real booking data.
 * Can be used for student, instructor, or admin dashboards.
 */

'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MonthlyOverviewWidget, type BookingSummary } from './MonthlyOverviewWidget'
import { useBookings, useInstructorBookings } from '@/lib/queries/bookings'
import { format } from 'date-fns'
import { toast } from 'sonner'

export interface MonthlyOverviewProps {
  /** User ID to fetch bookings for */
  userId: string
  
  /** User role determines which bookings to fetch */
  userRole: 'student' | 'instructor' | 'admin'
  
  /** Custom className */
  className?: string
}

/**
 * Transform database booking to widget format
 */
function transformBookingToSummary(booking: any): BookingSummary {
  // Determine status based on booking data
  let status: BookingSummary['status'] = 'confirmed'
  
  if (booking.status === 'pending') {
    status = 'pending'
  } else if (booking.status === 'cancelled') {
    status = 'cancelled'
  } else if (booking.weather_conflict) {
    status = 'weather_conflict'
  }
  
  // Format title based on user role
  let title = ''
  if (booking.lesson_type) {
    title = booking.lesson_type
  }
  if (booking.aircraft?.tail_number) {
    title += ` - ${booking.aircraft.tail_number}`
  }
  if (booking.student?.full_name) {
    title += ` - ${booking.student.full_name}`
  }
  if (booking.instructor?.full_name) {
    title += ` - ${booking.instructor.full_name}`
  }
  
  return {
    id: booking.id,
    title: title || 'Flight Lesson',
    date: new Date(booking.scheduled_start),
    status,
    type: booking.lesson_type
  }
}

/**
 * MonthlyOverview Component
 * 
 * Fetches and displays user's monthly bookings
 */
export function MonthlyOverview({
  userId,
  userRole,
  className
}: MonthlyOverviewProps) {
  const router = useRouter()
  
  // Fetch bookings based on user role
  const { data: studentBookings, isLoading: studentLoading, error: studentError } = 
    useBookings(userRole === 'student' ? userId : '')
    
  const { data: instructorBookings, isLoading: instructorLoading, error: instructorError } = 
    useInstructorBookings(userRole === 'instructor' ? userId : '')
  
  // Select correct data based on role
  const bookings = userRole === 'student' ? studentBookings : instructorBookings
  const isLoading = userRole === 'student' ? studentLoading : instructorLoading
  const error = userRole === 'student' ? studentError : instructorError
  
  // Transform bookings to summary format
  const bookingSummaries = useMemo(() => {
    if (!bookings) return []
    return bookings.map(transformBookingToSummary)
  }, [bookings])
  
  // Handle day click - could show day view or create booking
  const handleDayClick = (date: Date) => {
    toast.info('Day selected', {
      description: `${format(date, 'MMMM d, yyyy')} - Click a booking for details`,
      duration: 2000
    })
  }
  
  // Handle booking click - navigate to booking details
  const handleBookingClick = (booking: BookingSummary) => {
    router.push(`/dashboard/booking/${booking.id}`)
  }
  
  return (
    <MonthlyOverviewWidget
      bookings={bookingSummaries}
      isLoading={isLoading}
      error={error ? new Error(String(error)) : null}
      onDayClick={handleDayClick}
      onBookingClick={handleBookingClick}
      userRole={userRole}
      className={className}
    />
  )
}

export default MonthlyOverview

