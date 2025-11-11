/**
 * Booking Form Wizard Component
 * 
 * Multi-step booking form using Kibo Mini Calendar and visual time selection.
 * Provides a guided, user-friendly experience for creating flight bookings.
 * 
 * Steps:
 * 1. Select Date (Kibo Mini Calendar)
 * 2. Select Time & Duration
 * 3. Select Instructor & Aircraft
 * 4. Flight Details
 * 5. Review & Confirm
 */

'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MiniCalendar, 
  MiniCalendarNavigation, 
  MiniCalendarDays, 
  MiniCalendarDay 
} from '@/components/kibo-ui/mini-calendar'
import { useInstructors, useAircraft } from '@/lib/queries/bookings'
import { useAvailableInstructors } from '@/lib/queries/availability'
import { useActiveAirports, useActiveLessonTypes } from '@/lib/queries/lookups'
import { createBooking } from '@/app/booking/actions'
import { toast } from 'sonner'
import {
  Info,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plane,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from 'lucide-react'
import type { BookingFormData } from '@/lib/schemas/booking'
import { format, addMinutes, setHours, setMinutes, isBefore } from 'date-fns'

interface BookingFormWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'date' | 'time' | 'resources' | 'details' | 'review'

// Common flight durations
const DURATION_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
]

// Time slots (6 AM to 10 PM in 30-minute increments)
const generateTimeSlots = (date: Date) => {
  const slots = []
  let currentTime = setHours(setMinutes(date, 0), 6) // Start at 6 AM
  
  for (let i = 0; i < 32; i++) { // 16 hours * 2 slots per hour
    slots.push({
      time: format(currentTime, 'h:mm a'),
      date: currentTime,
    })
    currentTime = addMinutes(currentTime, 30)
  }
  
  return slots
}

