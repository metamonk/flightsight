-- ============================================
-- Migration: Add default values to reschedule_proposals
-- Description: Set default 'pending' values for student/instructor response fields
-- Author: AI Assistant
-- Date: 2025-01-09
-- ============================================

-- Add default values to response fields
-- This ensures queries filtering for 'pending' responses work correctly
ALTER TABLE reschedule_proposals 
  ALTER COLUMN student_response SET DEFAULT 'pending',
  ALTER COLUMN instructor_response SET DEFAULT 'pending';

-- Add helpful comment
COMMENT ON COLUMN reschedule_proposals.student_response IS 'Student response: pending (default), accepted, rejected';
COMMENT ON COLUMN reschedule_proposals.instructor_response IS 'Instructor response: pending (default), accepted, rejected';

-- Update existing NULL values to 'pending' for consistency
UPDATE reschedule_proposals 
SET student_response = 'pending' 
WHERE student_response IS NULL;

UPDATE reschedule_proposals 
SET instructor_response = 'pending' 
WHERE instructor_response IS NULL;

