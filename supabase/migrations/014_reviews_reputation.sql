-- =====================================================
-- PHASE 4B: REVIEWS & REPUTATION SYSTEM
-- Migration 014: Reviews, Seller Ratings, Trust Levels
-- =====================================================

-- =====================================================
-- 1. REVIEWS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links (verified purchase enforcement)
    order_id UUID REFERENCES orders(id) NOT NULL UNIQUE, -- One review per order
    reviewer_id UUID REFERENCES profiles(id) NOT NULL,   -- The buyer
    seller_id UUID REFERENCES profiles(id) NOT NULL,     -- The seller being reviewed
    listing_id UUID REFERENCES listings(id) NOT NULL,    -- The product reviewed
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT, -- Optional headline
    comment TEXT, -- Review body
    
    -- Quality Signals
    is_verified_purchase BOOLEAN DEFAULT TRUE, -- Always true for order-linked reviews
    helpful_count INTEGER DEFAULT 0, -- How many found this helpful
    
    -- Moderation
    is_visible BOOLEAN DEFAULT TRUE, -- Can be hidden by admin
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    moderated_by UUID REFERENCES profiles(id),
    moderated_at TIMESTAMPTZ,
    
    -- Seller Response
    seller_response TEXT,
    seller_response_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. ENHANCE PROFILES FOR SELLER REPUTATION
-- =====================================================

-- Seller rating aggregates (materialized for performance)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_average DECIMAL(2,1) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- Seller trust level (computed from behavior)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seller_level TEXT DEFAULT 'new';
-- Levels: 'new', 'rising', 'established', 'trusted', 'top_seller'

-- Level criteria stored for reference
COMMENT ON COLUMN profiles.seller_level IS 
'Seller levels:
- new: < 3 sales
- rising: 3-10 sales, rating >= 3.5
- established: 11-50 sales, rating >= 4.0
- trusted: 51-100 sales, rating >= 4.5
- top_seller: 100+ sales, rating >= 4.8';

-- =====================================================
-- 3. ENHANCE LISTINGS FOR REVIEW AGGREGATES
-- =====================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS rating_average DECIMAL(2,1) DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Reviews queries
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(listing_id, is_visible) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Profile ratings
CREATE INDEX IF NOT EXISTS idx_profiles_rating ON profiles(rating_average DESC) WHERE rating_count > 0;
CREATE INDEX IF NOT EXISTS idx_profiles_seller_level ON profiles(seller_level) WHERE is_seller = TRUE;

-- Listing ratings
CREATE INDEX IF NOT EXISTS idx_listings_rating ON listings(rating_average DESC) WHERE rating_count > 0;

-- =====================================================
-- 5. TRIGGERS: Auto-update aggregates on review changes
-- =====================================================

-- Function to recalculate seller rating
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id UUID;
    v_avg DECIMAL(2,1);
    v_count INTEGER;
    v_level TEXT;
    v_total_sales INTEGER;
BEGIN
    -- Determine seller_id based on operation
    IF TG_OP = 'DELETE' THEN
        v_seller_id := OLD.seller_id;
    ELSE
        v_seller_id := NEW.seller_id;
    END IF;
    
    -- Calculate new aggregate
    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE seller_id = v_seller_id
    AND is_visible = TRUE;
    
    -- Get total sales count
    SELECT total_sales INTO v_total_sales
    FROM profiles
    WHERE id = v_seller_id;
    
    v_total_sales := COALESCE(v_total_sales, 0);
    
    -- Determine seller level
    IF v_total_sales < 3 THEN
        v_level := 'new';
    ELSIF v_total_sales <= 10 AND v_avg >= 3.5 THEN
        v_level := 'rising';
    ELSIF v_total_sales <= 50 AND v_avg >= 4.0 THEN
        v_level := 'established';
    ELSIF v_total_sales <= 100 AND v_avg >= 4.5 THEN
        v_level := 'trusted';
    ELSIF v_total_sales > 100 AND v_avg >= 4.8 THEN
        v_level := 'top_seller';
    ELSE
        v_level := 'new';
    END IF;
    
    -- Update profile
    UPDATE profiles
    SET 
        rating_average = v_avg,
        rating_count = v_count,
        seller_level = v_level
    WHERE id = v_seller_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for seller rating updates
DROP TRIGGER IF EXISTS trigger_update_seller_rating ON reviews;
CREATE TRIGGER trigger_update_seller_rating
    AFTER INSERT OR UPDATE OF rating, is_visible OR DELETE
    ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_rating();

-- Function to recalculate listing rating
CREATE OR REPLACE FUNCTION update_listing_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_listing_id UUID;
    v_avg DECIMAL(2,1);
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_listing_id := OLD.listing_id;
    ELSE
        v_listing_id := NEW.listing_id;
    END IF;
    
    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0),
        COUNT(*)
    INTO v_avg, v_count
    FROM reviews
    WHERE listing_id = v_listing_id
    AND is_visible = TRUE;
    
    UPDATE listings
    SET 
        rating_average = v_avg,
        rating_count = v_count
    WHERE id = v_listing_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for listing rating updates
DROP TRIGGER IF EXISTS trigger_update_listing_rating ON reviews;
CREATE TRIGGER trigger_update_listing_rating
    AFTER INSERT OR UPDATE OF rating, is_visible OR DELETE
    ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_rating();

-- =====================================================
-- 6. UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reviews_updated_at ON reviews;
CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- =====================================================
-- 7. RLS POLICIES FOR REVIEWS
-- =====================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view visible reviews
CREATE POLICY "Anyone can view visible reviews"
    ON reviews
    FOR SELECT
    USING (is_visible = TRUE);

-- Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
    ON reviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Reviewer can view their own reviews
CREATE POLICY "Users can view their own reviews"
    ON reviews
    FOR SELECT
    USING (reviewer_id = auth.uid());

-- Users can create reviews for their orders
CREATE POLICY "Users can create reviews for their orders"
    ON reviews
    FOR INSERT
    WITH CHECK (
        -- Must be authenticated
        auth.uid() IS NOT NULL
        -- Must be the reviewer
        AND reviewer_id = auth.uid()
        -- Must own the order
        AND EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_id
            AND orders.buyer_id = auth.uid()
            AND orders.status IN ('paid', 'delivered', 'completed')
        )
    );

-- Users can update their own reviews (edit comment)
CREATE POLICY "Users can update their own reviews"
    ON reviews
    FOR UPDATE
    USING (reviewer_id = auth.uid())
    WITH CHECK (reviewer_id = auth.uid());

-- Sellers can respond to reviews on their listings
CREATE POLICY "Sellers can respond to reviews"
    ON reviews
    FOR UPDATE
    USING (seller_id = auth.uid())
    WITH CHECK (seller_id = auth.uid());

-- Admins can update any review (moderation)
CREATE POLICY "Admins can update any review"
    ON reviews
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- No delete policy - reviews are hidden, not deleted
