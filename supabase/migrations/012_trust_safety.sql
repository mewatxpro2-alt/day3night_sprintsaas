-- =====================================================
-- PHASE 4A: TRUST & SAFETY INFRASTRUCTURE
-- Migration 012: User Flags, Restrictions, Moderation
-- =====================================================

-- =====================================================
-- 1. ENHANCE PROFILES TABLE
-- =====================================================

-- Account status for controlling user access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';
-- Values: 'active', 'restricted', 'suspended', 'banned'

-- Trust score (0-100, higher = more trusted)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50;

-- Quick reference flags (for fast queries)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

-- =====================================================
-- 2. USER FLAGS TABLE (Detailed flag tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Flag type
    flag_type TEXT NOT NULL,
    -- Types: 'spam', 'fraud', 'chargeback', 'fake_listing', 'harassment', 
    --        'tos_violation', 'copyright', 'suspicious_activity', 'manual_review'
    
    -- Details
    reason TEXT NOT NULL,
    evidence_urls TEXT[],
    
    -- Who flagged
    flagged_by UUID REFERENCES profiles(id), -- Admin who flagged
    is_system_generated BOOLEAN DEFAULT FALSE, -- Auto-detected
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id),
    resolution_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. USER RESTRICTIONS TABLE (Temporary action limits)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Restriction type
    restriction_type TEXT NOT NULL,
    -- Types: 'no_purchase', 'no_sell', 'no_message', 'no_review', 'read_only'
    
    -- Details
    reason TEXT NOT NULL,
    
    -- Duration
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- NULL = permanent until lifted
    
    -- Who applied
    applied_by UUID REFERENCES profiles(id) NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    lifted_at TIMESTAMPTZ,
    lifted_by UUID REFERENCES profiles(id),
    lift_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ENHANCE LISTINGS TABLE (Moderation Status)
-- =====================================================

-- Moderation lifecycle status
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';
-- Values: 'submitted', 'pending_review', 'approved', 'featured', 'hidden', 'removed'

ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS removal_reason TEXT;

-- =====================================================
-- 5. MODERATION ACTIONS TABLE (Full Audit Log)
-- =====================================================

CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who performed the action
    admin_id UUID REFERENCES profiles(id) NOT NULL,
    
    -- Target of action
    target_type TEXT NOT NULL, -- 'user', 'listing', 'review', 'message', 'order'
    target_id UUID NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL,
    -- User actions: 'flag', 'unflag', 'restrict', 'unrestrict', 'suspend', 'unsuspend', 'ban', 'unban'
    -- Listing actions: 'approve', 'reject', 'hide', 'unhide', 'remove', 'restore', 'feature', 'unfeature'
    -- Content actions: 'delete', 'edit', 'flag'
    
    previous_state JSONB, -- Snapshot before action
    new_state JSONB, -- Snapshot after action
    
    reason TEXT,
    notes TEXT,
    evidence_urls TEXT[],
    
    -- Reversibility
    is_reversible BOOLEAN DEFAULT TRUE,
    reversed_at TIMESTAMPTZ,
    reversed_by UUID REFERENCES profiles(id),
    reversal_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- IP/device for security auditing (optional)
    ip_address INET,
    user_agent TEXT
);

-- =====================================================
-- 6. ABUSE REPORTS TABLE (User-submitted reports)
-- =====================================================

CREATE TABLE IF NOT EXISTS abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reporter
    reporter_id UUID REFERENCES profiles(id), -- NULL if anonymous
    reporter_email TEXT, -- For non-logged-in reports
    
    -- Target
    target_type TEXT NOT NULL, -- 'user', 'listing', 'review', 'message'
    target_id UUID NOT NULL,
    
    -- Report details
    report_type TEXT NOT NULL,
    -- Types: 'spam', 'fraud', 'harassment', 'copyright', 'inappropriate', 'fake', 'other'
    
    description TEXT NOT NULL,
    evidence_urls TEXT[],
    
    -- Status
    status TEXT DEFAULT 'pending',
    -- Values: 'pending', 'reviewing', 'resolved_action_taken', 'resolved_no_action', 'dismissed'
    
    -- Resolution
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    resolution_notes TEXT,
    action_taken TEXT, -- Description of action taken
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profile status queries
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_is_flagged ON profiles(is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);

-- User flags
CREATE INDEX IF NOT EXISTS idx_user_flags_user ON user_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flags_type ON user_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_user_flags_active ON user_flags(user_id, is_active) WHERE is_active = TRUE;

-- User restrictions
CREATE INDEX IF NOT EXISTS idx_user_restrictions_user ON user_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_restrictions_active ON user_restrictions(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_restrictions_expires ON user_restrictions(expires_at) WHERE expires_at IS NOT NULL;

-- Listings moderation
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_listings_pending_review ON listings(moderation_status) WHERE moderation_status IN ('submitted', 'pending_review');

-- Moderation actions (audit log)
CREATE INDEX IF NOT EXISTS idx_moderation_actions_admin ON moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_target ON moderation_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_type ON moderation_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_created ON moderation_actions(created_at DESC);

-- Abuse reports
CREATE INDEX IF NOT EXISTS idx_abuse_reports_status ON abuse_reports(status);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_pending ON abuse_reports(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_abuse_reports_target ON abuse_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_abuse_reports_reporter ON abuse_reports(reporter_id);

-- =====================================================
-- 8. AUTO-UPDATE TRIGGERS
-- =====================================================

-- Update user_flags.updated_at
CREATE OR REPLACE FUNCTION update_user_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_flags_updated_at ON user_flags;
CREATE TRIGGER trigger_user_flags_updated_at
    BEFORE UPDATE ON user_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_user_flags_updated_at();

-- Update abuse_reports.updated_at
CREATE OR REPLACE FUNCTION update_abuse_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_abuse_reports_updated_at ON abuse_reports;
CREATE TRIGGER trigger_abuse_reports_updated_at
    BEFORE UPDATE ON abuse_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_abuse_reports_updated_at();

-- =====================================================
-- 9. HELPER FUNCTION: Check if user can perform action
-- =====================================================

CREATE OR REPLACE FUNCTION can_user_perform_action(
    p_user_id UUID,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_account_status TEXT;
    v_has_restriction BOOLEAN;
BEGIN
    -- Get account status
    SELECT account_status INTO v_account_status
    FROM profiles
    WHERE id = p_user_id;
    
    -- Banned users can't do anything
    IF v_account_status = 'banned' THEN
        RETURN FALSE;
    END IF;
    
    -- Suspended users can only read
    IF v_account_status = 'suspended' AND p_action != 'read' THEN
        RETURN FALSE;
    END IF;
    
    -- Check for active restrictions matching the action
    SELECT EXISTS (
        SELECT 1 FROM user_restrictions
        WHERE user_id = p_user_id
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
            (p_action = 'purchase' AND restriction_type = 'no_purchase') OR
            (p_action = 'sell' AND restriction_type = 'no_sell') OR
            (p_action = 'message' AND restriction_type = 'no_message') OR
            (p_action = 'review' AND restriction_type = 'no_review') OR
            (restriction_type = 'read_only' AND p_action != 'read')
        )
    ) INTO v_has_restriction;
    
    RETURN NOT v_has_restriction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. HELPER FUNCTION: Auto-expire restrictions
-- =====================================================

CREATE OR REPLACE FUNCTION expire_user_restrictions()
RETURNS void AS $$
BEGIN
    UPDATE user_restrictions
    SET is_active = FALSE,
        lifted_at = NOW(),
        lift_reason = 'Auto-expired'
    WHERE is_active = TRUE
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
