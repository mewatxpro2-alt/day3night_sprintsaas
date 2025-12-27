-- QUICK FIX: Allow public to view listing details
-- Run this in Supabase SQL Editor AFTER running 023_admin_kit_authority.sql

-- Drop any conflicting policies
DROP POLICY IF EXISTS "public_view_live_listings" ON listings;
DROP POLICY IF EXISTS "Public can view live listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view live listings" ON listings;

-- Allow public (anon + authenticated) to view live listings
CREATE POLICY "public_view_live_listings"
ON listings FOR SELECT
TO anon, authenticated
USING (
    moderation_status = 'live' 
    AND is_live = true 
    AND (deleted_at IS NULL OR deleted_at IS NOT NULL) -- Allow regardless of deleted_at for now
);

-- Verify
SELECT policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings' 
AND policyname LIKE '%public%';
