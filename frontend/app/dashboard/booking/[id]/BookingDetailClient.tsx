'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RescheduleDialog } from '@/components/booking/RescheduleDialog'
import { confirmBooking, cancelBooking, approveReschedule } from '@/app/booking/actions'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Plane, 
  MapPin, 
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CloudRain
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'

interface BookingDetailClientProps {
  booking: any
  userId: string
  userRole: string
  userName: string
}

/**
 * Booking Detail Client Component
 * 
 * Client-side component that displays booking details and provides
 * role-based actions (confirm, reschedule, cancel).
 */
export default function BookingDetailClient({ 
  booking, 
  userId, 
  userRole: _userRole, // Reserved for future role-based logic
  userName: _userName // Reserved for future use
}: BookingDetailClientProps) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const isStudent = booking.student_id === userId
  const isInstructor = booking.instructor_id === userId

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      const result = await confirmBooking(booking.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('✅ Booking confirmed!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to confirm booking')
      console.error(error)
    } finally {
      setIsConfirming(false)
    }
  }

  const handleApproveReschedule = async () => {
    setIsApproving(true)
    try {
      const result = await approveReschedule(booking.id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('✅ Reschedule approved!')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to approve reschedule')
      console.error(error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    setIsCancelling(true)
    try {
      const result = await cancelBooking(booking.id, cancelReason)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Booking cancelled')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to cancel booking')
      console.error(error)
    } finally {
      setIsCancelling(false)
    }
  }

  // Determine status badge variant and icon
  const getStatusBadge = () => {
    switch (booking.status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending Confirmation</Badge>
      case 'scheduled':
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Confirmed</Badge>
      case 'rescheduling':
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />Reschedule Pending</Badge>
      case 'weather_hold':
        return <Badge variant="destructive" className="gap-1"><CloudRain className="h-3 w-3" />Weather Hold</Badge>
      case 'cancelled':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cancelled</Badge>
      default:
        return <Badge variant="outline">{booking.status}</Badge>
    }
  }

  const backLink = isStudent ? '/dashboard/student' : '/dashboard/instructor'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-10 bg-card/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={backLink} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Title Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {booking.lesson_type?.replace('_', ' ').toUpperCase() || 'Flight Lesson'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Booking ID: {booking.id.split('-')[0]}...
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Status-specific alerts */}
          {booking.status === 'pending' && isInstructor && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-primary">Action Required</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      This booking is awaiting your confirmation. Please review the details and confirm or reschedule.
                    </p>
                  </div>
                  <Button onClick={handleConfirm} disabled={isConfirming} size="sm">
                    {isConfirming ? 'Confirming...' : 'Confirm Booking'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {booking.status === 'pending' && isStudent && (
            <Card className="border-muted bg-muted/5">
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ⏳ Waiting for instructor confirmation. You'll be notified once they confirm or propose an alternative time.
                </p>
              </CardContent>
            </Card>
          )}

          {booking.status === 'rescheduling' && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-yellow-600 dark:text-yellow-500">Reschedule Request Pending</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A new time has been proposed. Both parties must approve the change.
                    </p>
                  </div>
                  <Button onClick={handleApproveReschedule} disabled={isApproving} size="sm" variant="secondary">
                    {isApproving ? 'Approving...' : 'Approve Reschedule'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {booking.status === 'cancelled' && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent>
                <p className="font-medium text-destructive">Booking Cancelled</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This booking was cancelled on {format(new Date(booking.cancelled_at), 'PPP p')}
                </p>
                {booking.cancellation_reason && (
                  <p className="text-sm mt-2">
                    <strong>Reason:</strong> {booking.cancellation_reason}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-medium text-lg">
                    {format(new Date(booking.scheduled_start), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-medium text-lg">
                    {format(new Date(booking.scheduled_start), 'h:mm a')} - {format(new Date(booking.scheduled_end), 'h:mm a')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Duration</p>
                <p className="font-medium">
                  {Math.round((new Date(booking.scheduled_end).getTime() - new Date(booking.scheduled_start).getTime()) / (1000 * 60))} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* People Involved */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{booking.student?.full_name}</p>
                <p className="text-sm text-muted-foreground">{booking.student?.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Instructor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{booking.instructor?.full_name}</p>
                <p className="text-sm text-muted-foreground">{booking.instructor?.email}</p>
              </CardContent>
            </Card>
          </div>

          {/* Flight Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flight Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Aircraft</p>
                  <p className="font-medium">
                    {booking.aircraft?.tail_number} - {booking.aircraft?.make} {booking.aircraft?.model}
                  </p>
                  {booking.aircraft?.year && (
                    <p className="text-sm text-muted-foreground">Year: {booking.aircraft.year}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Flight Type</p>
                  <p className="font-medium capitalize">
                    {booking.flight_type?.replace('_', ' ') || 'Local'}
                  </p>
                  {booking.flight_distance_nm > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Distance: {booking.flight_distance_nm} nm
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-medium">
                    {booking.departure_airport}
                    {booking.destination_airport && ` → ${booking.destination_airport}`}
                  </p>
                </div>
              </div>

              {booking.lesson_notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Lesson Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{booking.lesson_notes}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {booking.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {/* Reschedule Button */}
                {(booking.status === 'pending' || booking.status === 'scheduled') && (
                  <RescheduleDialog
                    bookingId={booking.id}
                    currentStart={booking.scheduled_start}
                    currentEnd={booking.scheduled_end}
                  >
                    <Button variant="outline" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Request Reschedule
                    </Button>
                  </RescheduleDialog>
                )}

                {/* Cancel Button */}
                {booking.status !== 'cancelled' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <XCircle className="h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Please provide a reason for cancellation.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Textarea
                          placeholder="Reason for cancellation..."
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancel}
                          disabled={isCancelling || !cancelReason.trim()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card className="bg-muted/50">
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p>Created: {format(new Date(booking.created_at), 'PPp')}</p>
                </div>
                <div>
                  <p>Last Updated: {format(new Date(booking.updated_at), 'PPp')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

