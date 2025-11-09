'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Update User Profile
 * 
 * Updates user profile information (name, phone, training level, preferences)
 */
export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string | null
  const trainingLevel = formData.get('training_level') as string | null
  
  // Parse preferences JSON
  let preferences = null
  const preferencesStr = formData.get('preferences') as string | null
  if (preferencesStr) {
    try {
      preferences = JSON.parse(preferencesStr)
    } catch (e) {
      return { success: false, error: 'Invalid preferences format' }
    }
  }

  // Validate required fields
  if (!fullName || fullName.trim().length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters' }
  }

  // Update user profile
  const { error: updateError } = await supabase
    .from('users')
    .update({
      full_name: fullName.trim(),
      phone: phone || null,
      training_level: trainingLevel || null,
      preferences: preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Profile update error:', updateError)
    return { success: false, error: 'Failed to update profile' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

/**
 * Server Action: Change Password
 * 
 * Updates the user's password using Supabase Auth
 */
export async function changePassword(formData: FormData) {
  const supabase = await createClient()

  const currentPassword = formData.get('current_password') as string
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  // Validate inputs
  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'All fields are required' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match' }
  }

  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' }
  }

  if (newPassword === currentPassword) {
    return { success: false, error: 'New password must be different from current password' }
  }

  // Get current user to verify current password
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify current password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { success: false, error: 'Current password is incorrect' }
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    console.error('Password update error:', updateError)
    return { success: false, error: 'Failed to update password' }
  }

  return { success: true }
}

/**
 * Server Action: Update Email
 * 
 * Initiates email change process (requires confirmation)
 */
export async function updateEmail(formData: FormData) {
  const supabase = await createClient()

  const newEmail = formData.get('new_email') as string
  const password = formData.get('password') as string

  // Validate inputs
  if (!newEmail || !password) {
    return { success: false, error: 'Email and password are required' }
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return { success: false, error: 'Invalid email format' }
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || !user.email) {
    return { success: false, error: 'Not authenticated' }
  }

  // Verify password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: password,
  })

  if (signInError) {
    return { success: false, error: 'Incorrect password' }
  }

  // Update email (will send confirmation to new email)
  const { error: updateError } = await supabase.auth.updateUser({
    email: newEmail,
  })

  if (updateError) {
    console.error('Email update error:', updateError)
    return { success: false, error: 'Failed to update email. Email may already be in use.' }
  }

  return { 
    success: true, 
    message: 'Confirmation email sent. Please check your inbox to verify your new email address.' 
  }
}

