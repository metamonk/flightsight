'use client'

import { useState, useEffect } from 'react'
import { useCreateAirport, useUpdateAirport } from '@/lib/queries/lookups'
import { airportSchema, type AirportFormValues } from '@/lib/schemas/lookups'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, Plane } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type Airport = Database['public']['Tables']['airports']['Row']

interface AirportFormDialogProps {
  airport: Airport | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AirportFormDialog({
  airport,
  open,
  onOpenChange,
  onSuccess,
}: AirportFormDialogProps) {
  const createAirport = useCreateAirport()
  const updateAirport = useUpdateAirport()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AirportFormValues, string>>>({})

  // Form state
  const [formData, setFormData] = useState<AirportFormValues>({
    code: '',
    name: '',
    city: '',
    state: '',
    country: 'USA',
    is_active: true,
  })

  // Initialize form data when airport changes
  useEffect(() => {
    if (airport) {
      setFormData({
        code: airport.code,
        name: airport.name,
        city: airport.city || '',
        state: airport.state || '',
        country: airport.country || 'USA',
        is_active: airport.is_active,
      })
      setErrors({})
    } else {
      setFormData({
        code: '',
        name: '',
        city: '',
        state: '',
        country: 'USA',
        is_active: true,
      })
      setErrors({})
    }
  }, [airport, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate with Zod
      const validatedData = airportSchema.parse(formData)

      if (airport) {
        // Update existing airport
        await updateAirport.mutateAsync({
          id: airport.id,
          data: validatedData,
        })
        toast.success('✅ Airport updated successfully!')
      } else {
        // Create new airport
        await createAirport.mutateAsync(validatedData)
        toast.success('✅ Airport created successfully!')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const zodErrors: Partial<Record<keyof AirportFormValues, string>> = {}
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            zodErrors[err.path[0] as keyof AirportFormValues] = err.message
          }
        })
        setErrors(zodErrors)
        toast.error('Please fix the validation errors')
      } else {
        console.error('Error saving airport:', {
          error,
          message: error?.message,
          details: error?.details,
        })
        toast.error(error.message || 'Failed to save airport')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {airport ? 'Edit Airport' : 'Add Airport'}
          </DialogTitle>
          <DialogDescription>
            {airport
              ? 'Update airport information and settings.'
              : 'Add a new airport for booking departure/destination.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Airport Code */}
          <div className="space-y-2">
            <Label htmlFor="code">
              Airport Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              placeholder="e.g., KJFK, KLAX"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              disabled={!!airport} // Can't change code after creation
              className={errors.code ? 'border-destructive' : ''}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
            <p className="text-sm text-muted-foreground">
              ICAO or local identifier (e.g., KJFK, KVNY)
            </p>
          </div>

          {/* Airport Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Airport Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., John F. Kennedy International Airport"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="e.g., Los Angeles"
                value={formData.city || ''}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value || null })
                }
                className={errors.city ? 'border-destructive' : ''}
              />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g., California"
                value={formData.state || ''}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value || null })
                }
                className={errors.state ? 'border-destructive' : ''}
              />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g., USA"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className={errors.country ? 'border-destructive' : ''}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this airport in booking forms
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {airport ? 'Update Airport' : 'Add Airport'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

