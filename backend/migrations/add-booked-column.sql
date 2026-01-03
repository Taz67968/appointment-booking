-- Migration: Add booked column to timeslot table
-- Run this if your database already exists and doesn't have the booked column

ALTER TABLE timeslot ADD COLUMN IF NOT EXISTS booked BOOLEAN DEFAULT FALSE;

