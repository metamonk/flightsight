import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * Create a Supabase client for use in Client Components
 * 
 * This client is configured for browser environments and includes:
 * - Real-time subscriptions
 * - Authentication state management
 * - Automatic session refresh
 * 
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

