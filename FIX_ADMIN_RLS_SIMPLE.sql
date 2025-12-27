-- =====================================================
-- FINAL FIX: Use auth.email() directly (no profile lookup)
-- This is the most reliable method
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admins can update all submissions" ON submissions;
DROP POLICY IF EXISTS "Users can view own submissions" ON submissions;

-- Create simple admin policy using auth.email()
CREATE POLICY "Admins can view all submissions"
ON submissions FOR SELECT
USING (
    auth.email() = 'tadmin@gmail.com'
);

-- Users can still see their own submissions
CREATE POLICY "Users can view own submissions"
ON submissions FOR SELECT
USING (
    user_id = auth.uid()
);

-- Admins can update all submissions
CREATE POLICY "Admins can update all submissions"
ON submissions FOR UPDATE
USING (
    auth.email() = 'tadmin@gmail.com'
);

-- Verify
SELECT 'Policies created:' as message;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'submissions';

SELECT 'Total submissions:' as message;
SELECT COUNT(*) FROM submissions;
