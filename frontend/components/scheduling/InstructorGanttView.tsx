/**
 * Instructor Gantt View Component
 * 
 * Integrates InstructorGantt with data fetching and management for instructor dashboard.
 * Shows instructor availability patterns and bookings in a timeline format.
 */

'use client'

import { useMemo, useState } from 'react'
import { InstructorGantt, type InstructorAvailability, type Instructor, type GanttItem } from './InstructorGantt'
import { 
  useAllInstructorsAvailability, 
  useUpdateAvailability,
  useDeleteAvailability 
} from '@/lib/queries/availability'
import { useInstructorBookings } from '@/lib/queries/bookings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export interface InstructorGanttViewProps {
  /** Show only specific instructor's availability */
  instructorId?: string
  
  /** Enable drag and drop editing */
  editable?: boolean
  
  /** Custom height */
  height?: string | number
  
  /** Show loading skeleton */
  showSkeleton?: boolean
  
  /** Custom class name */
  className?: string
}

/**
 * InstructorGanttView Component
 * 
 * Displays instructor availability in Gantt chart format with real-time data
 */
export function InstructorGanttView({
  instructorId,
  editable = true,
  height = '600px',
  showSkeleton = true,
  className
}: InstructorGanttViewProps) {
  // Fetch availability data for all instructors (includes user data via join)
  const { 
    data: availabilityData, 
    isLoading: availabilityLoading, 
    error: availabilityError 
  } = useAllInstructorsAvailability()
  
  // Fetch bookings to show booked time slots
  const {
    data: bookings,
    isLoading: bookingsLoading
  } = useInstructorBookings(instructorId || '')
  
  // Mutation for updating availability
  const updateAvailability = useUpdateAvailability()
  
  // Mutation for deleting availability
  const deleteAvailability = useDeleteAvailability()
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<GanttItem | null>(null)
  
  // Transform availability data to instructors list
  const instructors = useMemo(() => {
    if (!availabilityData) return []
    
    // Extract unique instructors from availability data
    const instructorMap = new Map<string, Instructor>()
    
    for (const avail of availabilityData) {
      const user = avail.users as any
      if (user && user.id) {
        if (!instructorMap.has(user.id)) {
          instructorMap.set(user.id, {
            id: user.id,
            full_name: user.full_name || user.email || 'Unknown',
            email: user.email || '',
            avatar_url: undefined
          })
        }
      }
    }
    
    const allInstructors = Array.from(instructorMap.values())
    
    // Filter by specific instructor if provided
    if (instructorId) {
      return allInstructors.filter(i => i.id === instructorId)
    }
    
    return allInstructors
  }, [availabilityData, instructorId])
  
  // Transform availability data to format expected by Gantt
  const availability = useMemo(() => {
    if (!availabilityData) return []
    
    const transformed: InstructorAvailability[] = availabilityData.map(avail => {
      const user = avail.users as any
      return {
        id: avail.id,
        instructor_id: user?.id || avail.user_id,
        start_time: avail.start_time,
        end_time: avail.end_time,
        day_of_week: avail.day_of_week,
        is_recurring: avail.is_recurring
      }
    })
    
    // Filter by instructor if specified
    if (instructorId) {
      return transformed.filter(a => a.instructor_id === instructorId)
    }
    
    return transformed
  }, [availabilityData, instructorId])
  
  // Handle item changes (drag/resize events)
  const handleItemChange = async (item: GanttItem) => {
    if (!editable) return
    
    try {
      // Extract availability ID from the item ID (format: "availability-{id}")
      const availabilityId = item.id.replace('availability-', '')
      
      // Ignore booking items (they shouldn't be editable by instructors)
      if (item.id.startsWith('booking-')) {
        toast.error('Cannot edit bookings', {
          description: 'Bookings are managed by the system'
        })
        return
      }
      
      // Update the availability with new start/end times
      await updateAvailability.mutateAsync({
        id: availabilityId,
        data: {
          start_time: item.start.toISOString(),
          end_time: item.end.toISOString()
        }
      })
      
      toast.success('Availability updated', {
        description: `${item.title} has been rescheduled`
      })
    } catch (error) {
      toast.error('Failed to update availability', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
  
  // Handle item clicks - now opens context menu or shows info
  const handleItemClick = async (item: GanttItem) => {
    // Different behavior for bookings vs availability
    if (item.id.startsWith('booking-')) {
      toast.info('Booking selected', {
        description: `${item.title} - View details in calendar`,
        duration: 2000
      })
    } else {
      toast.info('Availability block selected', {
        description: editable ? 'Right-click for options, or drag to adjust times' : 'View-only mode',
        duration: 2000
      })
    }
  }
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !editable) return
    
    try {
      const availabilityId = itemToDelete.id.replace('availability-', '')
      
      // Get the instructor ID from the featureId
      await deleteAvailability.mutateAsync({
        id: availabilityId,
        userId: itemToDelete.featureId
      })
      
      toast.success('Availability deleted', {
        description: 'The availability block has been removed'
      })
      
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      toast.error('Failed to delete availability', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // Loading state
  if (availabilityLoading || bookingsLoading) {
    return showSkeleton ? (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Instructor Availability
          </CardTitle>
          <CardDescription>Loading availability data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    ) : (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading Gantt chart...</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (availabilityError) {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error Loading Availability
          </CardTitle>
          <CardDescription>
            {(availabilityError as Error).message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Reload Data
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Empty state
  if (!instructors || instructors.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Instructor Availability
          </CardTitle>
          <CardDescription>No instructors found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍✈️</div>
            <p className="text-lg font-medium mb-2">No availability set</p>
            <p className="text-sm text-muted-foreground mb-4">
              Set your availability to let students know when you're free to teach
            </p>
            <Button onClick={() => window.location.href = '/dashboard/instructor/availability'}>
              Set Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Main view
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Instructor Availability Timeline
            </CardTitle>
            <CardDescription>
              {instructors.length} instructor{instructors.length !== 1 ? 's' : ''} • 
              {availability.length} availability block{availability.length !== 1 ? 's' : ''}
              {bookings && bookings.length > 0 && (
                <> • {bookings.length} booking{bookings.length !== 1 ? 's' : ''}</>
              )}
            </CardDescription>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-muted-foreground">Blocked</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {editable && (
          <div className="mb-4 p-3 bg-accent/50 border border-border rounded-lg text-sm">
            💡 <strong>Tip:</strong> Drag to move availability blocks or resize them to adjust times. 
            Right-click blocks for more options.
          </div>
        )}
        
        <div style={{ height }}>
          <InstructorGantt
            instructors={instructors}
            availability={availability}
            bookings={bookings || []}
            resizable={editable}
            draggable={editable}
            onItemMove={(id: string, startAt: Date, endAt: Date | null) => {
              if (endAt) {
                handleItemChange({ id, start: startAt, end: endAt } as any)
              }
            }}
            onSelectItem={(id: string) => {
              handleItemClick({ id } as any)
            }}
            className="border rounded-lg"
          />
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete Availability Block?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this availability block? 
                This action cannot be undone. Existing bookings will not be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}

export default InstructorGanttView

