-- =====================================================
-- PHASE 5: RETENTION & ENGAGEMENT
-- Migration 022: Wishlists, Saved Searches, Follows
-- =====================================================

-- =====================================================
-- 1. WISHLISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicates
    UNIQUE(user_id, listing_id)
);

-- =====================================================
-- 2. SAVED SEARCHES
-- =====================================================

CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Search criteria
    name TEXT, -- Optional user-given name
    query TEXT, -- Text search query
    filters JSONB DEFAULT '{}', -- Category, price range, etc.
    
    -- Notifications
    notify_on_new BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. SELLER FOLLOWS
-- =====================================================

CREATE TABLE IF NOT EXISTS seller_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent self-follow and duplicates
    UNIQUE(follower_id, seller_id),
    CHECK (follower_id != seller_id)
);

-- Add follower count to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- =====================================================
-- 4. NOTIFICATION PREFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    -- Email notifications
    email_order_updates BOOLEAN DEFAULT TRUE,
    email_review_received BOOLEAN DEFAULT TRUE,
    email_new_from_followed BOOLEAN DEFAULT TRUE,
    email_saved_search_matches BOOLEAN DEFAULT TRUE,
    email_price_drops BOOLEAN DEFAULT TRUE,
    email_marketing BOOLEAN DEFAULT FALSE,
    
    -- In-app notifications (future)
    push_enabled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Update follower count on follow/unfollow
CREATE OR REPLACE FUNCTION update_follower_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.seller_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.seller_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_follower_count ON seller_follows;
CREATE TRIGGER trigger_update_follower_count
    AFTER INSERT OR DELETE ON seller_follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follower_count();

-- =====================================================
-- 6. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_listing ON wishlists(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_follower ON seller_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_seller ON seller_follows(seller_id);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(follower_count DESC) WHERE is_seller = TRUE;

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Wishlists
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their wishlist"
    ON wishlists FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Saved Searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their saved searches"
    ON saved_searches FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Seller Follows
ALTER TABLE seller_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their follows"
    ON seller_follows FOR ALL
    USING (follower_id = auth.uid())
    WITH CHECK (follower_id = auth.uid());

-- Anyone can see follow counts (public)
CREATE POLICY "Anyone can see seller follow status"
    ON seller_follows FOR SELECT
    USING (TRUE);

-- Notification Preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their notification preferences"
    ON notification_preferences FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
