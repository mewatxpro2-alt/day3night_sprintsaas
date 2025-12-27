-- =====================================================
-- COMPREHENSIVE FIX: Admin Access
-- This fixes BOTH issues:
-- 1. Ensure tadmin@gmail.com has role='admin'
-- 2. Ensure khnnabubakr786@gmail.com has role='user'
-- 3. Create proper RLS policies
-- =====================================================

-- STEP 1: Fix user roles
-- Make sure tadmin@gmail.com is the only admin
UPDATE profiles SET role = 'admin' WHERE email = 'tadmin@gmail.com';

-- Make sure khnnabubakr786@gmail.com is a normal user
UPDATE profiles SET role = 'user' WHERE email = 'khnnabubakr786@gmail.com';

-- Reset any other users to 'user' role (safety)
UPDATE profiles SET role = 'user' WHERE email NOT IN ('tadmin@gmail.com') AND role = 'admin';

-- STEP 2: Verify roles are correct
SELECT 'User Roles After Fix:' as message;
SELECT id, email, role, full_name FROM profiles 
WHERE email IN ('tadmin@gmail.com', 'khnnabubakr786@gmail.com');

-- STEP 3: Drop all existing admin policies on submissions
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON submissions;
DROP POLICY IF EXISTS "Admin view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admin update submissions" ON submissions;

-- STEP 4: Create admin policies with direct email check (matching frontend logic)
CREATE POLICY "Admins can view all submissions"
ON submissions FOR SELECT
USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'tadmin@gmail.com'
    OR user_id = auth.uid()  -- Users can also see their own submissions
);

CREATE POLICY "Admins can update all submissions"
ON submissions FOR UPDATE
USING (
    (SELECT email FROM profiles WHERE id = auth.uid()) = 'tadmin@gmail.com'
);

-- STEP 5: Verify policies
SELECT 'Policies on submissions:' as message;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'submissions';

-- STEP 6: Count submissions to verify
SELECT 'Total submissions in database:' as message;
SELECT COUNT(*) as count FROM submissions;

-- =====================================================
-- DONE! After running this:
-- 1. Sign out from the app completely
-- 2. Sign in as tadmin@gmail.com
-- 3. Go to /admin/submissions
-- 4. You should now see all submissions
-- =====================================================
