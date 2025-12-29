-- =====================================================
-- MIGRATION 034: ORDER STATUS HISTORY TRACKING
-- =====================================================
-- Purpose: Track all status changes for audit trail
-- Enables: Admin visibility into order lifecycle
-- =====================================================

-- 1. CREATE STATUS LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_order_status_log_order_id ON order_status_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_log_created_at ON order_status_log(created_at DESC);

-- =====================================================
-- 2. TRIGGER FUNCTION TO LOG STATUS CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_log (order_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_log_order_status ON orders;
CREATE TRIGGER trigger_log_order_status
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- =====================================================
-- 3. RLS POLICIES (Admin-Only Access)
-- =====================================================

ALTER TABLE order_status_log ENABLE ROW LEVEL SECURITY;

-- Admin can view all logs
DROP POLICY IF EXISTS "Admin can view order status logs" ON order_status_log;
CREATE POLICY "Admin can view order status logs"
    ON order_status_log
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Buyers/sellers can view logs for their orders
DROP POLICY IF EXISTS "Users can view own order logs" ON order_status_log;
CREATE POLICY "Users can view own order logs"
    ON order_status_log
    FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM orders 
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- =====================================================
-- 4. BACKFILL: Log initial status for existing orders
-- =====================================================

INSERT INTO order_status_log (order_id, old_status, new_status, reason, created_at)
SELECT 
    id,
    NULL,
    status,
    'Initial status (backfill)',
    created_at
FROM orders
WHERE NOT EXISTS (
    SELECT 1 FROM order_status_log osl WHERE osl.order_id = orders.id
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
