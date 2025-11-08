'use client'

import { format } from 'date-fns'
import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Booking {
  id: string
  scheduled_start: string
  status: string
  lesson_type: string
  student?: { email: string }
  instructor?: { email: string }
  aircraft?: { registration: string; model: string }
}

interface BookingsTableProps {
  bookings: Booking[]
  loading?: boolean
}

type SortField = 'scheduled_start' | 'status' | 'student' | 'instructor' | 'aircraft'
type SortDirection = 'asc' | 'desc'

const statusVariants = {
  confirmed: 'default' as const,
  weather_hold: 'secondary' as const,
  cancelled: 'destructive' as const,
  rescheduling: 'outline' as const,
}

/**
 * Bookings Data Table
 * 
 * Comprehensive table view of all bookings with sorting
 * Used in admin dashboard for detailed booking management
 */
export function BookingsTable({ bookings, loading }: BookingsTableProps) {
  const [sortField, setSortField] = useState<SortField>('scheduled_start')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue: string, bValue: string

    switch (sortField) {
      case 'scheduled_start':
        aValue = a.scheduled_start
        bValue = b.scheduled_start
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      case 'student':
        aValue = a.student?.email || ''
        bValue = b.student?.email || ''
        break
      case 'instructor':
        aValue = a.instructor?.email || ''
        bValue = b.instructor?.email || ''
        break
      case 'aircraft':
        aValue = a.aircraft?.registration || ''
        bValue = b.aircraft?.registration || ''
        break
      default:
        return 0
    }

    const comparison = aValue.localeCompare(bValue)
    return sortDirection === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No bookings found</p>
        <p className="text-sm mt-2">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              onClick={() => handleSort('scheduled_start')}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                Date & Time
                {sortField === 'scheduled_start' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('student')}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                Student
                {sortField === 'student' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('instructor')}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                Instructor
                {sortField === 'instructor' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('aircraft')}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                Aircraft
                {sortField === 'aircraft' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </TableHead>
            <TableHead>Lesson Type</TableHead>
            <TableHead
              onClick={() => handleSort('status')}
              className="cursor-pointer hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                Status
                {sortField === 'status' && (
                  <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div className="text-sm font-medium">
                  {format(new Date(booking.scheduled_start), 'MMM d, yyyy')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(booking.scheduled_start), 'h:mm a')}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {booking.student?.email?.split('@')[0] || 'Unknown'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {booking.student?.email || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {booking.instructor?.email?.split('@')[0] || 'Unknown'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {booking.instructor?.email || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm font-medium">
                  {booking.aircraft?.registration || 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {booking.aircraft?.model || 'Unknown model'}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm capitalize">
                  {booking.lesson_type?.replace('_', ' ') || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    statusVariants[booking.status as keyof typeof statusVariants] ||
                    'outline'
                  }
                >
                  {booking.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="px-6 py-4 border-t bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Showing {sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

