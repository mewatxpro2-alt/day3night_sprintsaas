-- =====================================================
-- CRITICAL FIX: Admin Access to Orders
-- =====================================================
-- Problem: is_admin() function checks hardcoded email
-- Solution: Check profiles.role = 'admin' instead
-- =====================================================

-- Step 1: Make sure your email is set as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('fushamn@gmail.com', 'tadmin@gmail.com');

-- Step 2: Fix the is_admin() function to use role-based check
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- Step 3: Verify it works
SELECT 
    auth.uid() as current_user_id,
    (SELECT email FROM profiles WHERE id = auth.uid()) as current_email,
    (SELECT role FROM profiles WHERE id = auth.uid()) as current_role,
    is_admin() as is_admin_result;

-- Step 4: Test orders query
SELECT COUNT(*) as total_orders FROM orders;
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- After running this, refresh your admin panel!
