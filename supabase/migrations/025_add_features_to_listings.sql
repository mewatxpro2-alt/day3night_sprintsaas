-- Add missing 'features' column to listings table
-- This was present in submissions but missing from listings

ALTER TABLE listings ADD COLUMN IF NOT EXISTS features TEXT;

COMMENT ON COLUMN listings.features IS 'Key features of the MVP kit (from Submit form)';
