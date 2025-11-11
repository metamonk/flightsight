'use client'

import { Button } from '@/components/ui/button'
import { BookingFormDialog } from './BookingFormDialog'

/**
 * Book Lesson Button - Client Component
 *
 * Wraps the booking form dialog trigger in a client component
 * to ensure proper hydration and click handling.
 */
export function BookLessonButton({ className }: { className?: string }) {
  const handleClick = () => {
    console.log('🔍 BookLessonButton clicked!')
  }

  return (
    <BookingFormDialog>
      <Button
        variant="default"
        size="default"
        type="button"
        onClick={handleClick}
        className={className}
      >
        ✈️ Book a Lesson
      </Button>
    </BookingFormDialog>
  )
}

