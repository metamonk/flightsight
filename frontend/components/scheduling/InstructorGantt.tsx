/**
 * Kibo UI Gantt Wrapper
 * 
 * Wrapper for Kibo UI Gantt chart with FlightSight-specific configuration.
 * Used for instructor availability visualization.
 */

'use client'

import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarHeader,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureRow,
  GanttToday,
  type GanttFeature as KiboGanttFeature,
  type GanttStatus
} from '@/components/kibo-ui/gantt'
import { cn } from '@/lib/utils'

export interface InstructorAvailability {
  id: string
  instructor_id: string
  start_time: string // ISO string
  end_time: string // ISO string
  day_of_week: number
  is_recurring: boolean
}

export interface Instructor {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

// Export GanttItem type for use by parent components
export type GanttItem = {
  id: string
  featureId: string
  title: string
  start: Date
  end: Date
}

export interface InstructorGanttProps {
  /** Instructors to display as rows */
  instructors: Instructor[]
  
  /** Availability blocks */
  availability: InstructorAvailability[]
  
  /** Optional: Bookings to show as 'booked' status */
  bookings?: any[]
  
  /** Callback when availability changes */
  onItemMove?: (id: string, startAt: Date, endAt: Date | null) => void
  
  /** Callback when item is clicked */
  onSelectItem?: (id: string) => void
  
  /** Custom className */
  className?: string
  
  /** Zoom level (100 = default) */
  zoom?: number
  
  /** View range */
  range?: 'daily' | 'monthly' | 'quarterly'
}

// Status definitions for availability types
const STATUS_AVAILABLE: GanttStatus = {
  id: 'available',
  name: 'Available',
  color: '#10b981' // green-500
}

const STATUS_BOOKED: GanttStatus = {
  id: 'booked',
  name: 'Booked',
  color: '#3b82f6' // blue-500
}

const STATUS_BLOCKED: GanttStatus = {
  id: 'blocked',
  name: 'Blocked',
  color: '#ef4444' // red-500
}

/**
 * Transform instructors and availability to Gantt features
 */
function transformToGanttFeatures(
  instructors: Instructor[],
  availability: InstructorAvailability[],
  bookings: any[] = []
): KiboGanttFeature[] {
  return instructors.flatMap(instructor => {
    // Get this instructor's availability blocks
    const instructorAvailability = availability.filter(
      avail => avail.instructor_id === instructor.id
    )
    
    // Get this instructor's bookings
    const instructorBookings = bookings.filter(
      booking => booking.instructor_id === instructor.id
    )
    
    // Create features for available slots
    const availableFeatures: KiboGanttFeature[] = instructorAvailability
      .map(avail => {
        const startDate = new Date(avail.start_time)
        const endDate = new Date(avail.end_time)
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Invalid dates for availability ${avail.id}:`, avail.start_time, avail.end_time)
          return null
        }
        
        return {
          id: `availability-${avail.id}`,
          name: `${instructor.full_name} - Available`,
          startAt: startDate,
          endAt: endDate,
          status: STATUS_AVAILABLE,
          lane: instructor.id // Group by instructor
        }
      })
      .filter((f): f is KiboGanttFeature => f !== null)
    
    // Create features for booked slots
    const bookedFeatures: KiboGanttFeature[] = instructorBookings
      .map((booking: any) => {
        const startDate = new Date(booking.scheduled_start)
        const endDate = new Date(booking.scheduled_end)
        
        // Validate dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn(`Invalid dates for booking ${booking.id}:`, booking.scheduled_start, booking.scheduled_end)
          return null
        }
        
        return {
          id: `booking-${booking.id}`,
          name: `${instructor.full_name} - ${booking.lesson_type}`,
          startAt: startDate,
          endAt: endDate,
          status: STATUS_BOOKED,
          lane: instructor.id // Group by instructor
        }
      })
      .filter((f): f is KiboGanttFeature => f !== null)
    
    return [...availableFeatures, ...bookedFeatures]
  })
}

/**
 * InstructorGantt Component
 * 
 * Displays instructor availability in a timeline/Gantt format.
 * Perfect for visualizing who's available when.
 */
export function InstructorGantt({
  instructors,
  availability,
  bookings = [],
  onItemMove,
  onSelectItem,
  className,
  zoom = 100,
  range = 'daily'
}: InstructorGanttProps) {
  const features = transformToGanttFeatures(instructors, availability, bookings)
  
  // Group features by instructor lane
  const featuresByInstructor = instructors.map(instructor => {
    const instructorFeatures = features.filter(f => f.lane === instructor.id)
    
    // Calculate stats for this instructor
    const availableCount = instructorFeatures.filter(f => f.status.id === 'available').length
    const bookedCount = instructorFeatures.filter(f => f.status.id === 'booked').length
    
    return {
      instructor,
      features: instructorFeatures,
      stats: { availableCount, bookedCount }
    }
  })
  
  return (
    <div className={cn('instructor-gantt-wrapper', className)}>
      <GanttProvider range={range} zoom={zoom}>
        {/* Sidebar: One row per instructor */}
        <GanttSidebar>
          <GanttSidebarHeader />
          {featuresByInstructor.map(({ instructor, stats }) => (
            <div
              key={instructor.id}
              className="relative flex items-center gap-2.5 px-2.5 py-3 text-xs border-b border-border/50 hover:bg-secondary transition-colors"
              style={{ minHeight: 'var(--gantt-row-height)' }}
            >
              <div
                className="h-2 w-2 shrink-0 rounded-full bg-primary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{instructor.full_name}</p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                  {stats.availableCount} slots • {stats.bookedCount} booked
                </p>
              </div>
            </div>
          ))}
        </GanttSidebar>
        
        {/* Timeline: One row per instructor with all their features */}
        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            {featuresByInstructor.map(({ instructor, features: instructorFeatures }) => (
              <GanttFeatureRow
                key={instructor.id}
                features={instructorFeatures}
                onMove={onItemMove}
                className="border-b border-border/50"
              >
                {(feature) => (
                  <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => onSelectItem?.(feature.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onSelectItem?.(feature.id)
                      }
                    }}
                  >
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: feature.status.color }}
                    />
                    <span className="truncate text-xs">
                      {feature.status.name}
                    </span>
                  </div>
                )}
              </GanttFeatureRow>
            ))}
          </GanttFeatureList>
          <GanttToday />
        </GanttTimeline>
      </GanttProvider>
    </div>
  )
}

export default InstructorGantt

