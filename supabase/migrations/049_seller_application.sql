-- =====================================================
-- MIGRATION 049: SELLER APPLICATION FLOW
-- =====================================================
-- Purpose: Track seller application status and data
-- =====================================================

DO $$ 
BEGIN 
    -- 1. Seller Status
    -- Values: 'not_applied', 'pending', 'approved', 'rejected'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_status') THEN
        ALTER TABLE profiles ADD COLUMN seller_status TEXT DEFAULT 'not_applied';
        
        -- Add check constraint for valid values
        ALTER TABLE profiles ADD CONSTRAINT profiles_seller_status_check 
        CHECK (seller_status IN ('not_applied', 'pending', 'approved', 'rejected'));
    END IF;

    -- 2. Application Data (JSON structure for flexible form fields)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_application_data') THEN
        ALTER TABLE profiles ADD COLUMN seller_application_data JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- 3. Timestamps
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_applied_at') THEN
        ALTER TABLE profiles ADD COLUMN seller_applied_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_reviewed_at') THEN
        ALTER TABLE profiles ADD COLUMN seller_reviewed_at TIMESTAMPTZ;
    END IF;
    
    -- 4. Index for Admin filtering
    CREATE INDEX IF NOT EXISTS idx_profiles_seller_status ON profiles(seller_status);

END $$;

-- Force schema reload
NOTIFY pgrst, 'reload config';
