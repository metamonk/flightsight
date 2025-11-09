'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { requestReschedule } from '@/app/booking/actions'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { localToUTC, utcToLocal } from '@/lib/utils/date'

interface RescheduleDialogProps {
  bookingId: string
  /** Current/original start time (for button trigger mode) */
  currentStart?: string
  /** Current/original end time (for button trigger mode) */
  currentEnd?: string
  /** Proposed start time from drag-and-drop (for controlled mode) */
  proposedStart?: string
  /** Proposed end time from drag-and-drop (for controlled mode) */
  proposedEnd?: string
  /** Controlled open state */
  open?: boolean
  /** Callback when dialog closes */
  onClose?: () => void
  /** Trigger element (for button trigger mode) */
  children?: React.ReactNode
}

/**
 * Reschedule Dialog Component
 * 
 * Modal form for students or instructors to request a reschedule
 * with a new date/time and reason.
 * 
 * Supports two modes:
 * 1. Button trigger mode: Pass currentStart/currentEnd and children
 * 2. Controlled mode: Pass proposedStart/proposedEnd, open, and onClose (for drag-and-drop)
 */
export function RescheduleDialog({ 
  bookingId, 
  currentStart, 
  currentEnd,
  proposedStart,
  proposedEnd,
  open: controlledOpen,
  onClose,
  children 
}: RescheduleDialogProps) {
  const router = useRouter()
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = (value: boolean) => {
    if (isControlled) {
      if (!value && onClose) onClose()
    } else {
      setInternalOpen(value)
    }
  }
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [reason, setReason] = useState('')

  // Initialize form values when dialog opens or props change
  useEffect(() => {
    if (open) {
      // Use proposed times from drag-and-drop if available, otherwise use current times
      const startTime = proposedStart || currentStart || new Date().toISOString()
      const endTime = proposedEnd || currentEnd || new Date().toISOString()
      
      setNewStart(utcToLocal(startTime))
      setNewEnd(utcToLocal(endTime))
      setReason('') // Reset reason on open
    }
  }, [open, proposedStart, proposedEnd, currentStart, currentEnd])

  // Calculate min and max dates for datetime pickers
  const minDateTime = new Date()
  minDateTime.setHours(minDateTime.getHours() + 1)
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16)

  const maxDateTime = new Date()
  maxDateTime.setFullYear(maxDateTime.getFullYear() + 1)
  const maxDateTimeStr = maxDateTime.toISOString().slice(0, 16)

  // Calculate min end time based on start time
  const minEndDateTime = (() => {
    if (!newStart) return minDateTimeStr
    const start = new Date(newStart)
    start.setMinutes(start.getMinutes() + 15) // Minimum 15 minute duration
    return start.toISOString().slice(0, 16)
  })()

  // Calculate max end time based on start time
  const maxEndDateTime = (() => {
    if (!newStart) return maxDateTimeStr
    const start = new Date(newStart)
    const eightHoursLater = new Date(start)
    eightHoursLater.setHours(eightHoursLater.getHours() + 8)
    const maxDate = new Date(maxDateTimeStr)
    return eightHoursLater < maxDate 
      ? eightHoursLater.toISOString().slice(0, 16)
      : maxDateTimeStr
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!reason.trim()) {
        toast.error('Please provide a reason for rescheduling')
        setIsSubmitting(false)
        return
      }

      const result = await requestReschedule(
        bookingId,
        localToUTC(newStart),
        localToUTC(newEnd),
        reason
      )
      
      if (result.error) {
        toast.error(result.error)
        // If backend fails, the revalidatePath in the action won't run,
        // so we need to manually refresh to revert optimistic UI changes
        router.refresh()
      } else {
        toast.success('✅ Reschedule request submitted!', {
          description: 'Waiting for approval from the other party'
        })
        setOpen(false)
        // Reset form
        setReason('')
        // The revalidatePath in the server action will trigger a refresh
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to request reschedule')
      console.error(error)
      // Reload on error to revert optimistic changes
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Only show trigger in uncontrolled mode */}
      {!isControlled && children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Request Reschedule
          </DialogTitle>
          <DialogDescription>
            {proposedStart && proposedEnd ? (
              <>
                <span className="font-medium text-primary">✅ Drag complete!</span> Review the new time below and provide a reason for the change. The other party will need to approve.
              </>
            ) : (
              'Propose a new date and time for this lesson. The other party will need to approve.'
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date/Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new_start">New Start Date & Time *</Label>
              <Input
                id="new_start"
                type="datetime-local"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                min={minDateTimeStr}
                max={maxDateTimeStr}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 1 hour in the future
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_end">New End Date & Time *</Label>
              <Input
                id="new_end"
                type="datetime-local"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                min={minEndDateTime}
                max={maxEndDateTime}
                required
                disabled={!newStart}
              />
              <p className="text-xs text-muted-foreground">
                {newStart 
                  ? 'Duration: 15 min - 8 hours' 
                  : 'Select start time first'}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reschedule *</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Conflict with another commitment, weather concerns, maintenance scheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Provide a brief explanation to help the other party understand the need for change
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Reschedule Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

