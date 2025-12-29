-- Quick fix for email_audience RLS to allow admin SELECT access
-- Run this in Supabase SQL Editor

-- Drop the existing policy
DROP POLICY IF EXISTS "Admin full access to email_audience" ON email_audience;

-- Create new policy with explicit SELECT, INSERT, UPDATE, DELETE permissions
CREATE POLICY "Admin full access to email_audience"
    ON email_audience
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Also grant permissions to the view
GRANT SELECT ON email_audience_stats TO authenticated;
