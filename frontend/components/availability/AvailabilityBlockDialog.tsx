'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAvailability, useUpdateAvailability } from '@/lib/queries/availability'
import { availabilitySchema, DAY_LABELS, type AvailabilityFormValues } from '@/lib/schemas/availability'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database.types'

type AvailabilityPattern = Database['public']['Tables']['availability']['Row']

interface AvailabilityBlockDialogProps {
  open: boolean
  onClose: () => void
  editingPattern: AvailabilityPattern | null
  userId: string
}

export function AvailabilityBlockDialog({
  open,
  onClose,
  editingPattern,
  userId,
}: AvailabilityBlockDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAvailability = useCreateAvailability()
  const updateAvailability = useUpdateAvailability()

  const form = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      is_recurring: true,
      valid_from: null,
      valid_until: null,
    },
  })

  const isRecurring = form.watch('is_recurring')

  // Populate form when editing
  useEffect(() => {
    if (editingPattern) {
      form.reset({
        day_of_week: editingPattern.day_of_week,
        start_time: editingPattern.start_time,
        end_time: editingPattern.end_time,
        is_recurring: editingPattern.is_recurring,
        valid_from: editingPattern.valid_from,
        valid_until: editingPattern.valid_until,
      })
    } else {
      form.reset({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_recurring: true,
        valid_from: null,
        valid_until: null,
      })
    }
  }, [editingPattern, form])

  const onSubmit = async (data: AvailabilityFormValues) => {
    setIsSubmitting(true)

    try {
      if (editingPattern) {
        // Update existing pattern
        await updateAvailability.mutateAsync({
          id: editingPattern.id,
          data: {
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time,
            is_recurring: data.is_recurring,
            valid_from: data.valid_from || null,
            valid_until: data.valid_until || null,
          },
        })
        toast.success('Availability pattern updated')
      } else {
        // Create new pattern
        await createAvailability.mutateAsync({
          user_id: userId,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          is_recurring: data.is_recurring,
          valid_from: data.valid_from || null,
          valid_until: data.valid_until || null,
        })
        toast.success('Availability pattern created')
      }

      onClose()
    } catch (error: any) {
      // Enhanced error logging to see actual Supabase error details
      console.error('Error saving availability:', {
        error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      })
      
      // Show detailed error message to user
      const errorMessage = error?.message || error?.details || 'Failed to save availability pattern'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingPattern ? 'Edit Availability Pattern' : 'Add Availability Pattern'}
          </DialogTitle>
          <DialogDescription>
            Set your available hours for a specific day of the week.
            {isRecurring
              ? ' This pattern will repeat weekly.'
              : ' This is a one-time availability.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Day of Week */}
            <FormField
              control={form.control}
              name="day_of_week"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day of Week</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DAY_LABELS.map((day) => (
                        <SelectItem key={day.value} value={day.value.toString()}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Recurring Toggle */}
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Weekly</FormLabel>
                    <FormDescription>
                      Repeat this availability every week
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Date Range (optional for recurring, required for one-time) */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRecurring ? 'Start Date (Optional)' : 'Date'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      {isRecurring ? 'When this pattern begins' : 'Specific date'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isRecurring && (
                <FormField
                  control={form.control}
                  name="valid_until"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>When this pattern ends</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingPattern
                  ? 'Update Pattern'
                  : 'Add Pattern'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

