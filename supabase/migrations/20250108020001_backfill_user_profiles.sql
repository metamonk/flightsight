-- ============================================
-- BACKFILL EXISTING AUTH USERS
-- ============================================
-- This migration creates public.users records for any auth.users 
-- that don't already have a profile (e.g., users created before the trigger).

INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at,
  last_login_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  COALESCE(
    (au.raw_user_meta_data->>'role')::user_role,
    'student'::user_role
  ),
  au.created_at,
  NOW(),
  au.last_sign_in_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;  -- Only insert users that don't already have a profile

-- Log how many users were backfilled
DO $$
DECLARE
  backfilled_count INTEGER;
BEGIN
  GET DIAGNOSTICS backfilled_count = ROW_COUNT;
  RAISE NOTICE 'Backfilled % user profiles', backfilled_count;
END $$;

