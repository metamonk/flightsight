/**
 * Scheduling Components Exports
 * 
 * Central export point for all scheduling-related components.
 */

export { ScheduleXCalendarWrapper as ScheduleXCalendar } from './ScheduleXCalendar'
export { InstructorGantt } from './InstructorGantt'
export { InstructorGanttView } from './InstructorGanttView'
export { StudentCalendarView } from './StudentCalendarView'
export { InstructorCalendarView } from './InstructorCalendarView'

// Export types
export type { ScheduleXCalendarProps } from './ScheduleXCalendar'
export type { 
  InstructorGanttProps,
  InstructorAvailability,
  Instructor as GanttInstructor,
  GanttFeature,
  GanttItem
} from './InstructorGantt'
export type { InstructorGanttViewProps } from './InstructorGanttView'
export type { StudentCalendarViewProps } from './StudentCalendarView'
export type { InstructorCalendarViewProps } from './InstructorCalendarView'

