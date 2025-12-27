-- =====================================================
-- PHASE 19: LICENSING MODEL
-- Migration 027: License Types, Quantities, and Tracking
-- =====================================================

-- 1. ADD LICENSE FIELDS TO LISTINGS TABLE
-- =====================================================

-- Standard License (default, many buyers)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_standard_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_standard_price DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_standard_max INTEGER DEFAULT 20;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_standard_sold INTEGER DEFAULT 0;

-- Extended License (fewer buyers, higher price)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_extended_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_extended_price DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_extended_max INTEGER DEFAULT 5;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_extended_sold INTEGER DEFAULT 0;

-- Buyout License (exclusive, single buyer)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_buyout_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_buyout_price DECIMAL(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_buyout_sold BOOLEAN DEFAULT FALSE;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS license_buyout_requires_approval BOOLEAN DEFAULT TRUE;

-- 2. ADD LICENSE TYPE TO ORDERS TABLE
-- =====================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS license_type TEXT DEFAULT 'standard';

-- Add check constraint (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_license_type_check'
    ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_license_type_check
            CHECK (license_type IN ('standard', 'extended', 'buyout'));
    END IF;
END $$;

-- 3. ATOMIC LICENSE DECREMENT FUNCTION
-- =====================================================
-- This function safely decrements license quantity and returns success/failure
-- It prevents overselling by using row-level locking

CREATE OR REPLACE FUNCTION purchase_license(
    p_listing_id UUID,
    p_license_type TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_listing listings%ROWTYPE;
    v_available INTEGER;
    v_max INTEGER;
    v_sold INTEGER;
    v_price DECIMAL(10,2);
    v_enabled BOOLEAN;
BEGIN
    -- Lock the row for update to prevent race conditions
    SELECT * INTO v_listing
    FROM listings
    WHERE id = p_listing_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Listing not found');
    END IF;

    -- Check based on license type
    CASE p_license_type
        WHEN 'standard' THEN
            v_enabled := v_listing.license_standard_enabled;
            v_max := v_listing.license_standard_max;
            v_sold := v_listing.license_standard_sold;
            v_price := COALESCE(v_listing.license_standard_price, v_listing.price);
        WHEN 'extended' THEN
            v_enabled := v_listing.license_extended_enabled;
            v_max := v_listing.license_extended_max;
            v_sold := v_listing.license_extended_sold;
            v_price := v_listing.license_extended_price;
        WHEN 'buyout' THEN
            v_enabled := v_listing.license_buyout_enabled;
            v_max := 1;
            v_sold := CASE WHEN v_listing.license_buyout_sold THEN 1 ELSE 0 END;
            v_price := v_listing.license_buyout_price;
        ELSE
            RETURN jsonb_build_object('success', false, 'error', 'Invalid license type');
    END CASE;

    -- Verify license is enabled
    IF NOT v_enabled THEN
        RETURN jsonb_build_object('success', false, 'error', 'License type not available');
    END IF;

    -- Check availability
    v_available := v_max - v_sold;
    IF v_available <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'License sold out');
    END IF;

    -- Decrement available quantity
    CASE p_license_type
        WHEN 'standard' THEN
            UPDATE listings SET license_standard_sold = license_standard_sold + 1
            WHERE id = p_listing_id;
        WHEN 'extended' THEN
            UPDATE listings SET license_extended_sold = license_extended_sold + 1
            WHERE id = p_listing_id;
        WHEN 'buyout' THEN
            UPDATE listings SET 
                license_buyout_sold = TRUE,
                is_live = FALSE  -- Remove from marketplace
            WHERE id = p_listing_id;
    END CASE;

    RETURN jsonb_build_object(
        'success', true,
        'price', v_price,
        'remaining', v_available - 1
    );
END;
$$;

-- 4. HELPER VIEW: LICENSE AVAILABILITY
-- =====================================================

CREATE OR REPLACE VIEW listing_license_availability AS
SELECT
    id,
    title,
    -- Standard
    license_standard_enabled,
    COALESCE(license_standard_price, price) as license_standard_price,
    license_standard_max,
    license_standard_sold,
    license_standard_max - license_standard_sold as license_standard_remaining,
    -- Extended
    license_extended_enabled,
    license_extended_price,
    license_extended_max,
    license_extended_sold,
    license_extended_max - license_extended_sold as license_extended_remaining,
    -- Buyout
    license_buyout_enabled,
    license_buyout_price,
    license_buyout_sold,
    NOT license_buyout_sold as license_buyout_available,
    license_buyout_requires_approval
FROM listings
WHERE is_live = TRUE;

-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_listings_license_standard ON listings(license_standard_enabled) WHERE license_standard_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_license_extended ON listings(license_extended_enabled) WHERE license_extended_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_license_buyout ON listings(license_buyout_enabled) WHERE license_buyout_enabled = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_license_type ON orders(license_type);

-- 6. UPDATE EXISTING LISTINGS (backfill defaults)
-- =====================================================

UPDATE listings
SET 
    license_standard_price = price,
    license_standard_enabled = TRUE,
    license_standard_max = 20,
    license_standard_sold = 0
WHERE license_standard_price IS NULL;

-- 7. RLS POLICY FOR VIEW
-- =====================================================

-- Allow all authenticated users to read license availability
DROP POLICY IF EXISTS "Anyone can view license availability" ON listings;
-- (View inherits from listings table RLS)

COMMENT ON FUNCTION purchase_license IS 'Atomically purchases a license, decrementing availability. Returns {success, price, remaining} or {success: false, error}.';
