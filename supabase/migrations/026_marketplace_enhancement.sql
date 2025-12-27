-- =====================================================
-- MIGRATION 026: BLUEPRINT MARKETPLACE ENHANCEMENT
-- Kit Resources, Tickets, Refunds, Withdrawals
-- =====================================================

-- 1. KIT_RESOURCES: Seller-uploaded files (upfront delivery)
CREATE TABLE IF NOT EXISTS kit_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('zip', 'pdf', 'md', 'figma', 'video', 'image', 'other')),
  file_url TEXT NOT NULL,
  file_size_bytes BIGINT,
  description TEXT,
  linked_deliverable TEXT,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  is_locked BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT has_parent CHECK (submission_id IS NOT NULL OR listing_id IS NOT NULL)
);

-- 2. TICKETS: Support ticket system
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE,
  order_id UUID REFERENCES orders(id),
  
  created_by UUID REFERENCES profiles(id) NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('delivery_issue', 'clarification', 'refund_request', 'technical', 'other')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'waiting', 'under_review', 'resolved')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  involves_admin BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id)
);

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number ON tickets;
CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION generate_ticket_number();

-- 3. TICKET_MESSAGES: Messages within tickets (non-deletable)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  
  is_internal BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REFUND_REQUESTS: Refund tracking
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL UNIQUE,
  ticket_id UUID REFERENCES tickets(id),
  
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'approved', 'completed', 'rejected')),
  
  refund_amount DECIMAL(12,2),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SELLER_WITHDRAWALS: Withdrawal requests
CREATE TABLE IF NOT EXISTS seller_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  
  amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'paid', 'rejected')),
  
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'upi')),
  bank_account_holder TEXT,
  bank_name TEXT,
  bank_account_last4 TEXT,
  bank_ifsc TEXT,
  upi_id TEXT,
  
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  admin_notes TEXT,
  processed_by UUID REFERENCES profiles(id)
);

