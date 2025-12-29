-- =====================================================
-- MIGRATION 038: PERSONA-BASED ONBOARDING
-- =====================================================
-- Purpose: Add fields to store user persona and intent
-- =====================================================

-- 1. Add onboarding columns to profiles table
DO $$ 
BEGIN 
    -- Status flags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed_at') THEN
        ALTER TABLE profiles ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
    END IF;

    -- Core intent
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'primary_intent') THEN
        ALTER TABLE profiles ADD COLUMN primary_intent TEXT; -- 'buy', 'sell', 'explore', 'unsure'
    END IF;

    -- Buyer/Explorer specific
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interest_type') THEN
        ALTER TABLE profiles ADD COLUMN interest_type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'experience_level') THEN
        ALTER TABLE profiles ADD COLUMN experience_level TEXT;
    END IF;

    -- Seller specific
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_type') THEN
        ALTER TABLE profiles ADD COLUMN seller_type TEXT; -- 'solo', 'agency', 'team', etc.
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_product_focus') THEN
        ALTER TABLE profiles ADD COLUMN seller_product_focus TEXT; -- 'full_saas', 'mvp', 'ui_kit'
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'seller_readiness') THEN
        ALTER TABLE profiles ADD COLUMN seller_readiness TEXT; -- 'now', 'soon', 'exploring'
    END IF;
END $$;

-- 2. Allow users to update their own onboarding data
-- (Existing policy "Users can update own profile" should cover this, but let's be safe)
CREATE POLICY "Users can update own onboarding data"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 3. Create index for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_intent ON profiles(primary_intent);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
