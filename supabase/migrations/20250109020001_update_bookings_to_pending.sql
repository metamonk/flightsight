-- ============================================
-- Migration: Update existing bookings to pending status
-- Description: Update recent 'scheduled' bookings to 'pending' status
-- Author: AI Assistant
-- Date: 2025-01-09
-- Note: This migration must run AFTER 20250109020000_add_pending_booking_status.sql
-- ============================================

-- Update existing 'scheduled' bookings to 'pending' if they haven't been confirmed yet
-- This is a one-time migration to properly reflect the new status flow
UPDATE bookings
SET status = 'pending'
WHERE status = 'scheduled'
  AND created_at > NOW() - INTERVAL '7 days'; -- Only recent bookings to avoid disrupting historical data

