-- FIX APPROVE/REJECT: Ensure admin can UPDATE submissions
-- Run this in Supabase SQL Editor

-- Step 1: Check current policies on submissions
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'submissions';

-- Step 2: Drop ALL existing submissions policies to start fresh
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;
DROP POLICY IF EXISTS "Users can create submissions" ON submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON submissions;
DROP POLICY IF EXISTS "Admin can view submissions" ON submissions;
DROP POLICY IF EXISTS "Admin can update submissions" ON submissions;
DROP POLICY IF EXISTS "admins_select_submissions" ON submissions;
DROP POLICY IF EXISTS "admins_update_submissions" ON submissions;

-- Step 3: Ensure RLS is enabled
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Step 4: Create fresh policies for admin (SELECT + UPDATE)

-- Admin SELECT policy (uses email check to match frontend)
CREATE POLICY "admin_select_all_submissions"
ON submissions FOR SELECT
USING (auth.email() = 'tadmin@gmail.com');

-- Admin UPDATE policy (THE KEY ONE - allows approve/reject)
CREATE POLICY "admin_update_all_submissions"
ON submissions FOR UPDATE
USING (auth.email() = 'tadmin@gmail.com')
WITH CHECK (auth.email() = 'tadmin@gmail.com');

-- Step 5: Create policies for regular users

-- Users can view their own submissions
CREATE POLICY "users_view_own_submissions"
ON submissions FOR SELECT
USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "users_create_submissions"
ON submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions (before review)
CREATE POLICY "users_update_own_pending_submissions"
ON submissions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Step 6: Also ensure admin can INSERT listings (needed for approve)
DROP POLICY IF EXISTS "Admin can insert listings" ON listings;
DROP POLICY IF EXISTS "admin_insert_listings" ON listings;

CREATE POLICY "admin_insert_listings"
ON listings FOR INSERT
WITH CHECK (auth.email() = 'tadmin@gmail.com' OR auth.uid() = creator_id);

-- Step 7: Ensure admin can INSERT categories (needed for new categories)
DROP POLICY IF EXISTS "Admin can insert categories" ON categories;
DROP POLICY IF EXISTS "admin_insert_categories" ON categories;

CREATE POLICY "admin_insert_categories"
ON categories FOR INSERT
WITH CHECK (auth.email() = 'tadmin@gmail.com');

-- Step 8: Ensure admin can UPDATE profiles (for is_seller flag)
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON profiles;

CREATE POLICY "admin_update_profiles"
ON profiles FOR UPDATE
USING (auth.email() = 'tadmin@gmail.com' OR auth.uid() = id)
WITH CHECK (auth.email() = 'tadmin@gmail.com' OR auth.uid() = id);

-- Step 9: Verify policies are created
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'submissions'
ORDER BY policyname;

-- DONE! After running this, the approve/reject buttons should work.
