'use client'

import { useState } from 'react'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { BookingFormWizard } from './BookingFormWizard'

/**
 * Booking Form Dialog Component
 * 
 * Wrapper component that triggers the booking form wizard.
 * Uses the new multi-step wizard interface for better UX.
 * 
 * IMPORTANT: This component properly wraps DialogTrigger in a Dialog
 * to avoid "DialogTrigger must be used within Dialog" errors.
 */
export function BookingFormDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <BookingFormWizard open={open} onOpenChange={setOpen} />
    </Dialog>
  )
}
