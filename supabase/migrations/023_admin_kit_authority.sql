-- =============================================
-- 023: Admin Kit Authority
-- Full admin control over MVP kits with audit logging
-- =============================================

-- 1. Create admin_actions audit table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action_type TEXT NOT NULL, -- 'approve', 'reject', 'unpublish', 'publish', 'edit', 'soft_delete'
    target_type TEXT NOT NULL, -- 'submission', 'listing'
    target_id UUID NOT NULL,
    changes JSONB, -- What was changed (for edit actions)
    reason TEXT, -- Reason for reject/unpublish
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at DESC);

-- 2. Add soft delete column to listings if not exists
ALTER TABLE listings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 3. Ensure moderation_status column supports all required statuses
-- (already exists from 012_trust_safety.sql, just documenting valid values)
-- Valid values: 'pending_review', 'approved', 'live', 'rejected', 'unpublished', 'featured'
COMMENT ON COLUMN listings.moderation_status IS 'Status values: pending_review, approved, live, rejected, unpublished, featured';

-- 4. RLS for admin_actions table
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Admin can view all actions
DROP POLICY IF EXISTS "admin_view_actions" ON admin_actions;
CREATE POLICY "admin_view_actions"
ON admin_actions FOR SELECT
USING (auth.email() = 'tadmin@gmail.com');

-- Admin can insert actions (logging)
DROP POLICY IF EXISTS "admin_insert_actions" ON admin_actions;
CREATE POLICY "admin_insert_actions"
ON admin_actions FOR INSERT
WITH CHECK (auth.email() = 'tadmin@gmail.com');

-- 5. Update listings RLS to filter by moderation_status for public
-- Drop old policy if exists
DROP POLICY IF EXISTS "public_view_live_listings" ON listings;
DROP POLICY IF EXISTS "Public can view live listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view live listings" ON listings;

-- Public can view live listings (for list views AND detail views)
-- This allows both the Explore page listing AND the Details page access
CREATE POLICY "public_view_live_listings"
ON listings FOR SELECT
TO anon, authenticated
USING (
    moderation_status = 'live' 
    AND is_live = true 
    AND deleted_at IS NULL
);

-- Sellers can see their own listings regardless of status
DROP POLICY IF EXISTS "sellers_view_own_listings" ON listings;
CREATE POLICY "sellers_view_own_listings"
ON listings FOR SELECT
USING (creator_id = auth.uid());

-- Admin can see all listings
DROP POLICY IF EXISTS "admin_view_all_listings" ON listings;
CREATE POLICY "admin_view_all_listings"
ON listings FOR SELECT
USING (auth.email() = 'tadmin@gmail.com');

-- Admin can update any listing
DROP POLICY IF EXISTS "admin_update_listings" ON listings;
CREATE POLICY "admin_update_listings"
ON listings FOR UPDATE
USING (auth.email() = 'tadmin@gmail.com')
WITH CHECK (auth.email() = 'tadmin@gmail.com');

-- Verify tables
SELECT 'admin_actions table created' AS status;
SELECT 'listings updated with deleted_at and RLS' AS status;
