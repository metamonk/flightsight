import { z } from 'zod'

/**
 * User update validation schema
 * Task 24.4
 * 
 * For admin user management - editing user profiles
 */
export const userUpdateSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  role: z.enum(['student', 'instructor', 'admin']),
  
  training_level: z.enum(['student_pilot', 'private_pilot', 'instrument_rated', 'commercial_pilot']).optional().nullable(),
  
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 
      'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
})

export type UserUpdateFormData = z.infer<typeof userUpdateSchema>

/**
 * Admin account creation schema
 * Task 24.6
 */
export const adminCreateSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be less than 72 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
)

export type AdminCreateFormData = z.infer<typeof adminCreateSchema>

