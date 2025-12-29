-- =====================================================
-- MIGRATION 048: PROFILE ENHANCEMENTS
-- =====================================================
-- Purpose: Add fields for extended user profile
-- =====================================================

DO $$ 
BEGIN 
    -- Interests array
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;

    -- Preferences JSON
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
        ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{"show_buyer_content": true, "show_seller_tools": false, "receive_updates": true}'::jsonb;
    END IF;

    -- Ensure RLS allows updates (columns added to existing table, so existing policies should cover it, 
    -- but explicit grants/checks might be needed if policies were column-specific. 
    -- Standard Supabase "Users can update own profile" usually covers all columns.)
END $$;

-- Force schema reload
NOTIFY pgrst, 'reload config';
