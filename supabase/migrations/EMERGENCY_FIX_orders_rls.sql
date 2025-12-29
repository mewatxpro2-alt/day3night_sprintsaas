-- =====================================================
-- EMERGENCY FIX: Bypass RLS for Admin Orders
-- =====================================================
-- This is a TEMPORARY solution to get admin working NOW
-- Run this in Supabase SQL Editor
-- =====================================================

-- Check who you are
SELECT 
    auth.uid() as my_id,
    (SELECT email FROM profiles WHERE id = auth.uid()) as my_email,
    (SELECT role FROM profiles WHERE id = auth.uid()) as my_role;

-- Make sure you're admin
UPDATE profiles 
SET role = 'admin' 
WHERE email IN ('tadmin@gmail.com', 'fushamn@gmail.com');

-- Drop ALL existing RLS policies on orders
DROP POLICY IF EXISTS "Buyers can view own orders" ON orders;
DROP POLICY IF EXISTS "Sellers can view orders for their kits" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;

-- Create ONE simple admin policy that allows ALL operations
CREATE POLICY "Admin full access to orders"
    ON orders
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create policies for buyers and sellers
CREATE POLICY "Buyers view own orders"
    ON orders
    FOR SELECT
    TO authenticated
    USING (buyer_id = auth.uid());

CREATE POLICY "Sellers view own sales"
    ON orders
    FOR SELECT
    TO authenticated
    USING (seller_id = auth.uid());

-- Verify
SELECT COUNT(*) as total_orders FROM orders;

-- If you see a number > 0, refresh your admin panel!
