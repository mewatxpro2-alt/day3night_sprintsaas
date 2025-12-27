-- =====================================================
-- PHASE 4D: LEGAL & ANALYTICS INFRASTRUCTURE
-- Migration 016: Consent Tracking, Declarations, Events
-- =====================================================

-- =====================================================
-- 1. USER CONSENT TRACKING
-- =====================================================

-- Track when users accept policies (GDPR, TOS, etc.)
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- What was consented to
    policy_type TEXT NOT NULL,
    -- Types: 'terms_of_service', 'privacy_policy', 'seller_agreement', 'cookie_policy', 'marketing'
    
    policy_version TEXT NOT NULL, -- e.g., '2024.1', '1.0.0'
    
    -- Consent details
    accepted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    
    -- For auditing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one consent per user per policy type per version
    UNIQUE(user_id, policy_type, policy_version)
);

-- Current policy versions (admin-configurable)
CREATE TABLE IF NOT EXISTS policy_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_type TEXT UNIQUE NOT NULL,
    current_version TEXT NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    content_hash TEXT, -- For detecting if content changed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default policy versions
INSERT INTO policy_versions (policy_type, current_version, effective_date) VALUES
    ('terms_of_service', '2024.1', '2024-01-01'),
    ('privacy_policy', '2024.1', '2024-01-01'),
    ('seller_agreement', '2024.1', '2024-01-01'),
    ('cookie_policy', '2024.1', '2024-01-01')
ON CONFLICT (policy_type) DO NOTHING;

-- =====================================================
-- 2. SELLER DECLARATIONS (Legal compliance for listings)
-- =====================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_declaration BOOLEAN DEFAULT FALSE;
-- Seller declares: "I own or have rights to sell this product"

ALTER TABLE listings ADD COLUMN IF NOT EXISTS rights_declaration BOOLEAN DEFAULT FALSE;
-- Seller declares: "This does not infringe any copyright/IP"

ALTER TABLE listings ADD COLUMN IF NOT EXISTS declaration_accepted_at TIMESTAMPTZ;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS declaration_ip_address INET;

-- =====================================================
-- 3. ANALYTICS EVENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event identification
    event_type TEXT NOT NULL,
    -- Common types:
    -- 'page_view', 'listing_view', 'listing_click', 'add_to_cart',
    -- 'purchase_started', 'purchase_completed', 'search', 'filter_applied',
    -- 'signup_started', 'signup_completed', 'login', 'logout'
    
    -- Actor (may be null for anonymous)
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    session_id TEXT, -- Anonymous session tracking
    
    -- Target (what was interacted with)
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    
    -- Event metadata (flexible JSON)
    metadata JSONB DEFAULT '{}',
    -- Examples:
    -- { "search_query": "saas dashboard", "results_count": 15 }
    -- { "price": 49.99, "payment_method": "stripe" }
    -- { "referrer": "google", "utm_source": "ads" }
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- For deduplication
    event_hash TEXT -- Hash of event for idempotency
);

-- =====================================================
-- 4. PLATFORM LOGS (Errors, Warnings, Audit)
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Log classification
    log_type TEXT NOT NULL,
    -- Types: 'error', 'warning', 'info', 'security', 'payment', 'abuse'
    
    severity TEXT NOT NULL DEFAULT 'info',
    -- Levels: 'debug', 'info', 'warning', 'error', 'critical'
    
    -- Log content
    message TEXT NOT NULL,
    
    -- Context
    metadata JSONB DEFAULT '{}',
    -- Examples:
    -- { "error_code": "PAYMENT_FAILED", "stripe_error": "card_declined" }
    -- { "endpoint": "/api/orders", "status_code": 500 }
    
    -- Actor
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Request context
    request_id TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INDEXES
-- =====================================================

-- Consent queries
CREATE INDEX IF NOT EXISTS idx_user_consents_user 
ON user_consents(user_id);

CREATE INDEX IF NOT EXISTS idx_user_consents_policy 
ON user_consents(policy_type, policy_version);

