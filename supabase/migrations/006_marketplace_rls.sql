-- =====================================================
-- PHASE 3: MARKETPLACE COMMERCE
-- Migration 006: Row Level Security Policies
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PLATFORM_CONFIG POLICIES
-- =====================================================

-- Everyone can read config (for commission display etc)
CREATE POLICY "Platform config is readable by everyone"
  ON platform_config FOR SELECT
  USING (true);

-- Only admins can update config (enforced via Edge Functions)
-- No direct UPDATE policy - all updates go through admin Edge Functions

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view orders for their listings
CREATE POLICY "Sellers can view orders for their kits"
  ON orders FOR SELECT
  USING (auth.uid() = seller_id);

-- Orders are created via Edge Functions only (no direct insert)
-- Status updates are done via Edge Functions with service role

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Users can view payments for their orders
CREATE POLICY "Users can view payments for their orders"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = payments.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Payments are created/updated via Edge Functions only

-- =====================================================
-- SELLER_BANK_ACCOUNTS POLICIES
-- =====================================================

-- Sellers can view their own bank accounts
CREATE POLICY "Sellers can view own bank accounts"
  ON seller_bank_accounts FOR SELECT
  USING (auth.uid() = seller_id);

-- Sellers can insert their own bank accounts
CREATE POLICY "Sellers can add bank accounts"
  ON seller_bank_accounts FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own bank accounts
CREATE POLICY "Sellers can update own bank accounts"
  ON seller_bank_accounts FOR UPDATE
  USING (auth.uid() = seller_id);

-- =====================================================
-- SELLER_PAYOUTS POLICIES
-- =====================================================

-- Sellers can view their own payouts
CREATE POLICY "Sellers can view own payouts"
  ON seller_payouts FOR SELECT
  USING (auth.uid() = seller_id);

-- Payouts are created/updated via Edge Functions only

-- =====================================================
-- ORDER_ACCESS POLICIES
-- =====================================================

-- Buyers can view access for their orders
CREATE POLICY "Buyers can view their access grants"
  ON order_access FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_access.order_id 
      AND orders.buyer_id = auth.uid()
      AND orders.status IN ('paid', 'delivered', 'completed')
    )
  );

-- Access records are created via Edge Functions only (after payment verification)

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================

-- Order participants can view messages
CREATE POLICY "Order participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = messages.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Order participants can send messages (only after payment)
CREATE POLICY "Order participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id 
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.status IN ('paid', 'delivered', 'completed')
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Users can mark messages as read
CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- =====================================================
-- DISPUTES POLICIES
-- =====================================================

-- Order participants can view disputes
CREATE POLICY "Order participants can view disputes"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = disputes.order_id 
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Order participants can create disputes
CREATE POLICY "Order participants can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (
    auth.uid() = raised_by
    AND EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_id 
      AND orders.status IN ('paid', 'delivered', 'completed')
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );

-- Disputes are resolved via admin Edge Functions only

-- =====================================================
-- ADMIN ACCESS HELPER FUNCTION
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND email = 'tadmin@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN BYPASS POLICIES (for admin dashboard)
-- =====================================================

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (is_admin());

-- Admins can update all orders
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (is_admin());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin());

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  USING (is_admin());

-- Admins can view all disputes
CREATE POLICY "Admins can view all disputes"
  ON disputes FOR SELECT
  USING (is_admin());

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON disputes FOR UPDATE
  USING (is_admin());

-- Admins can view all payouts
CREATE POLICY "Admins can view all payouts"
  ON seller_payouts FOR SELECT
  USING (is_admin());

-- Admins can update platform config
CREATE POLICY "Admins can update platform config"
  ON platform_config FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can insert platform config"
  ON platform_config FOR INSERT
  WITH CHECK (is_admin());
