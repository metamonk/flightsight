'use client'

import { useState } from 'react'
import { useCreateAdmin } from '@/lib/queries/users'
import { adminCreateSchema, type AdminCreateFormData } from '@/lib/schemas/user'
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
import { toast } from 'sonner'
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AdminCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * AdminCreateDialog Component
 * 
 * Form dialog for creating new admin accounts (admin only)
 * 
 * Features:
 * - Email, password, and full name inputs
 * - Password strength validation (8+ chars, uppercase, lowercase, number)
 * - Password confirmation matching
 * - Zod validation with field-specific error messages
 * - Loading states during submission
 * - Success/error toast notifications
 * - React Query mutation with cache invalidation
 * - Security warning about admin privileges
 * - Form resets on success
 * 
 * Task 24.6
 */
export function AdminCreateDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: AdminCreateDialogProps) {
  const createAdminMutation = useCreateAdmin()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AdminCreateFormData, string>>>({})
  
  // Form state
  const [formData, setFormData] = useState<AdminCreateFormData>({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setErrors({})
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate with Zod
      const validatedData = adminCreateSchema.parse(formData)

      // Call mutation
      await createAdminMutation.mutateAsync({
        email: validatedData.email,
        password: validatedData.password,
        full_name: validatedData.full_name,
      })

      toast.success('✅ Admin account created successfully!', {
        description: `${validatedData.full_name} has been granted admin privileges.`
      })
      
      resetForm()
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const fieldErrors: Partial<Record<keyof AdminCreateFormData, string>> = {}
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof AdminCreateFormData
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        toast.error('Please fix the validation errors')
      } else {
        toast.error(error.message || 'Failed to create admin account')
        console.error('Create admin error:', error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Create Admin Account
          </DialogTitle>
          <DialogDescription>
            Create a new administrator account with full system access
          </DialogDescription>
        </DialogHeader>

        {/* Security Warning */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm text-amber-600 dark:text-amber-400">
            <strong>Security Notice:</strong> Admin accounts have unrestricted access to all system features, 
            including user management, aircraft configuration, and booking oversight. Only create admin accounts 
            for trusted personnel.
          </AlertDescription>
        </Alert>

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
              disabled={isSubmitting}
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
              placeholder="admin@example.com"
              required
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This email will be used for login and notifications
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters with uppercase, lowercase, and number
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Privileges Summary */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="text-sm font-semibold mb-2 text-primary">Admin Privileges Include:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Full user management (create, edit, deactivate)</li>
              <li>✓ Aircraft and resource configuration</li>
              <li>✓ Booking oversight and management</li>
              <li>✓ System settings and preferences</li>
              <li>✓ Analytics and reporting access</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Admin Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

