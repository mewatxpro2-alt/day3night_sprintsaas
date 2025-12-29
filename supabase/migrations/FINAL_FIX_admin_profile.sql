-- =====================================================
-- FINAL FIX: Admin Profile Missing
-- =====================================================
-- Problem: tadmin@gmail.com profile doesn't exist or RLS blocks it
-- This script fixes ALL admin access issues
-- =====================================================

-- STEP 1: Check if profiles RLS is blocking
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 2: Check what auth user ID is
SELECT auth.uid() as current_user_id;

-- STEP 3: Check if profile exists for this user
SELECT id, email, role FROM profiles WHERE id = auth.uid();

-- STEP 4: If profile doesn't exist, create it
INSERT INTO profiles (id, email, role, full_name, created_at, updated_at)
SELECT 
    auth.uid(),
    'tadmin@gmail.com',
    'admin',
    'Admin User',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
);

-- STEP 5: If profile exists but role isn't admin, update it
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- STEP 6: Also ensure email match works
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

-- STEP 7: Fix profiles RLS to allow users to see their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid());

-- STEP 8: Admin can see all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role = 'admin'
        )
        OR id = auth.uid()
    );

-- STEP 9: Fix is_admin() function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN user_role = 'admin';
END;
$$;

-- STEP 10: Verify everything
SELECT 'VERIFICATION' as step;
SELECT auth.uid() as my_id;
SELECT id, email, role FROM profiles WHERE id = auth.uid();
SELECT is_admin() as am_i_admin;
SELECT COUNT(*) as total_orders FROM orders;

-- If is_admin = true and total_orders > 0, refresh admin panel!
