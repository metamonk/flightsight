-- ============================================
-- Migration: Add 'pending' status to booking_status enum
-- Description: Add 'pending' status for bookings awaiting instructor confirmation
-- Author: AI Assistant
-- Date: 2025-01-09
-- ============================================

-- Add 'pending' to the booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending';

-- Add comment to clarify the status flow
COMMENT ON TYPE booking_status IS 'Booking lifecycle: pending (awaiting instructor confirmation) → confirmed (instructor accepted) → weather_hold (weather issue detected) → rescheduling (change requested) → cancelled (terminated)';
