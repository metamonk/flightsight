/**
 * Lazy Loaded Schedule-X Calendar Wrapper
 * 
 * Wraps the ScheduleXCalendar component with Next.js dynamic loading
 * for improved initial page load performance
 */

'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import type { ScheduleXCalendarProps } from './ScheduleXCalendar'

// Loading skeleton for calendar
const CalendarSkeleton = () => (
  <div className="w-full space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-10 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="w-full h-[700px]" />
  </div>
)

// Lazy load the Schedule-X calendar
const LazyScheduleXCalendar = dynamic(
  () => import('./ScheduleXCalendar').then((mod) => mod.ScheduleXCalendarWrapper),
  {
    loading: () => <CalendarSkeleton />,
    ssr: false, // Disable SSR for calendar due to temporal-polyfill and client-only features
  }
)

/**
 * Lazy Schedule-X Calendar Component
 * 
 * Use this component instead of directly importing ScheduleXCalendar
 * for optimal code splitting and performance
 */
export function LazyScheduleXCalendarWrapper(props: ScheduleXCalendarProps) {
  return <LazyScheduleXCalendar {...props} />
}

export default LazyScheduleXCalendarWrapper

