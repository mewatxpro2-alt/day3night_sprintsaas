-- =====================================================
-- COMPLETE DIAGNOSTIC + FIX FOR ADMIN ORDERS
-- Run this ENTIRE script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Check current state
SELECT 'CURRENT USER INFO' as section;
SELECT 
    auth.uid() as logged_in_user_id,
    (SELECT email FROM profiles WHERE id = auth.uid()) as logged_in_email,
    (SELECT role FROM profiles WHERE id = auth.uid()) as current_role;

-- STEP 2: Check all admin users
SELECT 'ALL ADMIN USERS' as section;
SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';

-- STEP 3: Check if orders exist
SELECT 'ORDERS IN DATABASE' as section;
SELECT COUNT(*) as total_orders FROM orders;
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- STEP 4: Check is_admin() function
SELECT 'IS_ADMIN FUNCTION TEST' as section;
SELECT is_admin() as am_i_admin;

-- STEP 5: Check RLS policies on orders table
SELECT 'RLS POLICIES ON ORDERS' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY policyname;

-- =====================================================
-- FIX: Make BOTH emails admin
-- =====================================================

UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

-- =====================================================
-- FIX: Update is_admin() to use role column
-- =====================================================

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

-- =====================================================
-- VERIFICATION: Test again
-- =====================================================

SELECT 'VERIFICATION - IS ADMIN NOW?' as section;
SELECT is_admin() as am_i_admin_now;

SELECT 'VERIFICATION - CAN I SEE ORDERS?' as section;
SELECT id, order_number, buyer_id, seller_id, status, price_amount 
FROM orders 
LIMIT 5;

-- If you see orders above, you're fixed! Refresh admin panel.
