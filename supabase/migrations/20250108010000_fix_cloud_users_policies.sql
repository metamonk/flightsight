-- ============================================
-- FIX CLOUD DATABASE: Remove infinite recursion in users policies
-- ============================================

-- Drop ALL problematic policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other users' profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view other user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view other users profiles" ON public.users;
DROP POLICY IF EXISTS "Users can view instructor and student profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.users;
DROP POLICY IF EXISTS "users_select_authenticated" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create ONLY clean policies with NO column references
CREATE POLICY "users_select_own"
  ON public.users 
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users 
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_select_all"
  ON public.users 
  FOR SELECT
  TO authenticated
  USING (true);

