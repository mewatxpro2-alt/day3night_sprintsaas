-- =====================================================
-- MIGRATION 054: SELLER INTERACTION LAYER
-- =====================================================
-- Purpose: Add follow system, enhanced seller stats, and improved messaging
-- =====================================================

-- ===========================================
-- 1. SELLER FOLLOWS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS seller_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_user_id, seller_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_follows_follower ON seller_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_seller ON seller_follows(seller_id);

-- ===========================================
-- 2. PROFILE ENHANCEMENTS
-- ===========================================
DO $$ 
BEGIN 
    -- Followers count (denormalized for performance)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
        ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
    END IF;

    -- Repeat buyers count
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'repeat_buyers_count') THEN
        ALTER TABLE profiles ADD COLUMN repeat_buyers_count INTEGER DEFAULT 0;
    END IF;

    -- Projects completed (for seller stage calculation)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'projects_completed') THEN
        ALTER TABLE profiles ADD COLUMN projects_completed INTEGER DEFAULT 0;
    END IF;

    -- Projects submitted
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'projects_submitted') THEN
        ALTER TABLE profiles ADD COLUMN projects_submitted INTEGER DEFAULT 0;
    END IF;
END $$;

-- ===========================================
-- 3. ENHANCED SELLER INQUIRIES
-- ===========================================
DO $$ 
BEGIN 
    -- Budget range for inquiries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_inquiries' AND column_name = 'budget_range') THEN
        ALTER TABLE seller_inquiries ADD COLUMN budget_range TEXT;
    END IF;

    -- Timeline for inquiries
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_inquiries' AND column_name = 'timeline') THEN
        ALTER TABLE seller_inquiries ADD COLUMN timeline TEXT;
    END IF;
END $$;

-- ===========================================
-- 4. RLS POLICIES FOR SELLER_FOLLOWS
-- ===========================================
ALTER TABLE seller_follows ENABLE ROW LEVEL SECURITY;

-- Users can view all follows (public data)
DROP POLICY IF EXISTS "Anyone can view follows" ON seller_follows;
CREATE POLICY "Anyone can view follows" ON seller_follows
    FOR SELECT USING (true);

-- Users can follow sellers
DROP POLICY IF EXISTS "Users can follow sellers" ON seller_follows;
CREATE POLICY "Users can follow sellers" ON seller_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_user_id);

-- Users can unfollow
DROP POLICY IF EXISTS "Users can unfollow" ON seller_follows;
CREATE POLICY "Users can unfollow" ON seller_follows
    FOR DELETE USING (auth.uid() = follower_user_id);

-- ===========================================
-- 5. TRIGGER TO SYNC FOLLOWERS COUNT
-- ===========================================
CREATE OR REPLACE FUNCTION sync_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles 
        SET followers_count = COALESCE(followers_count, 0) + 1
        WHERE id = NEW.seller_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles 
        SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
        WHERE id = OLD.seller_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_followers_count ON seller_follows;
CREATE TRIGGER trigger_sync_followers_count
    AFTER INSERT OR DELETE ON seller_follows
    FOR EACH ROW EXECUTE FUNCTION sync_followers_count();

-- ===========================================
-- 6. FUNCTION TO GET SELLER STATS
-- ===========================================
CREATE OR REPLACE FUNCTION get_seller_stats(p_seller_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'followers_count', COALESCE(p.followers_count, 0),
        'projects_completed', COALESCE(p.projects_completed, 0),
        'projects_submitted', COALESCE(p.projects_submitted, 0),
        'repeat_buyers_count', COALESCE(p.repeat_buyers_count, 0),
        'total_sales', COALESCE(p.total_sales, 0),
        'rating_average', p.rating_average,
        'rating_count', COALESCE(p.rating_count, 0),
        'is_verified_seller', COALESCE(p.is_verified_seller, false)
    )
    INTO v_result
    FROM profiles p
    WHERE p.id = p_seller_id;
    
    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute
GRANT EXECUTE ON FUNCTION get_seller_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_seller_stats(UUID) TO anon;

-- ===========================================
-- 7. GRANTS
-- ===========================================
GRANT SELECT, INSERT, DELETE ON seller_follows TO authenticated;
GRANT SELECT ON seller_follows TO anon;

-- Force schema reload
NOTIFY pgrst, 'reload config';
