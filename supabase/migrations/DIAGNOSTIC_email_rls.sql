-- DIAGNOSTIC: Check if your user has admin role
-- Run this first to see what's wrong

-- 1. Check your current user ID
SELECT auth.uid() as my_user_id;

-- 2. Check if you exist in profiles and your role
SELECT id, email, role, full_name 
FROM profiles 
WHERE id = auth.uid();

-- 3. Check what emails exist (this bypasses RLS temporarily using a function)
SELECT COUNT(*) as total_emails FROM email_audience;

-- 4. Try to select emails directly (this will fail if RLS is blocking)
SELECT * FROM email_audience LIMIT 5;