-- 6. Update PROFILES: Add seller balance tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS available_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(12,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS withdrawn_total DECIMAL(12,2) DEFAULT 0;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_kit_resources_submission ON kit_resources(submission_id);
CREATE INDEX IF NOT EXISTS idx_kit_resources_listing ON kit_resources(listing_id);
CREATE INDEX IF NOT EXISTS idx_kit_resources_locked ON kit_resources(is_locked);

CREATE INDEX IF NOT EXISTS idx_tickets_order ON tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_by ON tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_buyer ON tickets(buyer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_seller ON tickets(seller_id);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

CREATE INDEX IF NOT EXISTS idx_seller_withdrawals_seller ON seller_withdrawals(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_withdrawals_status ON seller_withdrawals(status);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE kit_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_withdrawals ENABLE ROW LEVEL SECURITY;

-- Kit Resources: Seller can manage own, buyers can view purchased
DROP POLICY IF EXISTS "Sellers can manage own resources" ON kit_resources;
CREATE POLICY "Sellers can manage own resources" ON kit_resources
  FOR ALL USING (
    submission_id IN (SELECT id FROM submissions WHERE user_id = auth.uid())
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Buyers can view purchased resources" ON kit_resources;
CREATE POLICY "Buyers can view purchased resources" ON kit_resources
  FOR SELECT USING (
    listing_id IN (
      SELECT listing_id FROM orders 
      WHERE buyer_id = auth.uid() 
      AND status IN ('paid', 'delivered', 'completed')
    )
    OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tickets: Participants can view/create
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (
    created_by = auth.uid() 
    OR buyer_id = auth.uid() 
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
CREATE POLICY "Users can create tickets" ON tickets
  FOR INSERT WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Participants can update tickets" ON tickets;
CREATE POLICY "Participants can update tickets" ON tickets
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR buyer_id = auth.uid() 
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ticket Messages: Participants can view/create
DROP POLICY IF EXISTS "Participants can view ticket messages" ON ticket_messages;
CREATE POLICY "Participants can view ticket messages" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets 
      WHERE created_by = auth.uid() 
      OR buyer_id = auth.uid() 
      OR seller_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Participants can create ticket messages" ON ticket_messages;
CREATE POLICY "Participants can create ticket messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND ticket_id IN (
      SELECT id FROM tickets 
      WHERE created_by = auth.uid() 
      OR buyer_id = auth.uid() 
      OR seller_id = auth.uid()
    )
  );

-- Refund Requests: Buyer can view own, admin can manage all
DROP POLICY IF EXISTS "Users can view own refund requests" ON refund_requests;
CREATE POLICY "Users can view own refund requests" ON refund_requests
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid() OR seller_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Buyers can create refund requests" ON refund_requests;
CREATE POLICY "Buyers can create refund requests" ON refund_requests
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admin can update refund requests" ON refund_requests;
CREATE POLICY "Admin can update refund requests" ON refund_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seller Withdrawals: Seller can view/create own, admin can manage all
DROP POLICY IF EXISTS "Sellers can view own withdrawals" ON seller_withdrawals;
CREATE POLICY "Sellers can view own withdrawals" ON seller_withdrawals
  FOR SELECT USING (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Sellers can create withdrawals" ON seller_withdrawals;
CREATE POLICY "Sellers can create withdrawals" ON seller_withdrawals
  FOR INSERT WITH CHECK (seller_id = auth.uid());

DROP POLICY IF EXISTS "Admin can update withdrawals" ON seller_withdrawals;
CREATE POLICY "Admin can update withdrawals" ON seller_withdrawals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to update seller balance after completed order
CREATE OR REPLACE FUNCTION update_seller_balance_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    -- Add to pending balance (will become available after payout delay)
    UPDATE profiles 
    SET pending_balance = pending_balance + NEW.seller_amount
    WHERE id = NEW.seller_id;
  END IF;
  
  IF NEW.status = 'refunded' AND OLD.status = 'paid' THEN
    -- Deduct from pending or available balance
    UPDATE profiles 
    SET pending_balance = GREATEST(0, pending_balance - NEW.seller_amount),
        available_balance = GREATEST(0, available_balance - GREATEST(0, NEW.seller_amount - pending_balance))
    WHERE id = NEW.seller_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_seller_balance_trigger ON orders;
CREATE TRIGGER update_seller_balance_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_balance_on_order();

-- Function to move pending to available after payout delay
-- (This should be called by a scheduled job or admin action)
CREATE OR REPLACE FUNCTION process_pending_to_available()
RETURNS void AS $$
DECLARE
  payout_delay INTEGER;
BEGIN
  SELECT (value::text)::integer INTO payout_delay 
  FROM platform_config WHERE key = 'payout_delay_days';
  
  payout_delay := COALESCE(payout_delay, 3);
  
  -- Move completed payouts to available balance
  UPDATE profiles p
  SET available_balance = available_balance + COALESCE(completed_payouts.total, 0),
      pending_balance = pending_balance - COALESCE(completed_payouts.total, 0)
  FROM (
    SELECT seller_id, SUM(seller_amount) as total
    FROM orders
    WHERE status = 'paid'
    AND paid_at < NOW() - (payout_delay || ' days')::interval
    AND seller_id NOT IN (
      SELECT seller_id FROM seller_payouts 
      WHERE order_id = orders.id AND status IN ('completed', 'processing')
    )
    GROUP BY seller_id
  ) completed_payouts
  WHERE p.id = completed_payouts.seller_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE kit_resources IS 'Seller-uploaded resources for kits, locked on admin approval';
COMMENT ON TABLE tickets IS 'Support tickets for buyer/seller/admin communication';
COMMENT ON TABLE ticket_messages IS 'Non-deletable messages within tickets';
COMMENT ON TABLE refund_requests IS 'Refund requests with admin review workflow';
COMMENT ON TABLE seller_withdrawals IS 'Seller withdrawal requests with manual admin payout';
