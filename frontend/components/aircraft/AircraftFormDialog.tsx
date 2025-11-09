'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateAircraft, useUpdateAircraft } from '@/lib/queries/aircraft'
import { aircraftSchema, AIRCRAFT_CATEGORIES, type AircraftFormValues } from '@/lib/schemas/aircraft'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import type { Database } from '@/lib/types/database.types'

type Aircraft = Database['public']['Tables']['aircraft']['Row']

interface AircraftFormDialogProps {
  open: boolean
  onClose: () => void
  editingAircraft: Aircraft | null
}

export function AircraftFormDialog({
  open,
  onClose,
  editingAircraft,
}: AircraftFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const createAircraft = useCreateAircraft()
  const updateAircraft = useUpdateAircraft()

  const form = useForm<AircraftFormValues>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      tail_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: AIRCRAFT_CATEGORIES[0],
      hourly_rate: 150,
      is_active: true,
      maintenance_notes: '',
      minimum_weather_requirements: {
        ceiling_ft: 3000,
        visibility_miles: 5,
        wind_speed_knots: 20,
        crosswind_knots: 15,
      },
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editingAircraft) {
      form.reset({
        tail_number: editingAircraft.tail_number,
        make: editingAircraft.make,
        model: editingAircraft.model,
        year: editingAircraft.year,
        category: editingAircraft.category,
        hourly_rate: editingAircraft.hourly_rate,
        is_active: editingAircraft.is_active,
        maintenance_notes: editingAircraft.maintenance_notes || '',
        minimum_weather_requirements: editingAircraft.minimum_weather_requirements as any || {
          ceiling_ft: 3000,
          visibility_miles: 5,
          wind_speed_knots: 20,
          crosswind_knots: 15,
        },
      })
    } else {
      form.reset({
        tail_number: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        category: AIRCRAFT_CATEGORIES[0],
        hourly_rate: 150,
        is_active: true,
        maintenance_notes: '',
        minimum_weather_requirements: {
          ceiling_ft: 3000,
          visibility_miles: 5,
          wind_speed_knots: 20,
          crosswind_knots: 15,
        },
      })
    }
  }, [editingAircraft, form])

  const onSubmit = async (data: AircraftFormValues) => {
    setIsSubmitting(true)

    try {
      if (editingAircraft) {
        // Update existing aircraft
        await updateAircraft.mutateAsync({
          id: editingAircraft.id,
          data: {
            tail_number: data.tail_number,
            make: data.make,
            model: data.model,
            year: data.year,
            category: data.category,
            hourly_rate: data.hourly_rate,
            is_active: data.is_active,
            maintenance_notes: data.maintenance_notes || null,
            minimum_weather_requirements: data.minimum_weather_requirements as any,
          },
        })
        toast.success('Aircraft updated successfully')
      } else {
        // Create new aircraft
        await createAircraft.mutateAsync({
          tail_number: data.tail_number,
          make: data.make,
          model: data.model,
          year: data.year,
          category: data.category,
          hourly_rate: data.hourly_rate,
          is_active: data.is_active,
          maintenance_notes: data.maintenance_notes || null,
          minimum_weather_requirements: data.minimum_weather_requirements as any,
        })
        toast.success('Aircraft created successfully')
      }

      onClose()
    } catch (error) {
      console.error('Error saving aircraft:', error)
      toast.error('Failed to save aircraft')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAircraft ? 'Edit Aircraft' : 'Add New Aircraft'}
          </DialogTitle>
          <DialogDescription>
            {editingAircraft
              ? 'Update aircraft details and configuration'
              : 'Add a new aircraft to your training fleet'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tail_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tail Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="N12345"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field}) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2020"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make *</FormLabel>
                      <FormControl>
                        <Input placeholder="Cessna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="172S" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {AIRCRAFT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="150"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Cost per hour to rent this aircraft
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Weather Minimums */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Weather Minimums</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minimum_weather_requirements.ceiling_ft"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ceiling (ft)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_weather_requirements.visibility_miles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility (miles)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_weather_requirements.wind_speed_knots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Wind (knots)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_weather_requirements.crosswind_knots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Crosswind (knots)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Maintenance Notes */}
            <FormField
              control={form.control}
              name="maintenance_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maintenance Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any maintenance notes or special considerations..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status */}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Active aircraft are available for booking
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

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingAircraft
                  ? 'Update Aircraft'
                  : 'Add Aircraft'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

