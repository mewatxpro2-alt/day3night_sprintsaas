-- =====================================================
-- MIGRATION 052: EMERGENCY FIX FOR MISSING COLUMNS
-- =====================================================
-- Purpose: Force add columns if they were missed by 049
-- =====================================================

-- 1. Seller Status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_status TEXT DEFAULT 'not_applied';

-- 2. Application Data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_application_data JSONB DEFAULT '{}'::jsonb;

-- 3. Timestamps
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_applied_at TIMESTAMPTZ;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS seller_reviewed_at TIMESTAMPTZ;

-- 4. Constraint (Drop first to avoid errors)
DO $$ 
BEGIN 
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_seller_status_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_seller_status_check 
    CHECK (seller_status IN ('not_applied', 'pending', 'approved', 'rejected'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_profiles_seller_status ON profiles(seller_status);

-- Force reload
NOTIFY pgrst, 'reload config';
