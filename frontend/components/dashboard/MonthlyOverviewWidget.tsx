/**
 * Monthly Overview Widget Component
 * 
 * Displays a compact monthly calendar with booking density overview.
 * Uses Kibo Calendar for quick glance at bookings.
 */

'use client'

import { useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  CalendarItem,
  type Feature,
  type Status
} from '@/components/kibo-ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BookingSummary {
  id: string
  title: string
  date: Date
  status: 'confirmed' | 'pending' | 'cancelled' | 'weather_conflict'
  type?: string
}

export interface MonthlyOverviewWidgetProps {
  /** Bookings to display in the calendar */
  bookings?: BookingSummary[]
  
  /** Loading state */
  isLoading?: boolean
  
  /** Error state */
  error?: Error | null
  
  /** Custom className */
  className?: string
  
  /** Show skeleton during loading */
  showSkeleton?: boolean
  
  /** Callback when a day is clicked */
  onDayClick?: (date: Date) => void
  
  /** Callback when a booking is clicked */
  onBookingClick?: (booking: BookingSummary) => void
  
  /** User role for context */
  userRole?: 'student' | 'instructor' | 'admin'
}

// Status color mapping
const STATUS_COLORS: Record<string, string> = {
  confirmed: '#22c55e', // green-500
  pending: '#f59e0b',   // amber-500
  cancelled: '#ef4444', // red-500
  weather_conflict: '#dc2626' // red-600
}

// Status display names
const STATUS_NAMES: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
  weather_conflict: 'Weather Issue'
}

/**
 * Transform bookings to Kibo Calendar Feature format
 */
function transformBookingsToFeatures(bookings: BookingSummary[]): Feature[] {
  return bookings.map(booking => ({
    id: booking.id,
    name: booking.title,
    startAt: booking.date,
    endAt: booking.date,
    status: {
      id: booking.status,
      name: STATUS_NAMES[booking.status] || booking.status,
      color: STATUS_COLORS[booking.status] || '#6b7280'
    }
  }))
}

/**
 * Get booking counts by status
 */
function getBookingStats(bookings: BookingSummary[]) {
  const stats = bookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return {
    total: bookings.length,
    confirmed: stats.confirmed || 0,
    pending: stats.pending || 0,
    cancelled: stats.cancelled || 0,
    weather_conflict: stats.weather_conflict || 0
  }
}

/**
 * MonthlyOverviewWidget Component
 * 
 * Compact monthly calendar showing booking density and status
 */
export function MonthlyOverviewWidget({
  bookings = [],
  isLoading = false,
  error = null,
  className,
  showSkeleton = true,
  onDayClick,
  onBookingClick,
  userRole = 'student'
}: MonthlyOverviewWidgetProps) {
  
  // Transform bookings to features
  const features = useMemo(() => {
    return transformBookingsToFeatures(bookings)
  }, [bookings])
  
  // Calculate stats
  const stats = useMemo(() => {
    return getBookingStats(bookings)
  }, [bookings])
  
  // Handle feature click
  const handleFeatureClick = (feature: Feature) => {
    const booking = bookings.find(b => b.id === feature.id)
    if (booking && onBookingClick) {
      onBookingClick(booking)
    }
  }
  
  // Loading state
  if (isLoading) {
    return showSkeleton ? (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarIcon className="h-4 w-4" />
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    ) : (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertCircle className="h-4 w-4" />
            Error Loading Calendar
          </CardTitle>
          <CardDescription>
            {error.message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            size="sm"
          >
            Reload
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" aria-hidden="true" />
              Monthly Overview
            </CardTitle>
            <CardDescription className="text-xs">
              {stats.total} booking{stats.total !== 1 ? 's' : ''} this month
            </CardDescription>
          </div>
          
          {/* Quick Stats Badges */}
          <div className="flex items-center gap-1" role="status" aria-label="Booking statistics">
            {stats.confirmed > 0 && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200"
                aria-label={`${stats.confirmed} confirmed booking${stats.confirmed !== 1 ? 's' : ''}`}
              >
                {stats.confirmed} <span aria-hidden="true">✓</span>
              </Badge>
            )}
            {stats.pending > 0 && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200"
                aria-label={`${stats.pending} pending booking${stats.pending !== 1 ? 's' : ''}`}
              >
                {stats.pending} <span aria-hidden="true">⏱</span>
              </Badge>
            )}
            {stats.weather_conflict > 0 && (
              <Badge 
                variant="outline" 
                className="text-[10px] px-1.5 py-0 bg-red-50 text-red-700 border-red-200"
                aria-label={`${stats.weather_conflict} weather conflict${stats.weather_conflict !== 1 ? 's' : ''}`}
              >
                {stats.weather_conflict} <span aria-hidden="true">⚠️</span>
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CalendarProvider className="border rounded-lg bg-card overflow-hidden">
          {/* Calendar Navigation */}
          <CalendarDate>
            <CalendarDatePicker className="flex-1">
              <CalendarMonthPicker />
              <CalendarYearPicker start={2024} end={2030} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </CalendarDate>
          
          {/* Calendar Header (Days of week) */}
          <CalendarHeader />
          
          {/* Calendar Body (Days with bookings) */}
          <CalendarBody features={features}>
            {({ feature }) => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className="w-full text-left hover:opacity-80 transition-opacity"
                aria-label={`${feature.name} on ${format(feature.startAt, 'MMMM d, yyyy')} - ${feature.status.name}`}
              >
                <CalendarItem 
                  feature={feature} 
                  className="text-[10px]"
                />
              </button>
            )}
          </CalendarBody>
        </CalendarProvider>
        
        {/* Legend */}
        <div className="mt-3 pt-3 border-t flex flex-wrap items-center gap-3 text-xs">
          <span className="text-muted-foreground font-medium">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Weather Issue</span>
          </div>
        </div>
        
        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2" aria-hidden="true">📅</div>
            <p className="text-sm font-medium text-muted-foreground">
              No bookings this month
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {userRole === 'student' && "Book your first lesson to get started"}
              {userRole === 'instructor' && "No lessons scheduled yet"}
              {userRole === 'admin' && "No bookings to display"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MonthlyOverviewWidget

