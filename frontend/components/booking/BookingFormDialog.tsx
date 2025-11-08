'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInstructors, useAircraft } from '@/lib/queries/bookings'
import { createBooking } from '@/app/booking/actions'
import { toast } from 'sonner'
import type { BookingFormData } from '@/lib/schemas/booking'

/**
 * Booking Form Dialog Component
 * Tasks 22.3 & 22.4
 * 
 * Modal form for students to create new flight bookings
 */
export function BookingFormDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Fetch instructors and aircraft
  const { data: instructors, isLoading: instructorsLoading } = useInstructors()
  const { data: aircraft, isLoading: aircraftLoading } = useAircraft()

  // Form state
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    flight_type: 'local',
    departure_airport: 'KAUS',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await createBooking(formData as BookingFormData)
      
      if (result.error) {
        toast.error(result.error)
        if (result.details) {
          // Show field-specific errors
          Object.entries(result.details).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              toast.error(`${field}: ${errors[0]}`)
            }
          })
        }
      } else {
        toast.success('✅ Lesson booked successfully!')
        setOpen(false)
        // Reset form
        setFormData({
          flight_type: 'local',
          departure_airport: 'KAUS',
        })
      }
    } catch (error) {
      toast.error('Failed to create booking')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Flight Lesson</DialogTitle>
          <DialogDescription>
            Schedule a new flight lesson with an instructor
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instructor Selection */}
          <div className="space-y-2">
            <Label htmlFor="instructor">Flight Instructor *</Label>
            <Select
              value={formData.instructor_id}
              onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
              required
            >
              <SelectTrigger id="instructor">
                <SelectValue placeholder="Select an instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructorsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : instructors && instructors.length > 0 ? (
                  instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.full_name} ({instructor.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No instructors available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Aircraft Selection */}
          <div className="space-y-2">
            <Label htmlFor="aircraft">Aircraft *</Label>
            <Select
              value={formData.aircraft_id}
              onValueChange={(value) => setFormData({ ...formData, aircraft_id: value })}
              required
            >
              <SelectTrigger id="aircraft">
                <SelectValue placeholder="Select an aircraft" />
              </SelectTrigger>
              <SelectContent>
                {aircraftLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : aircraft && aircraft.length > 0 ? (
                  aircraft.map((ac) => (
                    <SelectItem key={ac.id} value={ac.id}>
                      {ac.tail_number} - {ac.make} {ac.model}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No aircraft available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date/Time - Task 22.7 (simplified for now) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_start">Start Date & Time *</Label>
              <Input
                id="scheduled_start"
                type="datetime-local"
                value={formData.scheduled_start?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_start: new Date(e.target.value).toISOString() })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_end">End Date & Time *</Label>
              <Input
                id="scheduled_end"
                type="datetime-local"
                value={formData.scheduled_end?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_end: new Date(e.target.value).toISOString() })}
                required
              />
            </div>
          </div>

          {/* Lesson Type - Task 22.8 */}
          <div className="space-y-2">
            <Label htmlFor="lesson_type">Lesson Type *</Label>
            <Input
              id="lesson_type"
              placeholder="e.g., Pattern Work, Touch & Goes, Cross Country"
              value={formData.lesson_type || ''}
              onChange={(e) => setFormData({ ...formData, lesson_type: e.target.value })}
              required
            />
          </div>

          {/* Flight Type - Task 22.9 */}
          <div className="space-y-2">
            <Label htmlFor="flight_type">Flight Type *</Label>
            <Select
              value={formData.flight_type}
              onValueChange={(value) => setFormData({ ...formData, flight_type: value as 'local' | 'short_xc' | 'long_xc' })}
              required
            >
              <SelectTrigger id="flight_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local (Pattern)</SelectItem>
                <SelectItem value="short_xc">Short Cross-Country (50-100nm)</SelectItem>
                <SelectItem value="long_xc">Long Cross-Country (100+ nm)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Airport Fields - Task 22.10 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_airport">Departure Airport *</Label>
              <Input
                id="departure_airport"
                placeholder="KAUS"
                maxLength={4}
                value={formData.departure_airport || ''}
                onChange={(e) => setFormData({ ...formData, departure_airport: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_airport">
                Destination Airport {(formData.flight_type === 'short_xc' || formData.flight_type === 'long_xc') && '*'}
              </Label>
              <Input
                id="destination_airport"
                placeholder="KSAT"
                maxLength={4}
                value={formData.destination_airport || ''}
                onChange={(e) => setFormData({ ...formData, destination_airport: e.target.value.toUpperCase() })}
                required={formData.flight_type === 'short_xc' || formData.flight_type === 'long_xc'}
                disabled={formData.flight_type === 'local'}
              />
            </div>
          </div>

          {/* Lesson Notes */}
          <div className="space-y-2">
            <Label htmlFor="lesson_notes">Lesson Notes (Optional)</Label>
            <Input
              id="lesson_notes"
              placeholder="Any specific goals or notes for this lesson"
              value={formData.lesson_notes || ''}
              onChange={(e) => setFormData({ ...formData, lesson_notes: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
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
              disabled={isSubmitting || instructorsLoading || aircraftLoading}
            >
              {isSubmitting ? 'Booking...' : 'Book Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

