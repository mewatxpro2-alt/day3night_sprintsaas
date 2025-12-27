-- =====================================================
-- PHASE 5: GROWTH & MONETIZATION
-- Migration 020: Seller Growth Infrastructure
-- =====================================================

-- =====================================================
-- 1. SELLER VERIFICATION & CREDIBILITY
-- =====================================================

-- Verification status (manual admin verification)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_requested_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Seller performance metrics
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completion_rate DECIMAL(5,2) DEFAULT 100.0;
-- % of orders completed without refund/dispute

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avg_response_time_hours INTEGER;
-- Average time to first message response

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
-- Seller bio for profile page

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website_url TEXT;
-- Portfolio/personal website

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_handle TEXT;

-- =====================================================
-- 2. LISTING PERFORMANCE TRACKING
-- =====================================================

-- View tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Conversion metrics
ALTER TABLE listings ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,4) DEFAULT 0;

-- Activity signals
ALTER TABLE listings ADD COLUMN IF NOT EXISTS last_sold_at TIMESTAMPTZ;

-- Quality score for ranking (computed by cron/trigger)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS quality_score DECIMAL(5,2) DEFAULT 50.0;

-- Setup difficulty for buyer clarity
ALTER TABLE listings ADD COLUMN IF NOT EXISTS setup_difficulty TEXT DEFAULT 'medium';
-- Values: 'easy', 'medium', 'advanced'

-- Intended use cases
ALTER TABLE listings ADD COLUMN IF NOT EXISTS use_cases TEXT[];

-- =====================================================
-- 3. TRIGGER: Update listing metrics on order completion
-- =====================================================

CREATE OR REPLACE FUNCTION update_listing_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger on status change to 'paid' or 'completed'
    IF NEW.status IN ('paid', 'completed') AND OLD.status NOT IN ('paid', 'completed') THEN
        -- Update purchase count and last sold
        UPDATE listings
        SET 
            purchase_count = purchase_count + 1,
            last_sold_at = NOW(),
            conversion_rate = CASE 
                WHEN view_count > 0 THEN (purchase_count + 1)::DECIMAL / view_count 
                ELSE 0 
            END
        WHERE id = NEW.listing_id;
        
        -- Update seller's total sales
        UPDATE profiles
        SET total_sales = COALESCE(total_sales, 0) + 1
        WHERE id = NEW.seller_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_listing_on_purchase ON orders;
CREATE TRIGGER trigger_update_listing_on_purchase
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_listing_on_purchase();

-- =====================================================
-- 4. TRIGGER: Update seller completion rate
-- =====================================================

CREATE OR REPLACE FUNCTION update_seller_completion_rate()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id UUID;
    v_total_orders INTEGER;
    v_completed_orders INTEGER;
    v_rate DECIMAL(5,2);
BEGIN
    v_seller_id := COALESCE(NEW.seller_id, OLD.seller_id);
    
    -- Count total orders (past payment stage)
    SELECT COUNT(*) INTO v_total_orders
    FROM orders
    WHERE seller_id = v_seller_id
    AND status IN ('paid', 'delivered', 'completed', 'refunded', 'disputed');
    
    -- Count successful completions
    SELECT COUNT(*) INTO v_completed_orders
    FROM orders
    WHERE seller_id = v_seller_id
    AND status IN ('completed', 'delivered');
    
    -- Calculate rate
    IF v_total_orders > 0 THEN
        v_rate := (v_completed_orders::DECIMAL / v_total_orders) * 100;
    ELSE
        v_rate := 100.0;
    END IF;
    
    -- Update profile
    UPDATE profiles
    SET completion_rate = v_rate
    WHERE id = v_seller_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_seller_completion_rate ON orders;
CREATE TRIGGER trigger_update_seller_completion_rate
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_completion_rate();

-- =====================================================
-- 5. FUNCTION: Calculate listing quality score
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_quality_score(p_listing_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    v_rating DECIMAL;
    v_conversion DECIMAL;
    v_recency_score DECIMAL;
    v_seller_score DECIMAL;
    v_final_score DECIMAL;
    v_listing RECORD;
    v_seller RECORD;
BEGIN
    -- Get listing data
    SELECT * INTO v_listing FROM listings WHERE id = p_listing_id;
    IF NOT FOUND THEN RETURN 0; END IF;
    
    -- Get seller data
    SELECT * INTO v_seller FROM profiles WHERE id = v_listing.seller_id;
    
    -- Rating score (0-100, scaled from 1-5)
    v_rating := COALESCE((v_listing.rating_average - 1) / 4 * 100, 50);
    
    -- Conversion score (0-100, scaled, capped at 10%)
    v_conversion := LEAST(v_listing.conversion_rate * 1000, 100);
    
    -- Recency score (100 if sold today, decays over 30 days)
    IF v_listing.last_sold_at IS NOT NULL THEN
        v_recency_score := GREATEST(100 - EXTRACT(DAY FROM NOW() - v_listing.last_sold_at) * 3.33, 0);
    ELSE
        v_recency_score := 20; -- Base score for never sold
    END IF;
    
    -- Seller score (verification + completion rate)
    v_seller_score := CASE WHEN v_seller.is_verified_seller THEN 20 ELSE 0 END
                    + COALESCE(v_seller.completion_rate * 0.5, 50);
    
    -- Weighted final score
    -- 35% rating + 25% conversion + 20% recency + 20% seller
    v_final_score := (v_rating * 0.35) + (v_conversion * 0.25) + (v_recency_score * 0.20) + (v_seller_score * 0.20);
    
    -- Update listing
    UPDATE listings SET quality_score = v_final_score WHERE id = p_listing_id;
    
    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified_seller) WHERE is_verified_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_purchase_count ON listings(purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_listings_quality_score ON listings(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_listings_last_sold ON listings(last_sold_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_listings_setup_difficulty ON listings(setup_difficulty);
