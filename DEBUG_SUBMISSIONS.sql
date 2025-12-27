-- =====================================================
-- DEBUG: Admin Submissions Issue
-- Run this in Supabase SQL Editor to diagnose
-- =====================================================

-- 1. CHECK: Does any submission exist in the table?
SELECT 'Total Submissions' as check_name, COUNT(*) as result FROM submissions;

-- 2. CHECK: Show all submissions (bypassing RLS)
SELECT id, project_name, status, user_id, created_at 
FROM submissions 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. CHECK: What is the admin user's role?
SELECT id, email, role, full_name 
FROM profiles 
WHERE email = 'tadmin@gmail.com';

-- 4. CHECK: List all RLS policies on submissions table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename = 'submissions';

-- 5. CHECK: Is the is_admin() function working?
-- First check if it exists:
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'is_admin';

-- =====================================================
-- FIXES: Run these if issues are found
-- =====================================================

-- FIX 1: Ensure is_admin function exists and works
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FIX 2: Drop and recreate admin policies for submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON submissions;

CREATE POLICY "Admins can view all submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all submissions"
  ON submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- FIX 3: Make sure the admin user has the correct role
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'tadmin@gmail.com';

-- =====================================================
-- VERIFY: After running fixes, check again
-- =====================================================
SELECT 'After fixes - RLS policies on submissions:' as message;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'submissions';

SELECT 'Admin user role:' as message;
SELECT id, email, role FROM profiles WHERE email = 'tadmin@gmail.com';
