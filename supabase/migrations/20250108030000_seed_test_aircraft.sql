-- ============================================
-- SEED TEST AIRCRAFT
-- ============================================
-- Add test aircraft for development and testing

INSERT INTO aircraft (
  tail_number,
  make,
  model,
  year,
  category,
  is_active,
  hourly_rate,
  minimum_weather_requirements
) VALUES
  (
    'N12345',
    'Cessna',
    '172S',
    2018,
    'Single Engine Land',
    true,
    150.00,
    '{
      "ceiling_ft": 3000,
      "visibility_miles": 5,
      "wind_speed_knots": 20,
      "crosswind_knots": 15
    }'::jsonb
  ),
  (
    'N67890',
    'Piper',
    'PA-28-181',
    2020,
    'Single Engine Land',
    true,
    140.00,
    '{
      "ceiling_ft": 3000,
      "visibility_miles": 5,
      "wind_speed_knots": 20,
      "crosswind_knots": 15
    }'::jsonb
  ),
  (
    'N24680',
    'Cessna',
    '182T',
    2019,
    'Single Engine Land',
    true,
    180.00,
    '{
      "ceiling_ft": 2500,
      "visibility_miles": 3,
      "wind_speed_knots": 25,
      "crosswind_knots": 18
    }'::jsonb
  )
ON CONFLICT (tail_number) DO NOTHING;

-- Log seeding
DO $$
DECLARE
  aircraft_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO aircraft_count FROM aircraft WHERE is_active = true;
  RAISE NOTICE 'Total active aircraft: %', aircraft_count;
END $$;

