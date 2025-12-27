-- =====================================================
-- SECURE MESSAGING ENHANCEMENTS
-- Migration 019: Content Moderation & Admin Controls
-- =====================================================

-- 1. ADD CONVERSATION LOCKING SUPPORT
-- =====================================================
-- Admin can lock conversations during disputes or abuse
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_conversation_locked BOOLEAN DEFAULT FALSE;

-- Add a conversation-level lock on orders table for efficiency
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_locked_by UUID REFERENCES profiles(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS messages_lock_reason TEXT;

-- 2. CONTENT MODERATION FUNCTION
-- =====================================================
-- Block messages containing emails, phone numbers, payment links
CREATE OR REPLACE FUNCTION check_message_content()
RETURNS TRIGGER AS $$
DECLARE
    blocked_patterns TEXT[] := ARRAY[
        -- Email patterns
        '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
        -- Phone patterns (Indian format)
        '\+91[0-9]{10}',
        '[0-9]{10}',
        -- Payment link patterns
        'razorpay\.me',
        'paytm\.me',
        'gpay\.me',
        'phonepe\.me',
        'upi://',
        -- External contact patterns
        'whatsapp\.com',
        't\.me/',
        'telegram\.me',
        -- Generic contact requests
        'my number is',
        'call me at',
        'email me at',
        'contact me on',
        'text me on',
        'reach me at'
    ];
    pattern TEXT;
    order_locked BOOLEAN;
BEGIN
    -- Check if conversation is locked
    SELECT messages_locked INTO order_locked
    FROM orders WHERE id = NEW.order_id;
    
    IF order_locked THEN
        RAISE EXCEPTION 'This conversation has been locked by an administrator';
    END IF;

    -- Check content against blocked patterns
    FOREACH pattern IN ARRAY blocked_patterns
    LOOP
        IF NEW.content ~* pattern THEN
            RAISE EXCEPTION 'Message contains prohibited content. Please keep all communication within the platform.';
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for content moderation
DROP TRIGGER IF EXISTS moderate_message_content ON messages;
CREATE TRIGGER moderate_message_content
    BEFORE INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION check_message_content();

-- 3. UPDATE RLS POLICY TO RESPECT CONVERSATION LOCK
-- =====================================================
-- Drop existing insert policy and recreate with lock check
DROP POLICY IF EXISTS "Order participants can send messages" ON messages;

CREATE POLICY "Order participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.status IN ('paid', 'delivered', 'completed')
      AND orders.messages_locked = FALSE  -- NEW: Check conversation lock
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- 4. ADMIN FUNCTIONS FOR CONVERSATION MANAGEMENT
-- =====================================================

-- Function to lock a conversation
CREATE OR REPLACE FUNCTION admin_lock_conversation(
    target_order_id UUID,
    lock_reason TEXT DEFAULT 'Under review'
)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can lock conversations';
    END IF;

    UPDATE orders
    SET 
        messages_locked = TRUE,
        messages_locked_at = NOW(),
        messages_locked_by = auth.uid(),
        messages_lock_reason = lock_reason
    WHERE id = target_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unlock a conversation
CREATE OR REPLACE FUNCTION admin_unlock_conversation(target_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Only admins can unlock conversations';
    END IF;

    UPDATE orders
    SET 
        messages_locked = FALSE,
        messages_locked_at = NULL,
        messages_locked_by = NULL,
        messages_lock_reason = NULL
    WHERE id = target_order_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_orders_messages_locked 
ON orders(messages_locked) WHERE messages_locked = TRUE;

-- 6. GRANT EXECUTE TO AUTHENTICATED USERS
-- =====================================================
GRANT EXECUTE ON FUNCTION admin_lock_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION admin_unlock_conversation TO authenticated;
