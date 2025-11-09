/**
 * Scheduling Components Exports
 * 
 * Central export point for all scheduling-related components.
 */

export { ScheduleXCalendarWrapper as ScheduleXCalendar } from './ScheduleXCalendar'
export { InstructorGantt } from './InstructorGantt'
export { StudentCalendarView } from './StudentCalendarView'

// Export types
export type { ScheduleXCalendarProps } from './ScheduleXCalendar'
export type { 
  InstructorGanttProps,
  InstructorAvailability,
  Instructor as GanttInstructor,
  GanttFeature,
  GanttItem
} from './InstructorGantt'
export type { StudentCalendarViewProps } from './StudentCalendarView'

