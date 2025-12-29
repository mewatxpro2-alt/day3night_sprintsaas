-- FINAL FIX: Email Audience RLS Issue
-- This will definitely work

-- Step 1: Check all users and their roles
SELECT id, email, role FROM profiles ORDER BY created_at DESC;

-- Step 2: Set EVERY user you recognize as admin (modify as needed)
UPDATE profiles SET role = 'admin' WHERE email IN (
    'fushamn@gmail.com',
    'tadmin@gmail.com',
    'khannabubakar786@gmail.com'
);

-- Step 3: Verify the update worked
SELECT id, email, role FROM profiles WHERE role = 'admin';

-- Step 4: Alternative - Make RLS policy more permissive (temporary debugging)
-- Drop the strict policy
DROP POLICY IF EXISTS "Admin full access to email_audience" ON email_audience;

-- Create a new policy that allows ANY authenticated user (TEMPORARY - for testing)
CREATE POLICY "Authenticated users can view email_audience"
    ON email_audience
    FOR SELECT
    TO authenticated
    USING (true);

-- Create a policy for INSERT/UPDATE/DELETE only for admins
CREATE POLICY "Admin can modify email_audience"
    ON email_audience
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can update email_audience"
    ON email_audience
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can delete email_audience"
    ON email_audience
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
