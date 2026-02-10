-- Migration: Add currency column to products table
-- Date: 2026-02-10

ALTER TABLE products
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
