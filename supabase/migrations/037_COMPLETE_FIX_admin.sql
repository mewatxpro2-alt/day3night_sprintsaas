-- =====================================================
-- COMPLETE FIX: Fix ALL cascading issues
-- =====================================================
-- This script fixes:
-- 1. The broken sync_user_to_email_audience trigger
-- 2. Creates missing admin profiles
-- 3. Sets up correct RLS policies
-- Run this ENTIRE script in one go
-- =====================================================

-- STEP 1: FIX THE BROKEN TRIGGER
-- Remove reference to non-existent signup_source column
CREATE OR REPLACE FUNCTION sync_user_to_email_audience()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_type TEXT;
    v_source TEXT;
BEGIN
    -- Determine user type based on profile
    v_user_type := 'buyer'; -- Default
    v_source := 'buyer_signup'; -- Default (removed broken NEW.signup_source reference)
    
    -- Check if user has submitted kits (seller)
    IF EXISTS (
        SELECT 1 FROM submissions WHERE user_id = NEW.id LIMIT 1
    ) THEN
        v_user_type := 'seller';
        v_source := 'seller_signup';
    END IF;
    
    -- Upsert to email_audience
    PERFORM upsert_email_record(
        p_email := NEW.email,
        p_source := v_source,
        p_user_type := v_user_type,
        p_consent_flag := true,
        p_linked_user_id := NEW.id,
        p_metadata := jsonb_build_object(
            'full_name', COALESCE(NEW.full_name, ''),
            'avatar_url', NEW.avatar_url,
            'is_verified_seller', COALESCE(NEW.is_verified_seller, false)
        )
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Don't block profile creation if email sync fails
    RAISE WARNING 'Email audience sync failed: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- STEP 2: CREATE MISSING PROFILES FROM AUTH.USERS
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

-- STEP 3: ENSURE ADMIN ROLE FOR KNOWN ADMINS
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

-- STEP 4: FIX IS_ADMIN FUNCTION
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$;

-- STEP 5: CLEAN UP ORDERS RLS POLICIES
DROP POLICY IF EXISTS "Admin full access to orders" ON orders;
DROP POLICY IF EXISTS "Buyers view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers view own sales" ON orders;
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view orders for their kits" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

-- Admin can do everything
CREATE POLICY "Admin full access to orders"
    ON orders FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Buyers can view their orders
CREATE POLICY "Buyers view own orders"
    ON orders FOR SELECT TO authenticated
    USING (buyer_id = auth.uid());

-- Sellers can view orders for their kits
CREATE POLICY "Sellers view own sales"
    ON orders FOR SELECT TO authenticated
    USING (seller_id = auth.uid());

-- STEP 6: VERIFICATION
SELECT '=== ADMIN PROFILES ===' as section;
SELECT id, email, role FROM profiles WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

SELECT '=== TOTAL ORDERS ===' as section;
SELECT COUNT(*) as total_orders FROM orders;

SELECT '=== ORDERS BY STATUS ===' as section;
SELECT status, COUNT(*) as count FROM orders GROUP BY status ORDER BY count DESC;

-- If you see admin profiles and orders > 0, refresh your browser!
