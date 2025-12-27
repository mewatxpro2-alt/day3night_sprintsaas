-- =====================================================
-- PHASE 4A: TRUST & SAFETY RLS POLICIES
-- Migration 013: Row Level Security for Trust Tables
-- =====================================================

-- =====================================================
-- 1. USER FLAGS RLS
-- =====================================================

ALTER TABLE user_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can view all flags
CREATE POLICY "Admins can view all user flags"
    ON user_flags
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Users can view their own flags (transparency)
CREATE POLICY "Users can view their own flags"
    ON user_flags
    FOR SELECT
    USING (user_id = auth.uid());

-- Only admins can create flags
CREATE POLICY "Admins can create user flags"
    ON user_flags
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update flags
CREATE POLICY "Admins can update user flags"
    ON user_flags
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can delete flags
CREATE POLICY "Admins can delete user flags"
    ON user_flags
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- 2. USER RESTRICTIONS RLS
-- =====================================================

ALTER TABLE user_restrictions ENABLE ROW LEVEL SECURITY;

-- Admins can view all restrictions
CREATE POLICY "Admins can view all restrictions"
    ON user_restrictions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Users can view their own active restrictions
CREATE POLICY "Users can view their own restrictions"
    ON user_restrictions
    FOR SELECT
    USING (user_id = auth.uid());

-- Only admins can manage restrictions
CREATE POLICY "Admins can create restrictions"
    ON user_restrictions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can update restrictions"
    ON user_restrictions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can delete restrictions"
    ON user_restrictions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- 3. MODERATION ACTIONS RLS (Audit Log)
-- =====================================================

ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view the audit log
CREATE POLICY "Admins can view moderation actions"
    ON moderation_actions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can create audit entries
CREATE POLICY "Admins can create moderation actions"
    ON moderation_actions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Audit log is append-only with limited updates (for reversal tracking)
CREATE POLICY "Admins can update moderation actions"
    ON moderation_actions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- No delete - audit trail must be preserved
-- (No DELETE policy = no one can delete)

-- =====================================================
-- 4. ABUSE REPORTS RLS
-- =====================================================

ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;

-- Admins can view all reports
CREATE POLICY "Admins can view all abuse reports"
    ON abuse_reports
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Users can view their own submitted reports
CREATE POLICY "Users can view their own reports"
    ON abuse_reports
    FOR SELECT
    USING (reporter_id = auth.uid());

-- Authenticated users can submit reports
CREATE POLICY "Authenticated users can submit abuse reports"
    ON abuse_reports
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND (reporter_id = auth.uid() OR reporter_id IS NULL)
    );

-- Only admins can update reports (for resolution)
CREATE POLICY "Admins can update abuse reports"
    ON abuse_reports
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- 5. ENHANCED LISTINGS POLICIES FOR MODERATION
-- =====================================================

-- Drop existing listing SELECT policy to recreate with moderation filter
DROP POLICY IF EXISTS "Anyone can view live listings" ON listings;
DROP POLICY IF EXISTS "Public can view listings" ON listings;

-- Public can only see approved/featured listings
CREATE POLICY "Public can view approved listings"
    ON listings
    FOR SELECT
    USING (
        -- Public sees only approved/featured and live listings
        (
            is_live = TRUE 
            AND moderation_status IN ('approved', 'featured')
        )
        -- Or creator can see their own listings regardless of status
        OR creator_id = auth.uid()
        -- Or admins can see everything
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- =====================================================
-- 6. ENHANCED PROFILES POLICIES FOR ACCOUNT STATUS
-- =====================================================

-- Function to check if user is banned (used in other policies)
CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = user_id
        AND account_status = 'banned'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has restriction
CREATE OR REPLACE FUNCTION user_has_restriction(user_id UUID, restriction TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_restrictions
        WHERE user_restrictions.user_id = user_id
        AND restriction_type = restriction
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
