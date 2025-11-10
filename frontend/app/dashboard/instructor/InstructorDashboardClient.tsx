/**
 * Instructor Dashboard Client Component
 * 
 * Client-side component that handles:
 * - Real-time subscriptions via InstructorRealtimeProvider
 * - All interactive dashboard logic
 * 
 * This component wraps the entire instructor dashboard content
 * with the InstructorRealtimeProvider to ensure real-time updates
 * work correctly within the client component boundary.
 */

'use client'

import { type ReactNode } from 'react'
import { InstructorRealtimeProvider } from '@/components/realtime/RealtimeProvider'

export interface InstructorDashboardClientProps {
  instructorId: string
  children: ReactNode
}

/**
 * Main Instructor Dashboard Client Component
 * 
 * Wraps content with InstructorRealtimeProvider to establish
 * real-time subscriptions within client boundary.
 */
export function InstructorDashboardClient({ 
  instructorId, 
  children 
}: InstructorDashboardClientProps) {
  return (
    <InstructorRealtimeProvider instructorId={instructorId}>
      {children}
    </InstructorRealtimeProvider>
  )
}

