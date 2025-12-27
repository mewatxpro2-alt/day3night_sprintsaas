-- =====================================================
-- ENHANCED SUBMISSIONS SCHEMA
-- Migration 017: Real submission workflow
-- =====================================================

-- 1. ADD NEW COLUMNS TO SUBMISSIONS TABLE
-- =====================================================

-- Video URL for demo video upload
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Short summary (value proposition)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS short_summary TEXT;

-- Repository URL
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS repo_url TEXT;

-- Features list (bullet points)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS features TEXT;

-- Screenshot URLs (array)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS screenshot_urls TEXT[];

-- Seller declarations (legal compliance)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS owner_declaration BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rights_declaration BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS declaration_at TIMESTAMPTZ;

-- Admin review fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- Updated timestamp
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 2. ADD DEMO VIDEO TO LISTINGS TABLE
-- =====================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS demo_video_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS short_summary TEXT;

-- =====================================================
-- 3. STORAGE BUCKETS FOR SUBMISSIONS
-- =====================================================

-- Create storage bucket for submission assets
-- Note: Run this in Supabase Dashboard > Storage or via Supabase CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true);

-- =====================================================
-- 4. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_submissions_user_status 
ON submissions(user_id, status);

CREATE INDEX IF NOT EXISTS idx_submissions_reviewed 
ON submissions(reviewed_at DESC) 
WHERE reviewed_at IS NOT NULL;

-- =====================================================
-- 5. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_submissions_updated_at ON submissions;
CREATE TRIGGER trigger_submissions_updated_at
    BEFORE UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submissions_updated_at();
