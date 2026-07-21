-- Migration: Ensure booked column exists and set default values
-- Run this to fix existing timeslots that have NULL booked values

-- Add column if it doesn't exist
ALTER TABLE timeslot ADD COLUMN IF NOT EXISTS booked BOOLEAN DEFAULT FALSE;

-- Update any NULL values to FALSE
UPDATE timeslot SET booked = FALSE WHERE booked IS NULL;

