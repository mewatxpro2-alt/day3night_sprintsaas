-- =====================================================
-- MIGRATION 031: BROKERED COMMUNICATION ENHANCEMENTS
-- Adds role-based visibility, source tracking, and
-- unifies Contact Us with the ticketing system
-- =====================================================

-- =====================================================
-- 1. ENHANCE MESSAGES TABLE
-- Add sender role, message type, and visibility
-- =====================================================

-- Add sender_role to identify who sent the message
ALTER TABLE messages ADD COLUMN IF NOT EXISTS sender_role TEXT 
  CHECK (sender_role IN ('buyer', 'seller', 'admin', 'system'));

-- Add message_type for different content types
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text', 'file', 'system', 'status_update'));

-- Add visibility for admin-only notes
ALTER TABLE messages ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all'
  CHECK (visibility IN ('all', 'admin_only', 'internal'));

-- Backfill sender_role based on existing data
UPDATE messages m
SET sender_role = CASE 
  WHEN m.sender_id = (SELECT buyer_id FROM orders WHERE id = m.order_id) THEN 'buyer'
  WHEN m.sender_id = (SELECT seller_id FROM orders WHERE id = m.order_id) THEN 'seller'
  ELSE 'buyer' -- Default fallback
END
WHERE sender_role IS NULL;

-- =====================================================
-- 2. ENHANCE TICKETS TABLE
-- Add source tracking for Contact Us integration
-- =====================================================

-- Add source to track where ticket originated
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'order'
  CHECK (source IN ('order', 'contact_us', 'dispute', 'direct', 'refund'));

-- Add contact_email for anonymous Contact Us submissions
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add contact_name for anonymous users
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Add converted_from to link to original contact_message if migrated
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS converted_from UUID;

-- Add listing_id for pre-purchase inquiries
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES listings(id);

-- =====================================================
-- 3. ENHANCE ORDERS TABLE
-- Add communication tracking
-- =====================================================

-- Track last message for sorting
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- Track unread counts for buyer/seller
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unread_buyer_count INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unread_seller_count INTEGER DEFAULT 0;

-- =====================================================
-- 4. ADD TICKET_MESSAGES ENHANCEMENTS
-- Add sender_role for clarity
-- =====================================================

ALTER TABLE ticket_messages ADD COLUMN IF NOT EXISTS sender_role TEXT
  CHECK (sender_role IN ('buyer', 'seller', 'admin', 'system'));

ALTER TABLE ticket_messages ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'all'
  CHECK (visibility IN ('all', 'admin_only'));

-- =====================================================
-- 5. CREATE TRIGGER TO UPDATE ORDER MESSAGE TRACKING
-- =====================================================

CREATE OR REPLACE FUNCTION update_order_message_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_message_at
  UPDATE orders 
  SET last_message_at = NOW()
  WHERE id = NEW.order_id;
  
  -- Increment unread count for receiver
  IF NEW.sender_role = 'buyer' THEN
    UPDATE orders 
    SET unread_seller_count = unread_seller_count + 1
    WHERE id = NEW.order_id;
  ELSIF NEW.sender_role = 'seller' THEN
    UPDATE orders 
    SET unread_buyer_count = unread_buyer_count + 1
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_order_on_message ON messages;
CREATE TRIGGER update_order_on_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_order_message_tracking();

-- =====================================================
-- 6. CREATE FUNCTION TO RESET UNREAD COUNTS
-- Called when user views messages
-- =====================================================

CREATE OR REPLACE FUNCTION mark_order_messages_read(p_order_id UUID, p_user_role TEXT)
RETURNS void AS $$
BEGIN
  IF p_user_role = 'buyer' THEN
    UPDATE orders SET unread_buyer_count = 0 WHERE id = p_order_id;
    UPDATE messages SET is_read = TRUE, read_at = NOW() 
    WHERE order_id = p_order_id AND sender_role != 'buyer' AND is_read = FALSE;
  ELSIF p_user_role = 'seller' THEN
    UPDATE orders SET unread_seller_count = 0 WHERE id = p_order_id;
    UPDATE messages SET is_read = TRUE, read_at = NOW() 
    WHERE order_id = p_order_id AND sender_role != 'seller' AND is_read = FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. INDEXES FOR NEW COLUMNS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_messages_sender_role ON messages(sender_role);
CREATE INDEX IF NOT EXISTS idx_messages_visibility ON messages(visibility);
CREATE INDEX IF NOT EXISTS idx_tickets_source ON tickets(source);
CREATE INDEX IF NOT EXISTS idx_tickets_contact_email ON tickets(contact_email);
CREATE INDEX IF NOT EXISTS idx_tickets_listing ON tickets(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_last_message ON orders(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_unread_buyer ON orders(unread_buyer_count) WHERE unread_buyer_count > 0;
CREATE INDEX IF NOT EXISTS idx_orders_unread_seller ON orders(unread_seller_count) WHERE unread_seller_count > 0;

-- =====================================================
-- 8. UPDATE RLS FOR VISIBILITY
-- Admin can see all, users see only 'all' visibility
-- =====================================================

-- Drop existing message policies if they exist
DROP POLICY IF EXISTS "Users can view order messages" ON messages;
DROP POLICY IF EXISTS "Participants can view messages" ON messages;

-- New policy: Participants see 'all' visibility, admin sees everything
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    (
      -- User is buyer or seller on the order
      order_id IN (
        SELECT id FROM orders 
        WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
      )
      AND visibility = 'all'
    )
    OR
    -- Admin sees everything
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN messages.sender_role IS 'Role of sender: buyer, seller, admin, or system';
COMMENT ON COLUMN messages.message_type IS 'Type of message: text, file, system, status_update';
COMMENT ON COLUMN messages.visibility IS 'Who can see: all (buyer+seller+admin), admin_only, internal';
COMMENT ON COLUMN tickets.source IS 'Origin: order, contact_us, dispute, direct, refund';
COMMENT ON COLUMN tickets.contact_email IS 'Email for anonymous Contact Us submissions';
COMMENT ON COLUMN orders.last_message_at IS 'Timestamp of last message for sorting';
COMMENT ON COLUMN orders.unread_buyer_count IS 'Number of unread messages for buyer';
COMMENT ON COLUMN orders.unread_seller_count IS 'Number of unread messages for seller';
