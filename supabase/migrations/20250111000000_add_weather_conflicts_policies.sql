-- ============================================
-- Add INSERT/UPDATE/DELETE policies for weather_conflicts
-- ============================================

-- Allow admins to insert weather conflicts (for testing/admin triggers)
CREATE POLICY "Admins can insert weather conflicts"
  ON weather_conflicts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow system/admins to update weather conflicts
CREATE POLICY "Admins can update weather conflicts"
  ON weather_conflicts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow admins to delete weather conflicts
CREATE POLICY "Admins can delete weather conflicts"
  ON weather_conflicts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- ============================================
-- Add policies for reschedule_proposals
-- ============================================

-- Allow admins to insert proposals
CREATE POLICY "Admins can insert reschedule proposals"
  ON reschedule_proposals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

