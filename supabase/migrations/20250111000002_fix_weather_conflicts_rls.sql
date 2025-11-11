-- ============================================
-- FIX: Allow service role to insert weather conflicts
-- ============================================
-- This allows edge functions and admin triggers to create conflicts
-- even when not authenticated as a regular user

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Admins can insert weather conflicts" ON weather_conflicts;

-- Recreate with service role support
CREATE POLICY "Admins and service role can insert weather conflicts"
  ON weather_conflicts FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    -- Allow service role (edge functions, admin operations)
    auth.role() = 'service_role'
    OR
    -- Allow admin users
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Also update the UPDATE and DELETE policies for consistency
DROP POLICY IF EXISTS "Admins can update weather conflicts" ON weather_conflicts;
DROP POLICY IF EXISTS "Admins can delete weather conflicts" ON weather_conflicts;

CREATE POLICY "Admins and service role can update weather conflicts"
  ON weather_conflicts FOR UPDATE
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins and service role can delete weather conflicts"
  ON weather_conflicts FOR DELETE
  TO authenticated, service_role
  USING (
    auth.role() = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- Fix reschedule_proposals policies too
-- ============================================

DROP POLICY IF EXISTS "Admins can insert reschedule proposals" ON reschedule_proposals;

CREATE POLICY "Admins and service role can insert reschedule proposals"
  ON reschedule_proposals FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    auth.role() = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- Fix notifications policies
-- ============================================

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;

CREATE POLICY "Service role and admins can insert notifications"
  ON notifications FOR INSERT
  TO authenticated, service_role
  WITH CHECK (
    auth.role() = 'service_role'
    OR
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

