-- =====================================================
-- MIGRATION 031: EMAIL AUDIENCE SYSTEM
-- =====================================================
-- Purpose: Centralized email collection and management
-- Captures: Newsletter, Contact, User Signups
-- Features: Deduplication, Auto-linking, Campaign-ready
-- =====================================================

-- =====================================================
-- 1. EMAIL AUDIENCE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS email_audience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Fields
    email TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('newsletter', 'contact', 'buyer_signup', 'seller_signup', 'manual', 'other')),
    user_type TEXT NOT NULL CHECK (user_type IN ('guest', 'buyer', 'seller', 'admin')),
    status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'blocked')),
    consent_flag BOOLEAN NOT NULL DEFAULT false,
    
    -- Linking
    linked_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on lowercase email (for deduplication)
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_audience_email_unique ON email_audience(LOWER(email));

-- Other indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_audience_source ON email_audience(source);
CREATE INDEX IF NOT EXISTS idx_email_audience_user_type ON email_audience(user_type);
CREATE INDEX IF NOT EXISTS idx_email_audience_status ON email_audience(status);
CREATE INDEX IF NOT EXISTS idx_email_audience_linked_user ON email_audience(linked_user_id);
CREATE INDEX IF NOT EXISTS idx_email_audience_created_at ON email_audience(created_at DESC);

-- =====================================================
-- 2. UPSERT FUNCTION (Smart Merge)
-- =====================================================

CREATE OR REPLACE FUNCTION upsert_email_record(
    p_email TEXT,
    p_source TEXT,
    p_user_type TEXT DEFAULT 'guest',
    p_consent_flag BOOLEAN DEFAULT false,
    p_linked_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record_id UUID;
    v_existing_record email_audience%ROWTYPE;
BEGIN
    -- Normalize email (lowercase)
    p_email := LOWER(TRIM(p_email));
    
    -- Check if email exists
    SELECT * INTO v_existing_record
    FROM email_audience
    WHERE LOWER(email) = p_email;
    
    IF FOUND THEN
        -- Update existing record
        UPDATE email_audience
        SET 
            last_seen_at = NOW(),
            -- Upgrade user_type if more specific
            user_type = CASE 
                WHEN p_user_type IN ('buyer', 'seller', 'admin') THEN p_user_type
                ELSE user_type
            END,
            -- Link user if provided
            linked_user_id = COALESCE(p_linked_user_id, linked_user_id),
            -- Merge metadata
            metadata = v_existing_record.metadata || p_metadata,
            -- Update consent if newly provided
            consent_flag = CASE 
                WHEN p_consent_flag = true THEN true
                ELSE consent_flag
            END
        WHERE LOWER(email) = p_email
        RETURNING id INTO v_record_id;
    ELSE
        -- Insert new record
        INSERT INTO email_audience (
            email, source, user_type, status, consent_flag, linked_user_id, metadata
        ) VALUES (
            p_email, p_source, p_user_type, 'subscribed', p_consent_flag, p_linked_user_id, p_metadata
        )
        RETURNING id INTO v_record_id;
    END IF;
    
    RETURN v_record_id;
END;
$$;

-- =====================================================
-- 3. AUTO-SYNC PROFILES TO EMAIL AUDIENCE
-- =====================================================

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
    -- (You can enhance this logic based on your user classification)
    v_user_type := 'buyer'; -- Default assumption
    
    -- Determine source
    v_source := COALESCE(NEW.signup_source, 'buyer_signup');
    
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
        p_consent_flag := true, -- Registered users implicitly consent
        p_linked_user_id := NEW.id,
        p_metadata := jsonb_build_object(
            'full_name', NEW.full_name,
            'avatar_url', NEW.avatar_url,
            'is_verified_seller', NEW.is_verified_seller
        )
    );
    
    RETURN NEW;
END;
$$;

-- Trigger: Sync new profiles
DROP TRIGGER IF EXISTS trigger_sync_new_profile ON profiles;
CREATE TRIGGER trigger_sync_new_profile
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_to_email_audience();

-- Trigger: Update on profile changes
DROP TRIGGER IF EXISTS trigger_sync_profile_update ON profiles;
CREATE TRIGGER trigger_sync_profile_update
    AFTER UPDATE OF email ON profiles
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION sync_user_to_email_audience();

-- =====================================================
-- 4. BACKFILL EXISTING PROFILES
-- =====================================================

-- Insert existing profiles into email_audience
INSERT INTO email_audience (email, source, user_type, status, consent_flag, linked_user_id, metadata, created_at)
SELECT 
    LOWER(p.email) AS email,
    CASE 
        WHEN EXISTS (SELECT 1 FROM submissions s WHERE s.user_id = p.id LIMIT 1) THEN 'seller_signup'
        ELSE 'buyer_signup'
    END AS source,
    CASE 
        WHEN EXISTS (SELECT 1 FROM submissions s WHERE s.user_id = p.id LIMIT 1) THEN 'seller'
        ELSE 'buyer'
    END AS user_type,
    'subscribed' AS status,
    true AS consent_flag,
    p.id AS linked_user_id,
    jsonb_build_object(
        'full_name', p.full_name,
        'avatar_url', p.avatar_url,
        'is_verified_seller', p.is_verified_seller
    ) AS metadata,
    p.created_at AS created_at
FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM email_audience ea WHERE LOWER(ea.email) = LOWER(p.email)
);

-- =====================================================
-- 5. RLS POLICIES (Admin-Only Access)
-- =====================================================

ALTER TABLE email_audience ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admin full access to email_audience" ON email_audience;

-- Admin can do everything
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
    );

-- =====================================================
-- 6. HELPER VIEW FOR ADMIN DASHBOARD
-- =====================================================

CREATE OR REPLACE VIEW email_audience_stats AS
SELECT 
    COUNT(*) AS total_emails,
    COUNT(*) FILTER (WHERE status = 'subscribed') AS subscribed_count,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') AS unsubscribed_count,
    COUNT(*) FILTER (WHERE source = 'newsletter') AS newsletter_count,
    COUNT(*) FILTER (WHERE source LIKE '%signup') AS registered_count,
    COUNT(*) FILTER (WHERE user_type = 'guest') AS guest_count,
    COUNT(*) FILTER (WHERE user_type = 'buyer') AS buyer_count,
    COUNT(*) FILTER (WHERE user_type = 'seller') AS seller_count,
    COUNT(*) FILTER (WHERE linked_user_id IS NOT NULL) AS linked_count
FROM email_audience;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next Steps:
-- 1. Update forms to call upsert_email_record()
-- 2. Create admin interface at /admin/emails
-- 3. Add CSV export functionality
-- =====================================================
