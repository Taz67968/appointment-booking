-- Migration: Add profile images and products table
-- Run this as postgres superuser: psql -U postgres -d appointment_booking -f add-images-tables.sql

-- Add profile_image column to client table
ALTER TABLE client ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Add profile_image column to serviceProvider table
ALTER TABLE serviceProvider ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES serviceProvider(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_provider_id ON products(provider_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to tables
COMMENT ON TABLE products IS 'Products/services offered by providers';
COMMENT ON COLUMN products.provider_id IS 'The service provider who owns this product';
COMMENT ON COLUMN products.name IS 'Name of the product or service';
COMMENT ON COLUMN products.description IS 'Detailed description of the product/service';
COMMENT ON COLUMN products.price IS 'Price of the product/service';
COMMENT ON COLUMN products.image_url IS 'URL to the product image';

-- Add currency column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';

-- Add comment to currency column
COMMENT ON COLUMN products.currency IS 'Currency code for the price (e.g., USD, EUR, GBP)';

