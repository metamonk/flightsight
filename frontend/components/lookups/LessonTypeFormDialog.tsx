'use client'

import { useState, useEffect } from 'react'
import { useCreateLessonType, useUpdateLessonType } from '@/lib/queries/lookups'
import { lessonTypeSchema, type LessonTypeFormValues, lessonTypeCategories, getCategoryLabel } from '@/lib/schemas/lookups'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Loader2, GraduationCap } from 'lucide-react'
import type { Database } from '@/lib/types/database.types'

type LessonType = Database['public']['Tables']['lesson_types']['Row']

interface LessonTypeFormDialogProps {
  lessonType: LessonType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function LessonTypeFormDialog({
  lessonType,
  open,
  onOpenChange,
  onSuccess,
}: LessonTypeFormDialogProps) {
  const createLessonType = useCreateLessonType()
  const updateLessonType = useUpdateLessonType()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof LessonTypeFormValues, string>>>({})

  // Form state
  const [formData, setFormData] = useState<LessonTypeFormValues>({
    name: '',
    description: '',
    category: null,
    is_active: true,
  })

  // Initialize form data when lesson type changes
  useEffect(() => {
    if (lessonType) {
      setFormData({
        name: lessonType.name,
        description: lessonType.description || '',
        category: lessonType.category as any,
        is_active: lessonType.is_active,
      })
      setErrors({})
    } else {
      setFormData({
        name: '',
        description: '',
        category: null,
        is_active: true,
      })
      setErrors({})
    }
  }, [lessonType, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate with Zod
      const validatedData = lessonTypeSchema.parse(formData)

      if (lessonType) {
        // Update existing lesson type
        await updateLessonType.mutateAsync({
          id: lessonType.id,
          data: validatedData,
        })
        toast.success('✅ Lesson type updated successfully!')
      } else {
        // Create new lesson type
        await createLessonType.mutateAsync(validatedData)
        toast.success('✅ Lesson type created successfully!')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const zodErrors: Partial<Record<keyof LessonTypeFormValues, string>> = {}
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            zodErrors[err.path[0] as keyof LessonTypeFormValues] = err.message
          }
        })
        setErrors(zodErrors)
        toast.error('Please fix the validation errors')
      } else {
        console.error('Error saving lesson type:', {
          error,
          message: error?.message,
          details: error?.details,
        })
        toast.error(error.message || 'Failed to save lesson type')
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
            <GraduationCap className="h-5 w-5" />
            {lessonType ? 'Edit Lesson Type' : 'Add Lesson Type'}
          </DialogTitle>
          <DialogDescription>
            {lessonType
              ? 'Update lesson type information and settings.'
              : 'Add a new lesson type for booking categorization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lesson Type Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Lesson Type Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Private Pilot Training"
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

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category || 'none'}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value === 'none' ? null : value as any })
              }
            >
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {lessonTypeCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Primary, Advanced, or Specialized training
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this lesson type..."
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value || null })
              }
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this lesson type in booking forms
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
              {lessonType ? 'Update Lesson Type' : 'Add Lesson Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

