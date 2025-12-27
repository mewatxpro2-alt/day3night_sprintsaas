-- =====================================================
-- PHASE 5: MONETIZATION EXPANSION
-- Migration 021: Featured Listings & Premium Features
-- =====================================================

-- =====================================================
-- 1. FEATURED LISTINGS (Paid Promotion)
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Plan details
    plan_type TEXT NOT NULL, -- '7day', '14day', '30day'
    amount_paid DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    
    -- Timing
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Performance tracking
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending',
    -- 'pending', 'active', 'completed', 'cancelled', 'expired'
    
    -- Payment reference
    payment_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add featured flag to listings for quick lookup
ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- =====================================================
-- 2. FEATURED LISTING PRICING
-- =====================================================

CREATE TABLE IF NOT EXISTS featured_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_type TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO featured_pricing (plan_type, duration_days, price) VALUES
    ('7day', 7, 499),
    ('14day', 14, 799),
    ('30day', 30, 1299)
ON CONFLICT (plan_type) DO NOTHING;

-- =====================================================
-- 3. SELLER SUBSCRIPTIONS (Future-Ready)
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
-- Tiers: 'free', 'pro', 'business'

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Subscription tier benefits reference
COMMENT ON COLUMN profiles.subscription_tier IS 
'Subscription tiers:
- free: 3 listings max, 10% commission
- pro: 10 listings, 8% commission, priority support
- business: Unlimited listings, 6% commission, dedicated support';

-- =====================================================
-- 4. TRIGGERS: Auto-update featured status
-- =====================================================

-- Function to sync featured status to listing
CREATE OR REPLACE FUNCTION sync_featured_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.starts_at <= NOW() AND NEW.ends_at > NOW() THEN
        UPDATE listings
        SET is_featured = TRUE, featured_until = NEW.ends_at
        WHERE id = NEW.listing_id;
    ELSIF NEW.status IN ('completed', 'cancelled', 'expired') OR NEW.ends_at <= NOW() THEN
        UPDATE listings
        SET is_featured = FALSE, featured_until = NULL
        WHERE id = NEW.listing_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_featured_status ON featured_listings;
CREATE TRIGGER trigger_sync_featured_status
    AFTER INSERT OR UPDATE ON featured_listings
    FOR EACH ROW
    EXECUTE FUNCTION sync_featured_status();

-- =====================================================
-- 5. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_featured_listings_status ON featured_listings(status, ends_at);
CREATE INDEX IF NOT EXISTS idx_featured_listings_active ON featured_listings(listing_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_featured ON listings(is_featured) WHERE is_featured = TRUE;

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own featured listings
CREATE POLICY "Sellers can view own featured listings"
    ON featured_listings FOR SELECT
    USING (seller_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all featured listings"
    ON featured_listings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Featured pricing is public
ALTER TABLE featured_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured pricing"
    ON featured_pricing FOR SELECT
    USING (is_active = TRUE);
