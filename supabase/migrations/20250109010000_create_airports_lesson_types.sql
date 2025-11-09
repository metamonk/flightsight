-- ============================================
-- AIRPORTS AND LESSON TYPES MANAGEMENT
-- ============================================
-- This migration creates admin-managed lookup tables for:
-- 1. Airports (departure/destination)
-- 2. Lesson Types (training categories)

-- ============================================
-- AIRPORTS TABLE
-- ============================================
CREATE TABLE airports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- e.g., "KJFK", "KLAX"
  name VARCHAR(255) NOT NULL, -- e.g., "John F. Kennedy International Airport"
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'USA',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;

-- Anyone can view active airports
CREATE POLICY "Anyone can view active airports"
  ON airports FOR SELECT
  USING (is_active = TRUE);

-- Only admins can manage airports
CREATE POLICY "Admins can manage airports"
  ON airports FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE INDEX idx_airports_code ON airports(code);
CREATE INDEX idx_airports_active ON airports(is_active);
CREATE INDEX idx_airports_city ON airports(city);

-- ============================================
-- LESSON TYPES TABLE
-- ============================================
CREATE TABLE lesson_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- e.g., "Private Pilot Training", "Instrument Training"
  description TEXT,
  category VARCHAR(50), -- e.g., "primary", "advanced", "specialized"
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lesson_types ENABLE ROW LEVEL SECURITY;

-- Anyone can view active lesson types
CREATE POLICY "Anyone can view active lesson types"
  ON lesson_types FOR SELECT
  USING (is_active = TRUE);

-- Only admins can manage lesson types
CREATE POLICY "Admins can manage lesson types"
  ON lesson_types FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

CREATE INDEX idx_lesson_types_name ON lesson_types(name);
CREATE INDEX idx_lesson_types_active ON lesson_types(is_active);
CREATE INDEX idx_lesson_types_category ON lesson_types(category);

-- ============================================
-- SEED DATA - COMMON US AIRPORTS
-- ============================================
INSERT INTO airports (code, name, city, state) VALUES
  -- Major Training Airports
  ('KVNY', 'Van Nuys Airport', 'Los Angeles', 'California'),
  ('KSMO', 'Santa Monica Airport', 'Santa Monica', 'California'),
  ('KWHP', 'Whiteman Airport', 'Los Angeles', 'California'),
  ('KBUR', 'Bob Hope Airport', 'Burbank', 'California'),
  ('KLGB', 'Long Beach Airport', 'Long Beach', 'California'),
  
  -- Other Major Airports
  ('KLAX', 'Los Angeles International Airport', 'Los Angeles', 'California'),
  ('KSFO', 'San Francisco International Airport', 'San Francisco', 'California'),
  ('KSNA', 'John Wayne Airport', 'Santa Ana', 'California'),
  ('KSAN', 'San Diego International Airport', 'San Diego', 'California'),
  ('KLAS', 'Harry Reid International Airport', 'Las Vegas', 'Nevada'),
  ('KPHX', 'Phoenix Sky Harbor International Airport', 'Phoenix', 'Arizona'),
  ('KDEN', 'Denver International Airport', 'Denver', 'Colorado'),
  ('KDFW', 'Dallas/Fort Worth International Airport', 'Dallas', 'Texas'),
  ('KIAH', 'George Bush Intercontinental Airport', 'Houston', 'Texas'),
  ('KORD', 'O''Hare International Airport', 'Chicago', 'Illinois'),
  ('KATL', 'Hartsfield-Jackson Atlanta International Airport', 'Atlanta', 'Georgia'),
  ('KJFK', 'John F. Kennedy International Airport', 'New York', 'New York'),
  ('KEWR', 'Newark Liberty International Airport', 'Newark', 'New Jersey'),
  ('KBOS', 'Logan International Airport', 'Boston', 'Massachusetts'),
  ('KMIA', 'Miami International Airport', 'Miami', 'Florida');

-- ============================================
-- SEED DATA - COMMON LESSON TYPES
-- ============================================
INSERT INTO lesson_types (name, description, category) VALUES
  -- Primary Training
  ('Private Pilot Training', 'Initial flight training for Private Pilot Certificate', 'primary'),
  ('Discovery Flight', 'Introductory flight lesson for prospective students', 'primary'),
  ('Ground School', 'Classroom instruction for aviation knowledge', 'primary'),
  
  -- Advanced Training
  ('Instrument Rating', 'Training for Instrument Rating certification', 'advanced'),
  ('Commercial Pilot Training', 'Training for Commercial Pilot Certificate', 'advanced'),
  ('Multi-Engine Rating', 'Training for Multi-Engine aircraft rating', 'advanced'),
  
  -- Specialized Training
  ('Flight Review (BFR)', 'Biennial Flight Review for currency', 'specialized'),
  ('Instrument Proficiency Check (IPC)', 'Instrument rating proficiency check', 'specialized'),
  ('Checkout Flight', 'Aircraft-specific checkout for new pilots', 'specialized'),
  ('Stage Check', 'Progress evaluation during training', 'specialized'),
  
  -- Advanced Certifications
  ('Certified Flight Instructor (CFI)', 'Training to become a flight instructor', 'advanced'),
  ('Certified Flight Instructor - Instrument (CFII)', 'Training to become an instrument instructor', 'advanced'),
  ('Multi-Engine Instructor (MEI)', 'Training to instruct in multi-engine aircraft', 'advanced'),
  
  -- Specialty
  ('Tailwheel Endorsement', 'Training for tailwheel aircraft endorsement', 'specialized'),
  ('High Performance Endorsement', 'Training for high-performance aircraft', 'specialized'),
  ('Complex Aircraft Endorsement', 'Training for complex aircraft', 'specialized');

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON airports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_types_updated_at BEFORE UPDATE ON lesson_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE airports IS 'Admin-managed list of approved airports for booking departure/destination';
COMMENT ON TABLE lesson_types IS 'Admin-managed list of approved lesson types for booking categorization';
COMMENT ON COLUMN airports.code IS 'ICAO or local airport identifier code (e.g., KJFK, KVNY)';
COMMENT ON COLUMN lesson_types.category IS 'Training category: primary, advanced, or specialized';