export function BookingFormWizard({ open, onOpenChange }: BookingFormWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('date')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form data
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<Date>()
  const [duration, setDuration] = useState(60) // Default 1 hour
  const [formData, setFormData] = useState<Partial<BookingFormData>>({
    flight_type: 'local',
    departure_airport: 'KAUS',
  })
  
  // Computed values
  const timeSlots = useMemo(() => 
    selectedDate ? generateTimeSlots(selectedDate) : [],
    [selectedDate]
  )
  
  const endTime = useMemo(() => 
    selectedTime ? addMinutes(selectedTime, duration) : undefined,
    [selectedTime, duration]
  )
  
  const scheduledStart = useMemo(() => 
    selectedTime ? selectedTime.toISOString() : undefined,
    [selectedTime]
  )
  
  const scheduledEnd = useMemo(() => 
    endTime ? endTime.toISOString() : undefined,
    [endTime]
  )
  
  // Queries
  const { data: availableInstructors, isLoading: availableInstructorsLoading } = useAvailableInstructors(
    scheduledStart,
    scheduledEnd
  )
  const { data: allInstructors } = useInstructors()
  const { data: aircraft, isLoading: aircraftLoading } = useAircraft()
  const { data: airports, isLoading: airportsLoading } = useActiveAirports()
  const { data: lessonTypes, isLoading: lessonTypesLoading } = useActiveLessonTypes()
  
  // Instructor list based on time selection
  const instructors = useMemo(() => {
    if (scheduledStart && scheduledEnd && availableInstructors) {
      return availableInstructors.map((i: any) => ({
        id: i.instructor_id,
        full_name: i.instructor_name,
        email: i.instructor_email,
      }))
    }
    return allInstructors || []
  }, [scheduledStart, scheduledEnd, availableInstructors, allInstructors])
  
  // Available destinations (exclude departure)
  const availableDestinations = useMemo(() => {
    if (!airports || !formData.departure_airport) return airports || []
    return (airports || []).filter((airport: any) => 
      airport.code !== formData.departure_airport
    )
  }, [airports, formData.departure_airport])
  
  // Step progression
  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'date':
        return !!selectedDate
      case 'time':
        return !!selectedTime && !!endTime
      case 'resources':
        return !!formData.instructor_id && !!formData.aircraft_id
      case 'details':
        return !!formData.lesson_type && 
               !!formData.departure_airport && 
               (formData.flight_type === 'local' || !!formData.destination_airport)
      case 'review':
        return true
      default:
        return false
    }
  }, [currentStep, selectedDate, selectedTime, endTime, formData])
  
  const nextStep = () => {
    const steps: Step[] = ['date', 'time', 'resources', 'details', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }
  
  const prevStep = () => {
    const steps: Step[] = ['date', 'time', 'resources', 'details', 'review']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }
  
  const resetForm = useCallback(() => {
    setCurrentStep('date')
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setDuration(60)
    setFormData({
      flight_type: 'local',
      departure_airport: 'KAUS',
    })
  }, [])
  
  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const bookingData: BookingFormData = {
        ...formData as BookingFormData,
        scheduled_start: scheduledStart!,
        scheduled_end: scheduledEnd!,
      }
      
      const result = await createBooking(bookingData)
      
      if (result.error) {
        toast.error(result.error)
        if (result.details) {
          Object.entries(result.details).forEach(([field, errors]) => {
            if (Array.isArray(errors) && errors.length > 0) {
              toast.error(`${field}: ${errors[0]}`)
            }
          })
        }
      } else {
        toast.success('✅ Lesson booked successfully!')
        onOpenChange(false)
        resetForm()
      }
    } catch (error) {
      toast.error('Failed to create booking')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm()
    }
  }, [open, resetForm])

  // Don't render anything if not open
  if (!open) return null

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border-primary/30">
        {/* HUD Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,150,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,150,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        {/* Corner Brackets */}
        <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-2 border-l-2 border-primary pointer-events-none z-10" />
        <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-2 border-r-2 border-primary pointer-events-none z-10" />
        <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-2 border-l-2 border-primary pointer-events-none z-10" />
        <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-2 border-r-2 border-primary pointer-events-none z-10" />
        
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <DialogTitle>Book a Flight Lesson</DialogTitle>
            <span className="text-sm font-mono text-muted-foreground">
              Step {['date', 'time', 'resources', 'details', 'review'].indexOf(currentStep) + 1} of 5
            </span>
          </div>
          
          {/* HUD-styled Progress indicator */}
          <div className="flex gap-1 mt-4">
            {['date', 'time', 'resources', 'details', 'review'].map((step, index) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  ['date', 'time', 'resources', 'details', 'review'].indexOf(currentStep) >= index
                    ? 'bg-primary shadow-[0_0_8px_rgba(100,180,255,0.5)]'
                    : 'bg-muted/30'
                }`}
              />
            ))}
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1">
          {/* Step 1: Date Selection */}
          {currentStep === 'date' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Select a Date</h3>
              </div>
              
              <Alert variant="hud">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Choose the date for your flight lesson
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center py-6">
                <MiniCalendar
                  value={selectedDate}
                  onValueChange={setSelectedDate}
                  days={7}
                  className="w-full max-w-2xl"
                >
                  <MiniCalendarNavigation direction="prev" />
                  <MiniCalendarDays className="flex-1 justify-between">
                    {(date) => <MiniCalendarDay key={date.toISOString()} date={date} />}
                  </MiniCalendarDays>
                  <MiniCalendarNavigation direction="next" />
                </MiniCalendar>
              </div>
              
              {selectedDate && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Step 2: Time Selection */}
          {currentStep === 'time' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Select Time & Duration</h3>
              </div>
              
              {/* Duration Presets */}
              <div className="space-y-2">
                <Label>Flight Duration</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map((preset) => (
                    <Button
                      key={preset.minutes}
                      type="button"
                      variant={duration === preset.minutes ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDuration(preset.minutes)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="space-y-2">
                <Label>Start Time</Label>
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto p-2 border rounded-lg bg-muted/30">
                  {timeSlots.map((slot) => {
                    const isPast = isBefore(slot.date, new Date())
                    const isSelected = selectedTime && slot.date.getTime() === selectedTime.getTime()
                    
                    return (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={isPast}
                        onClick={() => setSelectedTime(slot.date)}
                        className="h-auto py-2"
                      >
                        {slot.time}
                      </Button>
                    )
                  })}
                </div>
              </div>
              
              {selectedTime && endTime && (
                <Card className="border-primary/50 bg-primary/5">
                  <CardContent>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        Time Selected
                      </p>
                      <p className="text-muted-foreground">
                        {format(selectedTime, 'h:mm a')} - {format(endTime, 'h:mm a')} ({duration} minutes)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {/* Step 3: Instructor & Aircraft */}
          {currentStep === 'resources' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Select Instructor & Aircraft</h3>
              </div>
              
              {availableInstructorsLoading ? (
                <Alert variant="hud">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Checking instructor availability...
                  </AlertDescription>
                </Alert>
              ) : instructors.length > 0 ? (
                <Alert variant="hud">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {instructors.length} instructor{instructors.length === 1 ? '' : 's'} available for your selected time
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    No instructors available at this time. Please go back and select a different time.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="instructor">Flight Instructor *</Label>
                <Select
                  value={formData.instructor_id}
                  onValueChange={(value) => setFormData({ ...formData, instructor_id: value })}
                >
                  <SelectTrigger id="instructor">
                    <SelectValue placeholder="Select an instructor" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {instructors.map((instructor: any) => (
                      <SelectItem key={instructor.id} value={instructor.id}>
                        {instructor.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aircraft">Aircraft *</Label>
                <Select
                  value={formData.aircraft_id}
                  onValueChange={(value) => setFormData({ ...formData, aircraft_id: value })}
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
            </div>
          )}
          
          {/* Step 4: Flight Details */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Plane className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Flight Details</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson_type">Lesson Type *</Label>
                <Select
                  value={formData.lesson_type}
                  onValueChange={(value) => setFormData({ ...formData, lesson_type: value })}
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
              
              <div className="space-y-2">
                <Label htmlFor="flight_type">Flight Type *</Label>
                <Select
                  value={formData.flight_type}
                  onValueChange={(value) => {
                    if (value === 'local') {
                      setFormData({ ...formData, flight_type: value as any, destination_airport: '' })
                    } else {
                      setFormData({ ...formData, flight_type: value as any })
                    }
                  }}
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_airport">Departure *</Label>
                  <Select
                    value={formData.departure_airport}
                    onValueChange={(value) => setFormData({ ...formData, departure_airport: value })}
                  >
                    <SelectTrigger id="departure_airport">
                      <SelectValue placeholder="Select departure" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {airportsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : airports && airports.length > 0 ? (
                        airports.map((airport: any) => (
                          <SelectItem key={airport.id} value={airport.code}>
                            {airport.code}
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
                    Destination {(formData.flight_type === 'short_xc' || formData.flight_type === 'long_xc') && '*'}
                  </Label>
                  <Select
                    value={formData.destination_airport}
                    onValueChange={(value) => setFormData({ ...formData, destination_airport: value })}
                    disabled={formData.flight_type === 'local'}
                  >
                    <SelectTrigger id="destination_airport">
                      <SelectValue placeholder={formData.flight_type === 'local' ? 'N/A' : 'Select destination'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {availableDestinations && availableDestinations.length > 0 ? (
                        availableDestinations.map((airport: any) => (
                          <SelectItem key={airport.id} value={airport.code}>
                            {airport.code}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No other airports</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson_notes">Lesson Notes (Optional)</Label>
                <Input
                  id="lesson_notes"
                  placeholder="Any specific goals or notes"
                  value={formData.lesson_notes || ''}
                  onChange={(e) => setFormData({ ...formData, lesson_notes: e.target.value })}
                />
              </div>
            </div>
          )}
          
          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Check className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Review & Confirm</h3>
              </div>
              
              <Card>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-muted-foreground">Date & Time</span>
                      <span className="text-sm font-medium text-right">
                        {selectedDate && format(selectedDate, 'MMMM d, yyyy')}<br />
                        {selectedTime && endTime && `${format(selectedTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-muted-foreground">Instructor</span>
                      <span className="text-sm font-medium">
                        {instructors.find((i: any) => i.id === formData.instructor_id)?.full_name || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-muted-foreground">Aircraft</span>
                      <span className="text-sm font-medium">
                        {(aircraft?.find((a: any) => a.id === formData.aircraft_id) as any)?.tail_number || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-muted-foreground">Lesson Type</span>
                      <span className="text-sm font-medium">{formData.lesson_type || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2 border-b">
                      <span className="text-sm text-muted-foreground">Flight Type</span>
                      <span className="text-sm font-medium capitalize">{formData.flight_type?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                    
                    <div className="flex justify-between items-start py-2">
                      <span className="text-sm text-muted-foreground">Route</span>
                      <span className="text-sm font-medium">
                        {formData.departure_airport}
                        {formData.destination_airport && ` → ${formData.destination_airport}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Alert variant="hud">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Your booking will be sent to the instructor for approval
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 'date'}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            
            {currentStep === 'review' ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
  )
}

