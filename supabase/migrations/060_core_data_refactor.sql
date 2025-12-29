-- =====================================================
-- 060: CORE DATA PIPELINE REFACTOR
-- Comprehensive schema update for structured submission data
-- =====================================================

-- =====================================================
-- PART 1: SUBMISSIONS TABLE ENHANCEMENTS
-- =====================================================

-- 1.1 Pricing & Commercial Terms
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'one-time'; -- 'one-time' | 'subscription'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS product_stage TEXT DEFAULT 'mvp'; -- 'mvp' | 'production' | 'experimental'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'personal'; -- 'personal' | 'commercial' | 'unlimited'

-- 1.2 Structured Description Fields
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS executive_summary TEXT; -- 300-500 chars overview
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS problem_it_solves TEXT; -- What pain point does this solve?
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS complexity_level TEXT DEFAULT 'intermediate'; -- 'beginner' | 'intermediate' | 'advanced'

-- 1.3 Seller Credibility (per-submission, can differ from profile)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seller_display_name TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seller_bio TEXT; -- max 120 chars
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seller_experience_level TEXT DEFAULT 'intermediate'; -- 'beginner' | 'intermediate' | 'expert'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seller_prior_projects INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS seller_portfolio_url TEXT;

-- 1.4 Trust Signals
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'none'; -- 'none' | 'email' | 'discord' | 'dedicated'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS has_refund_policy BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS has_maintenance_commitment BOOLEAN DEFAULT FALSE;

-- 1.5 Demo Video (ensure exists)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS demo_video_url TEXT;

-- 1.6 Convert tech_stack from TEXT to TEXT[] if it's still TEXT
-- First check if it's already an array, if not convert
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'submissions' 
        AND column_name = 'tech_stack' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE submissions ALTER COLUMN tech_stack TYPE TEXT[] 
        USING CASE 
            WHEN tech_stack IS NULL OR tech_stack = '' THEN '{}'::TEXT[]
            ELSE string_to_array(tech_stack, ', ')
        END;
    END IF;
END $$;

-- =====================================================
-- PART 2: LISTINGS TABLE ENHANCEMENTS (Mirror columns)
-- =====================================================

-- 2.1 Pricing & Commercial Terms
ALTER TABLE listings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS pricing_type TEXT DEFAULT 'one-time';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS product_stage TEXT DEFAULT 'mvp';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'personal';

-- 2.2 Structured Description Fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS executive_summary TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS problem_it_solves TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS complexity_level TEXT DEFAULT 'intermediate';

-- 2.3 Seller Credibility (copied from submission at approval time)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_display_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_bio TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_experience_level TEXT DEFAULT 'intermediate';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_prior_projects INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS seller_portfolio_url TEXT;

-- 2.4 Trust Signals
ALTER TABLE listings ADD COLUMN IF NOT EXISTS support_level TEXT DEFAULT 'none';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_refund_policy BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_maintenance_commitment BOOLEAN DEFAULT FALSE;

-- 2.5 Ensure demo_video_url exists
ALTER TABLE listings ADD COLUMN IF NOT EXISTS demo_video_url TEXT;

-- 2.6 Ensure video_url exists (alias for compatibility)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS video_url TEXT;

-- =====================================================
-- PART 3: ENUMS / CONSTRAINTS (Optional but recommended)
-- =====================================================

-- Add check constraints for enum-like fields
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_currency;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_currency 
    CHECK (currency IN ('INR', 'USD'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_pricing_type;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_pricing_type 
    CHECK (pricing_type IN ('one-time', 'subscription'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_product_stage;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_product_stage 
    CHECK (product_stage IN ('mvp', 'production', 'experimental'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_license_type;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_license_type 
    CHECK (license_type IN ('personal', 'commercial', 'unlimited'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_complexity;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_complexity 
    CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_support;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_support 
    CHECK (support_level IN ('none', 'email', 'discord', 'dedicated'));

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_experience;
ALTER TABLE submissions ADD CONSTRAINT chk_submissions_experience 
    CHECK (seller_experience_level IN ('beginner', 'intermediate', 'expert'));

-- Mirror constraints for listings
ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_currency;
ALTER TABLE listings ADD CONSTRAINT chk_listings_currency 
    CHECK (currency IN ('INR', 'USD'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_pricing_type;
ALTER TABLE listings ADD CONSTRAINT chk_listings_pricing_type 
    CHECK (pricing_type IN ('one-time', 'subscription'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_product_stage;
ALTER TABLE listings ADD CONSTRAINT chk_listings_product_stage 
    CHECK (product_stage IN ('mvp', 'production', 'experimental'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_license_type;
ALTER TABLE listings ADD CONSTRAINT chk_listings_license_type 
    CHECK (license_type IN ('personal', 'commercial', 'unlimited'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_complexity;
ALTER TABLE listings ADD CONSTRAINT chk_listings_complexity 
    CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_support;
ALTER TABLE listings ADD CONSTRAINT chk_listings_support 
    CHECK (support_level IN ('none', 'email', 'discord', 'dedicated'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS chk_listings_experience;
ALTER TABLE listings ADD CONSTRAINT chk_listings_experience 
    CHECK (seller_experience_level IN ('beginner', 'intermediate', 'expert'));

-- =====================================================
-- PART 4: DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN submissions.currency IS 'Price currency: INR or USD';
COMMENT ON COLUMN submissions.pricing_type IS 'one-time purchase or subscription';
COMMENT ON COLUMN submissions.product_stage IS 'mvp, production, or experimental';
COMMENT ON COLUMN submissions.license_type IS 'personal, commercial, or unlimited use rights';
COMMENT ON COLUMN submissions.executive_summary IS '300-500 char overview for the product page';
COMMENT ON COLUMN submissions.problem_it_solves IS 'Pain point this product addresses';
COMMENT ON COLUMN submissions.complexity_level IS 'beginner, intermediate, or advanced setup difficulty';
COMMENT ON COLUMN submissions.seller_display_name IS 'Public name shown on listing';
COMMENT ON COLUMN submissions.seller_bio IS 'Short bio (max 120 chars)';
COMMENT ON COLUMN submissions.seller_experience_level IS 'beginner, intermediate, or expert';
COMMENT ON COLUMN submissions.seller_prior_projects IS 'Number of prior completed projects';
COMMENT ON COLUMN submissions.support_level IS 'none, email, discord, or dedicated support';
COMMENT ON COLUMN submissions.has_refund_policy IS 'Whether seller offers refunds';
COMMENT ON COLUMN submissions.has_maintenance_commitment IS 'Whether seller commits to maintenance updates';

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'submissions'
AND column_name IN (
    'currency', 'pricing_type', 'product_stage', 'license_type',
    'executive_summary', 'problem_it_solves', 'complexity_level',
    'seller_display_name', 'seller_bio', 'seller_experience_level', 
    'seller_prior_projects', 'seller_portfolio_url',
    'support_level', 'has_refund_policy', 'has_maintenance_commitment',
    'tech_stack'
)
ORDER BY column_name;
