-- ============================================
-- ENABLE EXTENSIONS
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================
-- TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE training_level AS ENUM ('student_pilot', 'private_pilot', 'instrument_rated', 'commercial_pilot');
CREATE TYPE booking_status AS ENUM ('scheduled', 'completed', 'cancelled', 'weather_hold', 'rescheduling');
CREATE TYPE flight_type AS ENUM ('local', 'short_xc', 'long_xc');
CREATE TYPE weather_conflict_status AS ENUM ('detected', 'ai_processing', 'proposals_ready', 'resolved', 'manual_override');
CREATE TYPE notification_type AS ENUM ('booking_created', 'booking_updated', 'booking_cancelled', 'weather_conflict', 'reschedule_proposal', 'reschedule_accepted');
CREATE TYPE notification_channel AS ENUM ('email', 'in_app', 'sms');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  training_level training_level,
  phone VARCHAR(20),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "in_app": true,
      "sms": false
    },
    "weather_alerts": true,
    "auto_reschedule": false
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
-- NOTE: No column references to avoid infinite recursion!
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);  -- Allow authenticated users to view all user profiles (no column refs!)

CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================
-- AIRCRAFT
-- ============================================

CREATE TABLE aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tail_number VARCHAR(10) UNIQUE NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT,
  category VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10,2),
  minimum_weather_requirements JSONB DEFAULT '{
    "ceiling_ft": 3000,
    "visibility_miles": 5,
    "wind_speed_knots": 20,
    "crosswind_knots": 15
  }'::jsonb,
  maintenance_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active aircraft"
  ON aircraft FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage aircraft"
  ON aircraft FOR ALL
  USING (
    -- Check role from JWT claim to avoid recursion
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE INDEX idx_aircraft_tail_number ON aircraft(tail_number);
CREATE INDEX idx_aircraft_active ON aircraft(is_active);

-- ============================================
-- AVAILABILITY
-- ============================================

CREATE TABLE availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own availability"
  ON availability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own availability"
  ON availability FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Students can view instructor availability"
  ON availability FOR SELECT
  USING (
    -- Allow viewing availability for instructor users
    -- Note: We can't check the user's role without recursion,
    -- so we allow viewing all availability. This is acceptable as
    -- availability is public information for scheduling purposes.
    true
  );

CREATE INDEX idx_availability_user ON availability(user_id);
CREATE INDEX idx_availability_day ON availability(day_of_week);

-- ============================================
-- BOOKINGS (WITH MULTI-LOCATION SUPPORT)
-- ============================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id),
  instructor_id UUID NOT NULL REFERENCES public.users(id),
  aircraft_id UUID NOT NULL REFERENCES aircraft(id),
  
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  
  status booking_status NOT NULL DEFAULT 'scheduled',
  
  -- Multi-location support
  departure_airport VARCHAR(4) NOT NULL DEFAULT 'KAUS',
  destination_airport VARCHAR(4),
  route_waypoints JSONB,
  flight_distance_nm DECIMAL(6,2) DEFAULT 0,
  flight_type flight_type DEFAULT 'local',
  
  lesson_type VARCHAR(100),
  lesson_notes TEXT,
  
  -- Weather tracking
  weather_snapshot JSONB,
  last_weather_check TIMESTAMPTZ,
  
  -- Cancellation info
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.users(id),
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_booking_time CHECK (scheduled_end > scheduled_start),
  CONSTRAINT student_not_instructor CHECK (student_id != instructor_id)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    auth.uid() = student_id OR 
    auth.uid() = instructor_id OR
    -- Check role from JWT claim to avoid recursion
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    -- Check role from JWT claim to avoid recursion
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'student'
  );

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (
    auth.uid() = student_id OR 
    auth.uid() = instructor_id
  );

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_instructor ON bookings(instructor_id);
CREATE INDEX idx_bookings_aircraft ON bookings(aircraft_id);
CREATE INDEX idx_bookings_start_time ON bookings(scheduled_start);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_departure ON bookings(departure_airport);
CREATE INDEX idx_bookings_flight_type ON bookings(flight_type);

-- ============================================
-- TRIGGER: Auto-calculate flight type
-- ============================================

CREATE OR REPLACE FUNCTION calculate_flight_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.destination_airport IS NULL THEN
    NEW.flight_type := 'local';
    NEW.flight_distance_nm := 0;
  ELSIF NEW.flight_distance_nm < 50 THEN
    NEW.flight_type := 'local';
  ELSIF NEW.flight_distance_nm < 150 THEN
    NEW.flight_type := 'short_xc';
  ELSE
    NEW.flight_type := 'long_xc';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_flight_type
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_flight_type();

-- ============================================
-- WEATHER CONFLICTS
-- ============================================

