-- Migration: Fix clientId column name to clientid (lowercase)
-- PostgreSQL converts unquoted identifiers to lowercase
-- Run this if your database has the column as "clientId" (quoted)

-- First, check if column exists with different case
DO $$
BEGIN
    -- If column exists as "clientId" (quoted/camelCase), rename it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'appointment' 
        AND column_name = 'clientId'
    ) THEN
        ALTER TABLE appointment RENAME COLUMN "clientId" TO clientid;
    END IF;
END $$;

