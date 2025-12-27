-- =====================================================
-- PHASE 5 MIGRATIONS - SAFE VERSION
-- Handles already-existing objects
-- =====================================================

-- =====================================================
-- CLEANUP: Drop existing policies first (if any)
-- =====================================================

-- Featured listings policies
DROP POLICY IF EXISTS "Sellers can view own featured listings" ON featured_listings;
DROP POLICY IF EXISTS "Admins can view all featured listings" ON featured_listings;

-- Featured pricing policies
DROP POLICY IF EXISTS "Anyone can view featured pricing" ON featured_pricing;

-- Wishlists policies
DROP POLICY IF EXISTS "Users can manage their wishlist" ON wishlists;

-- Saved searches policies
DROP POLICY IF EXISTS "Users can manage their saved searches" ON saved_searches;

-- Seller follows policies
DROP POLICY IF EXISTS "Users can manage their follows" ON seller_follows;
DROP POLICY IF EXISTS "Anyone can see seller follow status" ON seller_follows;

-- Notification preferences policies
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON notification_preferences;

-- =====================================================
-- 019: SECURE MESSAGING (Content Moderation)
-- =====================================================

-- Add columns for conversation locking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked_by UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_lock_reason TEXT;

-- Content moderation function
CREATE OR REPLACE FUNCTION check_message_content()
RETURNS TRIGGER AS $$
DECLARE
    blocked_patterns TEXT[] := ARRAY[
        '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b',
        '\b\d{10,}\b',
        '\b(whatsapp|telegram|signal|call me|contact me at|my number|my email)\b',
        '\b(razorpay\.me|paytm\.me|gpay|phonepe|upi)\b'
    ];
    pattern TEXT;
BEGIN
    FOREACH pattern IN ARRAY blocked_patterns
    LOOP
        IF NEW.content ~* pattern THEN
            RAISE EXCEPTION 'Message contains restricted content. Please keep communication within the platform.';
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_message_content ON messages;
CREATE TRIGGER trigger_check_message_content
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_content();

-- Admin functions for locking conversations
CREATE OR REPLACE FUNCTION admin_lock_conversation(p_order_id UUID, p_reason TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE orders 
    SET messages_locked = TRUE,
        messages_locked_at = NOW(),
        messages_locked_by = auth.uid(),
        messages_lock_reason = p_reason
    WHERE id = p_order_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION admin_unlock_conversation(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE orders 
    SET messages_locked = FALSE,
        messages_locked_at = NULL,
        messages_locked_by = NULL,
        messages_lock_reason = NULL
    WHERE id = p_order_id;
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE INDEX IF NOT EXISTS idx_orders_messages_locked ON orders(messages_locked);

-- =====================================================
-- 020: SELLER GROWTH
-- =====================================================

-- Seller verification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 100.0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_time_hours INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_handle TEXT;

-- Listing performance
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,4) DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 50.0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS setup_difficulty TEXT DEFAULT 'medium';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS use_cases TEXT[];

-- Trigger for purchase tracking
CREATE OR REPLACE FUNCTION update_listing_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('paid', 'completed') AND OLD.status NOT IN ('paid', 'completed') THEN
        UPDATE listings
        SET purchase_count = purchase_count + 1,
            last_sold_at = NOW(),
            conversion_rate = CASE WHEN view_count > 0 THEN (purchase_count + 1)::DECIMAL / view_count ELSE 0 END
        WHERE id = NEW.listing_id;
        
        UPDATE profiles SET total_sales = COALESCE(total_sales, 0) + 1 WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_listing_on_purchase ON orders;
CREATE TRIGGER trigger_update_listing_on_purchase
    AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_listing_on_purchase();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified_seller) WHERE is_verified_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_purchase_count ON listings(purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_listings_quality_score ON listings(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_last_sold ON listings(last_sold_at DESC NULLS LAST);

-- =====================================================
-- 021: MONETIZATION
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    plan_type TEXT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS featured_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO featured_pricing (plan_type, duration_days, price) VALUES
    ('7day', 7, 499), ('14day', 14, 799), ('30day', 30, 1299)
ON CONFLICT (plan_type) DO NOTHING;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION sync_featured_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.starts_at <= NOW() AND NEW.ends_at > NOW() THEN
        UPDATE listings SET is_featured = TRUE, featured_until = NEW.ends_at WHERE id = NEW.listing_id;
    ELSIF NEW.status IN ('completed', 'cancelled', 'expired') OR NEW.ends_at <= NOW() THEN
        UPDATE listings SET is_featured = FALSE, featured_until = NULL WHERE id = NEW.listing_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_featured_status ON featured_listings;
CREATE TRIGGER trigger_sync_featured_status
    AFTER INSERT OR UPDATE ON featured_listings FOR EACH ROW EXECUTE FUNCTION sync_featured_status();

CREATE INDEX IF NOT EXISTS idx_featured_listings_status ON featured_listings(status, ends_at);
CREATE INDEX IF NOT EXISTS idx_featured_listings_active ON featured_listings(listing_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;

ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own featured listings" ON featured_listings FOR SELECT USING (seller_id = auth.uid());
CREATE POLICY "Admins can view all featured listings" ON featured_listings FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Anyone can view featured pricing" ON featured_pricing FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- 022: RETENTION
-- =====================================================

CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    query TEXT,
    filters JSONB DEFAULT '{}',
    notify_on_new BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, seller_id),
    CHECK (follower_id != seller_id)
);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email_order_updates BOOLEAN DEFAULT TRUE,
    email_review_received BOOLEAN DEFAULT TRUE,
    email_new_from_followed BOOLEAN DEFAULT TRUE,
    email_saved_search_matches BOOLEAN DEFAULT TRUE,
    email_price_drops BOOLEAN DEFAULT TRUE,
    email_marketing BOOLEAN DEFAULT FALSE,
    push_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
    AFTER INSERT OR DELETE ON seller_follows FOR EACH ROW EXECUTE FUNCTION update_follower_count();

CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_wishlists_listing ON wishlists(listing_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_follower ON seller_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_seller_follows_seller ON seller_follows(seller_id);
CREATE INDEX IF NOT EXISTS idx_profiles_followers ON profiles(follower_count DESC) WHERE is_seller = TRUE;

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their wishlist" ON wishlists FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can manage their saved searches" ON saved_searches FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can manage their follows" ON seller_follows FOR ALL USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Anyone can see seller follow status" ON seller_follows FOR SELECT USING (TRUE);
CREATE POLICY "Users can manage their notification preferences" ON notification_preferences FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =====================================================
-- DONE! All Phase 5 migrations applied safely.
-- =====================================================