CREATE TABLE weather_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status weather_conflict_status NOT NULL DEFAULT 'detected',
  
  weather_data JSONB NOT NULL,
  conflict_reasons JSONB NOT NULL,
  
  ai_processing_started_at TIMESTAMPTZ,
  ai_processing_completed_at TIMESTAMPTZ,
  ai_processing_duration_ms INT,
  
  resolved_at TIMESTAMPTZ,
  resolution_method VARCHAR(50),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE weather_conflicts ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_conflicts;

CREATE POLICY "Users can view conflicts for their bookings"
  ON weather_conflicts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.id = weather_conflicts.booking_id 
      AND (bookings.student_id = auth.uid() OR bookings.instructor_id = auth.uid())
    )
  );

CREATE INDEX idx_conflicts_booking ON weather_conflicts(booking_id);
CREATE INDEX idx_conflicts_status ON weather_conflicts(status);
CREATE INDEX idx_conflicts_detected ON weather_conflicts(detected_at);

-- ============================================
-- RESCHEDULE PROPOSALS
-- ============================================

CREATE TABLE reschedule_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conflict_id UUID NOT NULL REFERENCES weather_conflicts(id) ON DELETE CASCADE,
  
  proposed_start TIMESTAMPTZ NOT NULL,
  proposed_end TIMESTAMPTZ NOT NULL,
  proposed_instructor_id UUID REFERENCES public.users(id),
  proposed_aircraft_id UUID REFERENCES aircraft(id),
  
  score DECIMAL(5,2),
  reasoning TEXT,
  
  student_response VARCHAR(20),
  instructor_response VARCHAR(20),
  
  student_responded_at TIMESTAMPTZ,
  instructor_responded_at TIMESTAMPTZ,
  
  accepted_at TIMESTAMPTZ,
  new_booking_id UUID REFERENCES bookings(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE reschedule_proposals ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE reschedule_proposals;

CREATE POLICY "Users can view proposals for their bookings"
  ON reschedule_proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM weather_conflicts wc
      JOIN bookings b ON wc.booking_id = b.id
      WHERE wc.id = reschedule_proposals.conflict_id
      AND (b.student_id = auth.uid() OR b.instructor_id = auth.uid())
    )
  );

CREATE POLICY "Users can update responses for their proposals"
  ON reschedule_proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM weather_conflicts wc
      JOIN bookings b ON wc.booking_id = b.id
      WHERE wc.id = reschedule_proposals.conflict_id
      AND (b.student_id = auth.uid() OR b.instructor_id = auth.uid())
    )
  );

CREATE INDEX idx_proposals_conflict ON reschedule_proposals(conflict_id);
CREATE INDEX idx_proposals_score ON reschedule_proposals(score DESC);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  type notification_type NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'in_app',
  status notification_status NOT NULL DEFAULT 'pending',
  
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  metadata JSONB,
  
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- WEATHER CACHE
-- ============================================

CREATE TABLE weather_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_code VARCHAR(4) NOT NULL,
  forecast_time TIMESTAMPTZ NOT NULL,
  
  weather_data JSONB NOT NULL,
  
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  UNIQUE(airport_code, forecast_time)
);

CREATE INDEX idx_weather_cache_airport_time ON weather_cache(airport_code, forecast_time);
CREATE INDEX idx_weather_cache_expires ON weather_cache(expires_at);

-- ============================================
-- ANALYTICS EVENTS
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES public.users(id),
  
  event_data JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_updated_at BEFORE UPDATE ON aircraft
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weather_conflicts_updated_at BEFORE UPDATE ON weather_conflicts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reschedule_proposals_updated_at BEFORE UPDATE ON reschedule_proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION check_user_availability(
  p_user_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INT;
  v_start_time TIME;
  v_end_time TIME;
  v_has_availability BOOLEAN;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_start_time);
  v_start_time := p_start_time::TIME;
  v_end_time := p_end_time::TIME;
  
  SELECT EXISTS (
    SELECT 1
    FROM availability
    WHERE user_id = p_user_id
    AND day_of_week = v_day_of_week
    AND start_time <= v_start_time
    AND end_time >= v_end_time
    AND (valid_from IS NULL OR valid_from <= p_start_time::DATE)
    AND (valid_until IS NULL OR valid_until >= p_end_time::DATE)
  ) INTO v_has_availability;
  
  RETURN v_has_availability;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION find_available_instructors(
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
  instructor_id UUID,
  instructor_name VARCHAR(255)
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT u.id, u.full_name
  FROM public.users u
  WHERE u.role = 'instructor'
  AND check_user_availability(u.id, p_start_time, p_end_time)
  AND NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.instructor_id = u.id
    AND b.status IN ('scheduled', 'weather_hold')
    AND (
      (b.scheduled_start, b.scheduled_end) OVERLAPS (p_start_time, p_end_time)
    )
  );
END;
$$ LANGUAGE plpgsql;

