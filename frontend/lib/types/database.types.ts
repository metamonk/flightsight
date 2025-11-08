/**
 * Database Types
 * 
 * These types are automatically generated from your Supabase schema.
 * To regenerate, run: npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/types/database.types.ts
 * 
 * For now, we'll use a flexible type definition that allows all operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [key: string]: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
    }
    Views: {
      [key: string]: {
        Row: any
        Relationships: any[]
      }
    }
    Functions: {
      [key: string]: any
    }
    Enums: {
      [key: string]: string
    }
    CompositeTypes: {
      [_: string]: never
    }
  }
}

