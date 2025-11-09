-- ============================================
-- Add is_active column to users table
-- Task 24.7 - User Deactivation Feature
-- ============================================

-- Add is_active column to users table (default TRUE for all existing users)
ALTER TABLE public.users 
ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;

-- Create index for faster filtering by active status
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Add comment to explain the column
COMMENT ON COLUMN public.users.is_active IS 'Indicates whether the user account is active. Inactive users cannot log in.';

-- Update existing users to be active by default (safety measure)
UPDATE public.users SET is_active = TRUE WHERE is_active IS NULL;

