-- =====================================================
-- DEFINITIVE FIX: Admin Profile Link
-- =====================================================
-- Problem: tadmin@gmail.com exists in auth.users but NOT in profiles
-- Solution: Query auth.users to get UUID, then create profile
-- =====================================================

-- STEP 1: Check all users in auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- STEP 2: Check which profiles exist
SELECT id, email, role FROM profiles ORDER BY created_at DESC;

-- STEP 3: Find users WITHOUT profiles (the problem users)
SELECT au.id as auth_user_id, au.email as auth_email
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- STEP 4: Create missing profiles for ALL users without one
INSERT INTO profiles (id, email, role, full_name, created_at)
SELECT 
    au.id,
    au.email,
    CASE WHEN au.email IN ('tadmin@gmail.com', 'fushamn@gmail.com') THEN 'admin' ELSE 'user' END,
    COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
    au.created_at
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- STEP 5: Ensure admin role is set for known admin emails
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

-- STEP 6: Fix is_admin function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN v_role = 'admin';
END;
$$;

-- STEP 7: Fix orders RLS policies
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Buyers view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers view own sales" ON orders;
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view orders for their kits" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admin full access to orders"
    ON orders FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Buyers view own orders"
    ON orders FOR SELECT TO authenticated
    USING (buyer_id = auth.uid());

CREATE POLICY "Sellers view own sales"
    ON orders FOR SELECT TO authenticated
    USING (seller_id = auth.uid());

-- STEP 8: Verify all is fixed
SELECT '=== VERIFICATION ===' as section;
SELECT id, email, role FROM profiles WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');
SELECT COUNT(*) as total_orders FROM orders;

-- If you see admin role and orders > 0, refresh your browser!
