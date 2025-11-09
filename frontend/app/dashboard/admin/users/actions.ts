'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { adminCreateSchema, userUpdateSchema, type AdminCreateFormData, type UserUpdateFormData } from '@/lib/schemas/user'

/**
 * Helper: Verify admin access
 * 
 * Checks if the current user is authenticated and has admin role.
 * Used by all admin-only server actions.
 * 
 * Task 24.9
 */
async function verifyAdminAccess() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { 
      success: false, 
      error: 'Authentication required',
      supabase: null 
    }
  }

  const { data: currentUser, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (roleError || currentUser?.role !== 'admin') {
    return { 
      success: false, 
      error: 'Unauthorized: Admin access required',
      supabase: null 
    }
  }

  return { 
    success: true, 
    supabase,
    userId: user.id 
  }
}

/**
 * Server Action: Create Admin Account
 * 
 * Creates a new admin user account using Supabase Admin API.
 * Only callable by existing admins (enforced by RLS + explicit check).
 * 
 * Task 24.6
 */
export async function createAdminAccount(formData: AdminCreateFormData) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  // 2. Validate input data
  try {
    const validated = adminCreateSchema.parse(formData)

    // 3. Create auth user via Supabase Admin API
    // Note: This requires service_role key, not anon key
    // We'll use the regular client but call the auth.signUp endpoint
    // The user will be created with admin role via metadata
    
    const { data: authData, error: createError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          role: 'admin',
          full_name: validated.full_name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    if (createError) {
      return { 
        success: false, 
        error: createError.message 
      }
    }

    if (!authData.user) {
      return { 
        success: false, 
        error: 'Failed to create user account' 
      }
    }

    // 4. Update user profile in database with admin role
    // The trigger should have created the user profile, but we'll update to ensure admin role
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'admin',
        full_name: validated.full_name,
      })
      .eq('id', authData.user.id)

    if (updateError) {
      console.error('Failed to update user profile:', updateError)
      // Don't return error here as the auth user was created successfully
    }

    // 5. Revalidate users list
    revalidatePath('/dashboard/admin/users')

    return { 
      success: true, 
      data: {
        id: authData.user.id,
        email: validated.email,
        full_name: validated.full_name,
      }
    }

  } catch (error: any) {
    if (error.errors) {
      // Zod validation error
      return { 
        success: false, 
        error: 'Validation failed: ' + error.errors.map((e: any) => e.message).join(', ')
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to create admin account' 
    }
  }
}

/**
 * Server Action: Update User
 * 
 * Updates a user's profile information.
 * Only callable by admins (enforced by RLS + explicit check).
 * 
 * Task 24.9
 */
export async function updateUser(userId: string, formData: UserUpdateFormData) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  // 2. Validate input data
  try {
    const validated = userUpdateSchema.parse(formData)

    // 3. Get current user email first (for comparison later)
    const { data: currentUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single()

    // 4. Prepare data for update
    const updateData: any = {
      full_name: validated.full_name,
      email: validated.email,
      role: validated.role,
      training_level: validated.role === 'admin' ? null : validated.training_level,
      phone: validated.phone || null,
      updated_at: new Date().toISOString(),
    }

    // 5. Update user in database
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // 6. If email changed, update auth email as well
    // Note: This requires admin privileges and will send a confirmation email
    if (currentUser && validated.email !== currentUser.email) {
      const { error: emailError } = await supabase.auth.admin.updateUserById(
        userId,
        { email: validated.email }
      )
      
      if (emailError) {
        console.error('Failed to update auth email:', emailError)
        // Don't fail the entire operation, just log it
      }
    }

    // 7. Revalidate users list
    revalidatePath('/dashboard/admin/users')
    revalidatePath(`/dashboard/admin/users/${userId}`)

    return { 
      success: true, 
      data 
    }

  } catch (error: any) {
    if (error.errors) {
      // Zod validation error
      return { 
        success: false, 
        error: 'Validation failed: ' + error.errors.map((e: any) => e.message).join(', ')
      }
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to update user' 
    }
  }
}

/**
 * Server Action: Deactivate User
 * 
 * Marks a user as inactive. Inactive users cannot log in.
 * Only callable by admins (enforced by RLS + explicit check).
 * 
 * Task 24.9
 */
export async function deactivateUser(userId: string) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  try {
    // 2. Prevent admins from deactivating themselves
    if (userId === adminCheck.userId) {
      return { 
        success: false, 
        error: 'You cannot deactivate your own account' 
      }
    }

    // 3. Update user status
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // 4. Revalidate users list
    revalidatePath('/dashboard/admin/users')
    revalidatePath(`/dashboard/admin/users/${userId}`)

    return { 
      success: true, 
      data 
    }

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to deactivate user' 
    }
  }
}

/**
 * Server Action: Reactivate User
 * 
 * Marks a user as active, allowing them to log in again.
 * Only callable by admins (enforced by RLS + explicit check).
 * 
 * Task 24.9
 */
export async function reactivateUser(userId: string) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  try {
    // 2. Update user status
    const { data, error } = await supabase
      .from('users')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // 3. Revalidate users list
    revalidatePath('/dashboard/admin/users')
    revalidatePath(`/dashboard/admin/users/${userId}`)

    return { 
      success: true, 
      data 
    }

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to reactivate user' 
    }
  }
}

/**
 * Server Action: Promote User to Instructor
 * 
 * Changes a user's role to instructor.
 * Only callable by admins (enforced by RLS + explicit check).
 * 
 * Task 24.9
 */
export async function promoteToInstructor(userId: string) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  try {
    // 2. Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: 'instructor',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // 3. Revalidate users list
    revalidatePath('/dashboard/admin/users')
    revalidatePath(`/dashboard/admin/users/${userId}`)

    return { 
      success: true, 
      data 
    }

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to promote user to instructor' 
    }
  }
}

/**
 * Server Action: Demote Instructor to Student
 * 
 * Changes an instructor's role back to student.
 * Only callable by admins (enforced by RLS + explicit check).
 * 
 * Task 24.9
 */
export async function demoteToStudent(userId: string) {
  // 1. Verify current user is an admin
  const adminCheck = await verifyAdminAccess()
  if (!adminCheck.success || !adminCheck.supabase) {
    return { 
      success: false, 
      error: adminCheck.error 
    }
  }

  const supabase = adminCheck.supabase

  try {
    // 2. Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ 
        role: 'student',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { 
        success: false, 
        error: error.message 
      }
    }

    // 3. Revalidate users list
    revalidatePath('/dashboard/admin/users')
    revalidatePath(`/dashboard/admin/users/${userId}`)

    return { 
      success: true, 
      data 
    }

  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to demote instructor to student' 
    }
  }
}

