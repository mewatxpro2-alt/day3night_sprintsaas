-- =====================================================
-- PHASE 4C: PERFORMANCE & SEARCH OPTIMIZATION
-- Migration 015: Full-Text Search, Indexes, Pagination
-- =====================================================

-- =====================================================
-- 1. FULL-TEXT SEARCH FOR LISTINGS
-- =====================================================

-- Add search vector column
ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_listings_search_vector 
ON listings USING GIN(search_vector);

-- Function to generate search vector from listing data
CREATE OR REPLACE FUNCTION generate_listing_search_vector()
RETURNS TRIGGER AS $$
DECLARE
    category_name TEXT;
BEGIN
    -- Get category title for inclusion in search
    SELECT title INTO category_name
    FROM categories
    WHERE id = NEW.category_id;

    -- Build weighted search vector
    -- A = highest weight (title)
    -- B = high weight (category)
    -- C = medium weight (description)
    -- D = low weight (tags, tech stack)
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(category_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tech_stack, ' '), '')), 'D');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search vector
DROP TRIGGER IF EXISTS trigger_listings_search_vector ON listings;
CREATE TRIGGER trigger_listings_search_vector
    BEFORE INSERT OR UPDATE OF title, description, category_id, tech_stack
    ON listings
    FOR EACH ROW
    EXECUTE FUNCTION generate_listing_search_vector();

-- Backfill existing listings
UPDATE listings SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE((SELECT title FROM categories WHERE id = listings.category_id), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(tech_stack, ' '), '')), 'D');

-- =====================================================
-- 2. COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Explore page: Live listings sorted by various criteria
CREATE INDEX IF NOT EXISTS idx_listings_live_featured 
ON listings(is_live, is_featured DESC, created_at DESC) 
WHERE is_live = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_live_created 
ON listings(is_live, created_at DESC) 
WHERE is_live = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_live_price 
ON listings(is_live, price ASC) 
WHERE is_live = TRUE;

CREATE INDEX IF NOT EXISTS idx_listings_live_rating 
ON listings(is_live, rating_average DESC) 
WHERE is_live = TRUE AND rating_count > 0;

-- Category filtering
CREATE INDEX IF NOT EXISTS idx_listings_category_live 
ON listings(category_id, is_live, created_at DESC) 
WHERE is_live = TRUE;

-- Price range queries
CREATE INDEX IF NOT EXISTS idx_listings_price_range 
ON listings(price, is_live) 
WHERE is_live = TRUE;

-- Seller's listings
CREATE INDEX IF NOT EXISTS idx_listings_creator 
ON listings(creator_id, created_at DESC);

-- Featured listings (for homepage)
CREATE INDEX IF NOT EXISTS idx_listings_featured 
ON listings(is_featured, created_at DESC) 
WHERE is_featured = TRUE AND is_live = TRUE;

-- =====================================================
-- 3. ORDER & PAYMENT INDEXES
-- =====================================================

-- Buyer's orders
CREATE INDEX IF NOT EXISTS idx_orders_buyer 
ON orders(buyer_id, created_at DESC);

-- Seller's orders
CREATE INDEX IF NOT EXISTS idx_orders_seller 
ON orders(seller_id, created_at DESC);

-- Order status filtering
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status, created_at DESC);

-- Payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_order 
ON payments(order_id);

CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(status);

-- Note: Payouts table index removed - table will be created in future migration

-- =====================================================
-- 4. CURSOR PAGINATION SUPPORT
-- =====================================================

-- Function to support cursor-based pagination on listings
CREATE OR REPLACE FUNCTION get_listings_page(
    p_cursor_created_at TIMESTAMPTZ DEFAULT NULL,
    p_cursor_id UUID DEFAULT NULL,
    p_limit INT DEFAULT 20,
    p_category_id UUID DEFAULT NULL,
    p_min_price DECIMAL DEFAULT NULL,
    p_max_price DECIMAL DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'created_at'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price DECIMAL,
    image_url TEXT,
    is_featured BOOLEAN,
    rating_average DECIMAL,
    rating_count INT,
    created_at TIMESTAMPTZ,
    creator_id UUID,
    category_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.image_url,
        l.is_featured,
        l.rating_average,
        l.rating_count,
        l.created_at,
        l.creator_id,
        l.category_id
    FROM listings l
    WHERE l.is_live = TRUE
    AND (l.moderation_status IS NULL OR l.moderation_status IN ('approved', 'featured'))
    -- Category filter
    AND (p_category_id IS NULL OR l.category_id = p_category_id)
    -- Price range filter
    AND (p_min_price IS NULL OR l.price >= p_min_price)
    AND (p_max_price IS NULL OR l.price <= p_max_price)
    -- Full-text search filter
    AND (
        p_search_query IS NULL 
        OR l.search_vector @@ plainto_tsquery('english', p_search_query)
    )
    -- Cursor pagination (keyset)
    AND (
        p_cursor_created_at IS NULL 
        OR (l.created_at, l.id) < (p_cursor_created_at, p_cursor_id)
    )
    ORDER BY 
        CASE WHEN p_sort_by = 'featured' THEN l.is_featured END DESC NULLS LAST,
        CASE WHEN p_sort_by = 'price_asc' THEN l.price END ASC,
        CASE WHEN p_sort_by = 'price_desc' THEN l.price END DESC,
        CASE WHEN p_sort_by = 'rating' THEN l.rating_average END DESC NULLS LAST,
        l.created_at DESC,
        l.id DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 5. PROFILE PERFORMANCE INDEXES
-- =====================================================

-- Email lookups (for auth)
CREATE INDEX IF NOT EXISTS idx_profiles_email 
ON profiles(email) 
WHERE email IS NOT NULL;

-- Seller lookups
CREATE INDEX IF NOT EXISTS idx_profiles_seller 
ON profiles(is_seller, created_at DESC) 
WHERE is_seller = TRUE;

-- Admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_admin 
ON profiles(role) 
WHERE role = 'admin';

-- =====================================================
-- 6. MESSAGE & DISPUTE INDEXES
-- =====================================================

-- Messages by order
CREATE INDEX IF NOT EXISTS idx_messages_order 
ON messages(order_id, created_at DESC);

-- Disputes by status
CREATE INDEX IF NOT EXISTS idx_disputes_status 
ON disputes(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_disputes_order 
ON disputes(order_id);

-- =====================================================
-- 7. MATERIALIZED VIEW FOR DASHBOARD STATS (Optional)
-- =====================================================

-- This can be refreshed periodically for admin dashboard
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles) AS total_users,
    (SELECT COUNT(*) FROM profiles WHERE is_seller = TRUE) AS total_sellers,
    (SELECT COUNT(*) FROM listings WHERE is_live = TRUE) AS total_listings,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COALESCE(SUM(price_amount), 0) FROM orders WHERE status = 'completed') AS total_revenue,
    (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS completed_orders,
    (SELECT COUNT(*) FROM disputes WHERE status = 'open') AS open_disputes,
    NOW() AS refreshed_at;

-- Create index for fast refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_platform_stats_refresh 
ON mv_platform_stats(refreshed_at);

-- Function to refresh stats
CREATE OR REPLACE FUNCTION refresh_platform_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_platform_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
