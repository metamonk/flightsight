'use client'

import { useState } from 'react'
import { DialogTrigger } from '@/components/ui/dialog'
import { BookingFormWizard } from './BookingFormWizard'

/**
 * Booking Form Dialog Component
 * 
 * Wrapper component that triggers the booking form wizard.
 * Uses the new multi-step wizard interface for better UX.
 */
export function BookingFormDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <BookingFormWizard open={open} onOpenChange={setOpen} />
    </>
  )
}
