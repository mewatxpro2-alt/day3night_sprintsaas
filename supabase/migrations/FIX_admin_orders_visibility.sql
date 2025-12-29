-- QUICK FIX: Admin Orders Page RLS Issue
-- Run this in Supabase SQL Editor

-- Step 1: Check if your user is admin
SELECT id, email, role FROM profiles WHERE email = 'fushamn@gmail.com';

-- Step 2: Set yourself as admin if needed
UPDATE profiles SET role = 'admin' WHERE email = 'fushamn@gmail.com';

-- Step 3: Check existing RLS policies on orders
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'orders';

-- Step 4: Grant admin full access to orders
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders"
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

-- Step 5: Verify orders exist
SELECT COUNT(*) as total_orders FROM orders;
SELECT status, COUNT(*) FROM orders GROUP BY status;
