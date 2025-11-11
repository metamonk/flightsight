-- ============================================
-- Add admin UPDATE policy for bookings table
-- ============================================

-- Allow admins to update any booking (needed for AdminWeatherTrigger)
CREATE POLICY "Admins can update any booking"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

