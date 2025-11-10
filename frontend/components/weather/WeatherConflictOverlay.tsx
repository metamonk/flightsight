/**
 * Weather Conflict Overlay Component
 * 
 * Renders weather conflicts as visual overlays on top of the calendar.
 * Shows red striped patterns for time slots with weather conflicts.
 * Displays tooltips with weather information on hover.
 */

'use client'

import { useMemo } from 'react'
import 'temporal-polyfill/global'
import type { WeatherConflictData } from '@/lib/schedule-x/events'
import { formatLocalTime } from '@/lib/utils/date'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AlertTriangle } from 'lucide-react'

export interface WeatherConflictOverlayProps {
  /** Array of weather conflicts to display */
  conflicts: WeatherConflictData[]
  
  /** Current view mode of the calendar */
  viewMode?: 'day' | 'week' | 'month-grid' | 'month-agenda'
  
  /** Container ref for positioning overlays */
  calendarRef?: React.RefObject<HTMLElement>
  
  /** Callback when clicking on a conflict overlay */
  onConflictClick?: (conflictId: string) => void
}

interface ConflictPosition {
  id: string
  top: string
  left: string
  width: string
  height: string
  conflict: WeatherConflictData
}

/**
 * Calculate positions for conflict overlays based on calendar grid
 * This is a simplified approach - you may need to adjust based on your calendar's actual DOM structure
 */
function calculateConflictPositions(
  conflicts: WeatherConflictData[],
  viewMode: string
): ConflictPosition[] {
  return conflicts.map(conflict => {
    const start = Temporal.Instant.from(conflict.booking.scheduled_start).toZonedDateTimeISO('UTC')
    const end = Temporal.Instant.from(conflict.booking.scheduled_end).toZonedDateTimeISO('UTC')
    
    // Calculate day of week (0-6, Sunday = 0)
    const dayOfWeek = start.dayOfWeek % 7
    
    // Calculate time position (0-24 hours)
    const startHour = start.hour + start.minute / 60
    const endHour = end.hour + end.minute / 60
    const duration = endHour - startHour
    
    // Calculate percentages for positioning
    // These values assume a week view with 7 columns and 24-hour day
    const leftPercent = viewMode === 'week' ? (dayOfWeek / 7) * 100 : 0
    const widthPercent = viewMode === 'week' ? 100 / 7 : 100
    
    // Assume calendar shows 6 AM to 10 PM (16 hours)
    const dayStart = 6
    const dayEnd = 22
    const visibleHours = dayEnd - dayStart
    
    const topPercent = ((startHour - dayStart) / visibleHours) * 100
    const heightPercent = (duration / visibleHours) * 100
    
    return {
      id: conflict.id,
      top: `${Math.max(0, Math.min(100, topPercent))}%`,
      left: `${leftPercent}%`,
      width: `${widthPercent}%`,
      height: `${Math.max(0, Math.min(100, heightPercent))}%`,
      conflict
    }
  })
}

/**
 * WeatherConflictOverlay Component
 * 
 * Renders visual indicators for weather conflicts on the calendar
 */
export function WeatherConflictOverlay({
  conflicts,
  viewMode = 'week',
  onConflictClick,
}: WeatherConflictOverlayProps) {
  // Filter out resolved conflicts
  const activeConflicts = useMemo(
    () => conflicts.filter(c => c.status !== 'resolved'),
    [conflicts]
  )
  
  // Calculate positions for each conflict
  const conflictPositions = useMemo(
    () => calculateConflictPositions(activeConflicts, viewMode),
    [activeConflicts, viewMode]
  )
  
  if (activeConflicts.length === 0) {
    return null
  }
  
  return (
    <TooltipProvider>
      <div className="weather-conflict-overlay-container pointer-events-none absolute inset-0 z-[5]">
        {conflictPositions.map(position => (
          <Tooltip key={position.id} delayDuration={200}>
            <TooltipTrigger asChild>
              <div
                className="weather-conflict-stripe absolute pointer-events-auto cursor-help rounded-md transition-opacity hover:opacity-40"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: position.height,
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    hsl(var(--destructive)) 0,
                    hsl(var(--destructive)) 5px,
                    transparent 5px,
                    transparent 10px
                  )`,
                  opacity: 0.25,
                  border: '1px dashed hsl(var(--destructive))',
                  zIndex: 5,
                }}
                onClick={() => onConflictClick?.(position.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onConflictClick?.(position.id)
                  }
                }}
                aria-label={`Weather conflict for ${position.conflict.booking.lesson_type}`}
              >
                {/* Optional: Add small icon in the corner */}
                <div className="absolute top-1 right-1">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span>Weather Conflict</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Lesson:</span> {position.conflict.booking.lesson_type}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span>{' '}
                    {formatLocalTime(position.conflict.booking.scheduled_start, 'h:mm a')} -{' '}
                    {formatLocalTime(position.conflict.booking.scheduled_end, 'h:mm a')}
                  </div>
                  <div>
                    <span className="font-medium">Student:</span> {position.conflict.booking.student.full_name}
                  </div>
                  {position.conflict.booking.instructor && (
                    <div>
                      <span className="font-medium">Instructor:</span> {position.conflict.booking.instructor.full_name}
                    </div>
                  )}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs font-medium mb-1">Reasons:</div>
                  <ul className="text-xs space-y-0.5 text-muted-foreground">
                    {position.conflict.weather_reasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-xs text-muted-foreground pt-1 italic">
                  Click for details
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}

export default WeatherConflictOverlay

