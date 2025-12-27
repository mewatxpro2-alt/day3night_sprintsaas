-- Quick Fix: Check and update listing statuses
-- Run this in Supabase SQL Editor

-- 1. Check current listings and their statuses
SELECT 
    id,
    title,
    is_live,
    moderation_status,
    deleted_at,
    created_at
FROM listings
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if moderation_status column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'moderation_status';

-- 3. Check if deleted_at column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings' 
AND column_name = 'deleted_at';

-- 4. FIX: Update all live listings to have moderation_status='live'
-- This ensures they show up on the Explore page
UPDATE listings
SET moderation_status = 'live'
WHERE is_live = true 
AND (moderation_status IS NULL OR moderation_status != 'live');

-- 5. Verify the update
SELECT 
    COUNT(*) as total_listings,
    COUNT(*) FILTER (WHERE moderation_status = 'live') as live_listings,
    COUNT(*) FILTER (WHERE is_live = true) as is_live_true
FROM listings;

-- 6. Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;
