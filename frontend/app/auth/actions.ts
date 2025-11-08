'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: User Login
 * 
 * Authenticates a user with email and password using Supabase Auth.
 * On success, redirects to dashboard. On error, redirects to login with error message.
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate inputs
  if (!email || !password) {
    redirect('/auth/login?error=Missing email or password')
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard/student')
}

/**
 * Server Action: User Registration
 * 
 * Creates a new user account with email and password.
 * On success, redirects to dashboard (auto-logged in).
 * On error, redirects back to register with error message.
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate inputs
  if (!email || !password || !confirmPassword) {
    redirect('/auth/register?error=All fields are required')
  }

  if (password !== confirmPassword) {
    redirect('/auth/register?error=Passwords do not match')
  }

  if (password.length < 6) {
    redirect('/auth/register?error=Password must be at least 6 characters')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        role: 'student', // Default role for new users
      },
    },
  })

  if (error) {
    redirect(`/auth/register?error=${encodeURIComponent(error.message)}`)
  }

  // Check if email confirmation is required (set in Supabase dashboard)
  const requireEmailConfirmation = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_CONFIRMATION === 'true'
  
  if (requireEmailConfirmation) {
    // Redirect to confirmation page
    redirect('/auth/register?success=Check your email to confirm your account')
  } else {
    // Auto-login and redirect to dashboard
    revalidatePath('/', 'layout')
    redirect('/auth/login?message=Account created successfully! Please sign in.')
  }
}

/**
 * Server Action: User Logout
 * 
 * Signs out the current user and clears their session.
 */
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

