-- COMPREHENSIVE FIX: Listings visibility for Details page
-- Run ALL of these commands in Supabase SQL Editor

-- STEP 1: Check current status of listings
SELECT 
    id,
    title,
    is_live,
    moderation_status,
    deleted_at
FROM listings
ORDER BY created_at DESC
LIMIT 20;

-- STEP 2: Update ALL existing listings to have proper moderation_status
-- This ensures old listings work with the new system
UPDATE listings
SET moderation_status = 'live'
WHERE is_live = true 
AND (moderation_status IS NULL 
     OR moderation_status = ''
     OR moderation_status = 'approved'
     OR moderation_status = 'featured');

-- STEP 3: Drop ALL existing listing policies
DROP POLICY IF EXISTS "public_view_live_listings" ON listings;
DROP POLICY IF EXISTS "Public can view live listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view live listings" ON listings;
DROP POLICY IF EXISTS "sellers_view_own_listings" ON listings;
DROP POLICY IF EXISTS "admin_view_all_listings" ON listings;
DROP POLICY IF EXISTS "admin_update_listings" ON listings;
DROP POLICY IF EXISTS "Sellers can view own listings" ON listings;
DROP POLICY IF EXISTS "Admin can view listings" ON listings;
DROP POLICY IF EXISTS "Admin can update listings" ON listings;

-- STEP 4: Create fresh, simple policies

-- Policy 1: Public can view live listings (for Explore + Details pages)
CREATE POLICY "public_view_live_listings"
ON listings FOR SELECT
TO public  -- This means EVERYONE (anon + authenticated)
USING (
    is_live = true 
    AND moderation_status = 'live'
    AND (deleted_at IS NULL)
);

-- Policy 2: Users can view their own listings (any status)
CREATE POLICY "users_view_own_listings"
ON listings FOR SELECT
TO authenticated
USING (creator_id = auth.uid());

-- Policy 3: Admin can view all listings
CREATE POLICY "admin_view_all_listings"
ON listings FOR SELECT
TO authenticated
USING (auth.email() = 'tadmin@gmail.com');

-- Policy 4: Admin can update all listings
CREATE POLICY "admin_update_all_listings"
ON listings FOR UPDATE
TO authenticated
USING (auth.email() = 'tadmin@gmail.com')
WITH CHECK (auth.email() = 'tadmin@gmail.com');

-- Policy 5: Admin can insert listings (for approval flow)
CREATE POLICY "admin_insert_listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (auth.email() = 'tadmin@gmail.com' OR creator_id = auth.uid());

-- STEP 5: Verify the fix
SELECT 
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE moderation_status = 'live' AND is_live = true) as live_listings
FROM listings;

-- STEP 6: Check policies
SELECT policyname, roles::text, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;

-- Done! Now test by clicking on a kit