-- Check if user has current consent
CREATE INDEX IF NOT EXISTS idx_user_consents_check 
ON user_consents(user_id, policy_type);

-- Analytics event queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type 
ON analytics_events(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user 
ON analytics_events(user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_listing 
ON analytics_events(listing_id, created_at DESC) 
WHERE listing_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_session 
ON analytics_events(session_id, created_at DESC) 
WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_date 
ON analytics_events(created_at DESC);

-- For hash-based deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_hash 
ON analytics_events(event_hash) 
WHERE event_hash IS NOT NULL;

-- Platform logs
CREATE INDEX IF NOT EXISTS idx_platform_logs_type 
ON platform_logs(log_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_severity 
ON platform_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_logs_user 
ON platform_logs(user_id, created_at DESC) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_platform_logs_date 
ON platform_logs(created_at DESC);

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- User Consents
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
    ON user_consents
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own consents"
    ON user_consents
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all consents"
    ON user_consents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy Versions (read-only for users)
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read policy versions"
    ON policy_versions
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Only admins can modify policy versions"
    ON policy_versions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Analytics Events (insert only for authenticated, read for admins)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert analytics events"
    ON analytics_events
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can read analytics events"
    ON analytics_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Platform Logs (admin only)
ALTER TABLE platform_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read platform logs"
    ON platform_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert platform logs"
    ON platform_logs
    FOR INSERT
    WITH CHECK (TRUE); -- Service role will insert

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Check if user has accepted current version of a policy
CREATE OR REPLACE FUNCTION has_current_consent(
    p_user_id UUID,
    p_policy_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_version TEXT;
    v_has_consent BOOLEAN;
BEGIN
    -- Get current version
    SELECT current_version INTO v_current_version
    FROM policy_versions
    WHERE policy_type = p_policy_type;
    
    IF v_current_version IS NULL THEN
        RETURN TRUE; -- No policy defined = no consent required
    END IF;
    
    -- Check if user has accepted this version
    SELECT EXISTS (
        SELECT 1 FROM user_consents
        WHERE user_id = p_user_id
        AND policy_type = p_policy_type
        AND policy_version = v_current_version
    ) INTO v_has_consent;
    
    RETURN v_has_consent;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Record a consent
CREATE OR REPLACE FUNCTION record_consent(
    p_user_id UUID,
    p_policy_type TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_version TEXT;
BEGIN
    -- Get current version
    SELECT current_version INTO v_current_version
    FROM policy_versions
    WHERE policy_type = p_policy_type;
    
    IF v_current_version IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Insert consent (will fail if already exists due to unique constraint)
    INSERT INTO user_consents (user_id, policy_type, policy_version, ip_address, user_agent)
    VALUES (p_user_id, p_policy_type, v_current_version, p_ip_address, p_user_agent)
    ON CONFLICT (user_id, policy_type, policy_version) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log an analytics event
CREATE OR REPLACE FUNCTION log_analytics_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_session_id TEXT DEFAULT NULL,
    p_listing_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_event_hash TEXT;
BEGIN
    -- Generate hash for deduplication (optional)
    v_event_hash := md5(
        p_event_type || 
        COALESCE(p_user_id::text, '') || 
        COALESCE(p_session_id, '') ||
        COALESCE(p_listing_id::text, '') ||
        date_trunc('second', NOW())::text
    );
    
    INSERT INTO analytics_events (
        event_type, user_id, session_id, listing_id, metadata, event_hash
    ) VALUES (
        p_event_type, p_user_id, p_session_id, p_listing_id, p_metadata, v_event_hash
    )
    ON CONFLICT (event_hash) DO NOTHING
    RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log a platform event
CREATE OR REPLACE FUNCTION log_platform_event(
    p_log_type TEXT,
    p_severity TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO platform_logs (
        log_type, severity, message, metadata, user_id
    ) VALUES (
        p_log_type, p_severity, p_message, p_metadata, p_user_id
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
