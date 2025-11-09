'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useInstructors, useAircraft } from '@/lib/queries/bookings'
import { useAvailableInstructors } from '@/lib/queries/availability'
import { useActiveAirports, useActiveLessonTypes } from '@/lib/queries/lookups'
import { createBooking } from '@/app/booking/actions'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import type { BookingFormData } from '@/lib/schemas/booking'

/**
 * Booking Form Dialog Component
 * Tasks 22.3 & 22.4 + Task 26.7 (Availability Integration)
 * 
 * Modal form for students to create new flight bookings
 * Now integrates with instructor availability management
 */
export function BookingFormDialog({ children }: { children: React.ReactNode}) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    flight_type: 'local',
    departure_airport: 'KAUS',
  })

  // Calculate min and max dates for datetime pickers
  const minDateTime = useMemo(() => {
    const now = new Date()
    // Add 1 hour buffer to ensure it's truly in the future
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }, [])

  const maxDateTime = useMemo(() => {
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    return oneYearFromNow.toISOString().slice(0, 16)
  }, [])

  // Calculate min end time based on start time (must be at least 15 minutes after)
  const minEndDateTime = useMemo(() => {
    if (!formData.scheduled_start) return minDateTime
    const start = new Date(formData.scheduled_start)
    start.setMinutes(start.getMinutes() + 15) // Minimum 15 minute duration
    return start.toISOString().slice(0, 16)
  }, [formData.scheduled_start, minDateTime])

  // Calculate max end time based on start time (cannot exceed 8 hours)
  const maxEndDateTime = useMemo(() => {
    if (!formData.scheduled_start) return maxDateTime
    const start = new Date(formData.scheduled_start)
    const eightHoursLater = new Date(start)
    eightHoursLater.setHours(eightHoursLater.getHours() + 8)
    // Use the earlier of: 8 hours from start OR max booking date
    const maxDate = new Date(maxDateTime)
    return eightHoursLater < maxDate 
      ? eightHoursLater.toISOString().slice(0, 16)
      : maxDateTime
  }, [formData.scheduled_start, maxDateTime])

  // Handle flight type change - auto-clear destination for local flights
  const handleFlightTypeChange = (newFlightType: string) => {
    if (newFlightType === 'local') {
      // Clear destination for local flights
      setFormData(prev => ({ 
        ...prev, 
        flight_type: newFlightType as 'local' | 'short_xc' | 'long_xc',
        destination_airport: '' 
      }))
    } else {
      setFormData(prev => ({ 
        ...prev, 
        flight_type: newFlightType as 'local' | 'short_xc' | 'long_xc'
      }))
    }
  }

  // Fetch all instructors (fallback when no time selected)
  const { data: allInstructors, isLoading: allInstructorsLoading } = useInstructors()
  
  // Fetch available instructors based on selected time
  const { data: availableInstructors, isLoading: availableInstructorsLoading } = useAvailableInstructors(
    formData.scheduled_start,
    formData.scheduled_end
  )
  
  // Fetch aircraft
  const { data: aircraft, isLoading: aircraftLoading } = useAircraft()
  
  // Fetch lookup data (airports and lesson types)
  const { data: airports, isLoading: airportsLoading } = useActiveAirports()
  const { data: lessonTypes, isLoading: lessonTypesLoading } = useActiveLessonTypes()

  // Filter out departure airport from destination options
  const availableDestinations = useMemo(() => {
    if (!airports || !formData.departure_airport) return airports || []
    return (airports || []).filter((airport: any) => 
      airport.code !== formData.departure_airport
    )
  }, [airports, formData.departure_airport])

  // Auto-clear destination if it matches departure
  useEffect(() => {
    if (formData.destination_airport && 
        formData.destination_airport === formData.departure_airport) {
      setFormData(prev => ({ ...prev, destination_airport: '' }))
      toast.info('Destination cannot be the same as departure')
    }
  }, [formData.departure_airport, formData.destination_airport])

  // Determine which instructor list to use
  const hasTimeSelected = !!(formData.scheduled_start && formData.scheduled_end)
  const instructorsLoading = hasTimeSelected ? availableInstructorsLoading : allInstructorsLoading

  // Map instructors to a common format
  const instructors = useMemo(() => {
    if (hasTimeSelected && availableInstructors) {
      return availableInstructors.map((i: any) => ({
        id: i.instructor_id,
        full_name: i.instructor_name,
        email: i.instructor_email,
      }))
    }
    return allInstructors || []
  }, [hasTimeSelected, availableInstructors, allInstructors])

  // Check if selected instructor is still available (after time change)
  useEffect(() => {
    if (hasTimeSelected && formData.instructor_id) {
      const stillAvailable = instructors.some((i: any) => i.id === formData.instructor_id)
      if (!stillAvailable) {
        setFormData(prev => ({ ...prev, instructor_id: undefined }))
        toast.info('Selected instructor is not available at this time')
      }
    }
  }, [hasTimeSelected, formData.instructor_id, instructors])

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
    <Dialog open={open} onOpenChange={setOpen} modal>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto gap-0">
        <DialogHeader className="pb-4">
          <DialogTitle>Book a Flight Lesson</DialogTitle>
          <DialogDescription>
            Schedule a new flight lesson with an instructor
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(95vh-12rem)] px-1">
          {/* Availability Info Alert */}
          {hasTimeSelected && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {instructorsLoading ? (
                  'Checking instructor availability...'
                ) : instructors.length > 0 ? (
                  `${instructors.length} instructor${instructors.length === 1 ? '' : 's'} available for the selected time`
                ) : (
                  'No instructors available for the selected time. Try a different date/time or check instructor availability schedules.'
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Date/Time - Moved to top for better UX */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_start">Start Date & Time *</Label>
              <Input
                id="scheduled_start"
                type="datetime-local"
                value={formData.scheduled_start?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_start: new Date(e.target.value).toISOString() })}
                min={minDateTime}
                max={maxDateTime}
                required
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 1 hour in the future
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_end">End Date & Time *</Label>
              <Input
                id="scheduled_end"
                type="datetime-local"
                value={formData.scheduled_end?.slice(0, 16) || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_end: new Date(e.target.value).toISOString() })}
                min={minEndDateTime}
                max={maxEndDateTime}
                required
                disabled={!formData.scheduled_start}
              />
              <p className="text-xs text-muted-foreground">
                {formData.scheduled_start 
                  ? 'Duration: 15 min - 8 hours' 
                  : 'Select start time first'}
              </p>
            </div>
          </div>

          {/* Instructor Selection */}
          <div className="space-y-2">
            <Label htmlFor="instructor">Flight Instructor *</Label>
            {!hasTimeSelected && (
              <p className="text-sm text-muted-foreground mb-2">
                💡 Select a date and time first to see only available instructors
              </p>
            )}
            <Select
              value={formData.instructor_id}
              onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
              required
              disabled={!hasTimeSelected}
            >
              <SelectTrigger id="instructor">
                <SelectValue placeholder={hasTimeSelected ? "Select an available instructor" : "Select date/time first"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {instructorsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : instructors.length > 0 ? (
                  instructors.map((instructor: any) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.full_name} ({instructor.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {hasTimeSelected ? 'No instructors available at this time' : 'No instructors found'}
                  </SelectItem>
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
              <SelectContent className="max-h-[300px]">
                {aircraftLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : aircraft && aircraft.length > 0 ? (
                  aircraft.map((ac: any) => (
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

          {/* Lesson Type */}
          <div className="space-y-2">
            <Label htmlFor="lesson_type">Lesson Type *</Label>
            <Select
              value={formData.lesson_type}
              onValueChange={(value) => setFormData({ ...formData, lesson_type: value })}
              required
            >
              <SelectTrigger id="lesson_type">
                <SelectValue placeholder="Select a lesson type" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {lessonTypesLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : lessonTypes && lessonTypes.length > 0 ? (
                  lessonTypes.map((lt: any) => (
                    <SelectItem key={lt.id} value={lt.name}>
                      {lt.name}
                      {lt.category && <span className="text-muted-foreground text-xs ml-2">({lt.category})</span>}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No lesson types available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Flight Type */}
          <div className="space-y-2">
            <Label htmlFor="flight_type">Flight Type *</Label>
            <Select
              value={formData.flight_type}
              onValueChange={handleFlightTypeChange}
              required
            >
              <SelectTrigger id="flight_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="local">Local (Pattern)</SelectItem>
                <SelectItem value="short_xc">Short Cross-Country (50-100nm)</SelectItem>
                <SelectItem value="long_xc">Long Cross-Country (100+ nm)</SelectItem>
              </SelectContent>
            </Select>
            {formData.flight_type === 'local' && (
              <p className="text-xs text-muted-foreground">
                ℹ️ Local flights do not require a destination
              </p>
            )}
          </div>

          {/* Airport Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departure_airport">Departure Airport *</Label>
              <Select
                value={formData.departure_airport}
                onValueChange={(value) => setFormData({ ...formData, departure_airport: value })}
                required
              >
                <SelectTrigger id="departure_airport">
                  <SelectValue placeholder="Select departure airport" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {airportsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : airports && airports.length > 0 ? (
                    airports.map((airport: any) => (
                      <SelectItem key={airport.id} value={airport.code}>
                        {airport.code} - {airport.name}
                        {airport.city && <span className="text-muted-foreground text-xs ml-2">({airport.city})</span>}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No airports available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_airport">
                Destination Airport {(formData.flight_type === 'short_xc' || formData.flight_type === 'long_xc') && '*'}
              </Label>
              <Select
                value={formData.destination_airport}
                onValueChange={(value) => setFormData({ ...formData, destination_airport: value })}
                required={formData.flight_type === 'short_xc' || formData.flight_type === 'long_xc'}
                disabled={formData.flight_type === 'local' || !formData.departure_airport}
              >
                <SelectTrigger id="destination_airport">
                  <SelectValue placeholder={
                    formData.flight_type === 'local' 
                      ? 'Not required for local flights' 
                      : !formData.departure_airport
                      ? 'Select departure first'
                      : 'Select destination airport'
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {airportsLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : availableDestinations && availableDestinations.length > 0 ? (
                    availableDestinations.map((airport: any) => (
                      <SelectItem key={airport.id} value={airport.code}>
                        {airport.code} - {airport.name}
                        {airport.city && <span className="text-muted-foreground text-xs ml-2">({airport.city})</span>}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No other airports available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {formData.flight_type !== 'local' && (
                <p className="text-xs text-muted-foreground">
                  ℹ️ Must differ from departure airport
                </p>
              )}
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
              disabled={isSubmitting || instructorsLoading || aircraftLoading || airportsLoading || lessonTypesLoading || (hasTimeSelected && instructors.length === 0)}
            >
              {isSubmitting ? 'Booking...' : 'Book Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
