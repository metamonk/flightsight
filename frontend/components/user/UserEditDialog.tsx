'use client'

import { useState, useEffect } from 'react'
import { useUpdateUser, type User, type UserRole, type TrainingLevel } from '@/lib/queries/users'
import { userUpdateSchema, type UserUpdateFormData } from '@/lib/schemas/user'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface UserEditDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * UserEditDialog Component
 * 
 * Form dialog for editing user profiles (admin only)
 * 
 * Features:
 * - Edit full name, email, role, training level, phone
 * - Zod validation with field-specific error messages
 * - Loading states during submission
 * - Success/error toast notifications
 * - React Query mutation with cache invalidation
 * - Conditional training level field (only for student/instructor)
 * - Form resets on close
 */
export function UserEditDialog({ 
  user, 
  open, 
  onOpenChange,
  onSuccess 
}: UserEditDialogProps) {
  const updateUserMutation = useUpdateUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof UserUpdateFormData, string>>>({})
  
  // Form state
  const [formData, setFormData] = useState<UserUpdateFormData>({
    full_name: '',
    email: '',
    role: 'student',
    training_level: null,
    phone: '',
  })

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        training_level: user.training_level || null,
        phone: user.phone || '',
      })
      setErrors({})
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate with Zod
      const validatedData = userUpdateSchema.parse(formData)

      // If role is admin, clear training_level
      const dataToSubmit = {
        ...validatedData,
        training_level: validatedData.role === 'admin' ? null : validatedData.training_level,
        phone: validatedData.phone || null,
      }

      // Call mutation
      await updateUserMutation.mutateAsync({
        id: user!.id,
        data: dataToSubmit,
      })

      toast.success('✅ User updated successfully!')
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof UserUpdateFormData, string>> = {}
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof UserUpdateFormData
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        toast.error('Please fix the validation errors')
      } else {
        toast.error(error.message || 'Failed to update user')
        console.error('Update user error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format training level for display
  const formatTrainingLevel = (level: string) => {
    return level
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (!user) return null

  const showTrainingLevel = formData.role !== 'admin'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              required
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (512) 555-0123"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => {
                setFormData({ 
                  ...formData, 
                  role: value,
                  // Clear training level if switching to admin
                  training_level: value === 'admin' ? null : formData.training_level
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">🎓 Student</SelectItem>
                <SelectItem value="instructor">🧑‍✈️ Instructor</SelectItem>
                <SelectItem value="admin">🎯 Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role}</p>
            )}
          </div>

          {/* Training Level (only for student/instructor) */}
          {showTrainingLevel && (
            <div className="space-y-2">
              <Label htmlFor="training_level">
                Training Level
              </Label>
              <Select
                value={formData.training_level || ''}
                onValueChange={(value: TrainingLevel | '') => {
                  setFormData({ 
                    ...formData, 
                    training_level: value ? value as TrainingLevel : null 
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select training level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not Specified</SelectItem>
                  <SelectItem value="student_pilot">
                    {formatTrainingLevel('student_pilot')}
                  </SelectItem>
                  <SelectItem value="private_pilot">
                    {formatTrainingLevel('private_pilot')}
                  </SelectItem>
                  <SelectItem value="instrument_rated">
                    {formatTrainingLevel('instrument_rated')}
                  </SelectItem>
                  <SelectItem value="commercial_pilot">
                    {formatTrainingLevel('commercial_pilot')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.training_level && (
                <p className="text-sm text-destructive">{errors.training_level}</p>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

