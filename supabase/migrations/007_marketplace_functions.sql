-- =====================================================
-- PHASE 3: ADDITIONAL DATABASE FUNCTIONS
-- Migration 007: Helper functions for marketplace
-- =====================================================

-- Function to increment seller stats after successful order
CREATE OR REPLACE FUNCTION increment_seller_stats(
  p_seller_id UUID,
  p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET 
    total_sales = COALESCE(total_sales, 0) + 1,
    total_earnings = COALESCE(total_earnings, 0) + p_amount
  WHERE id = p_seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has purchased a specific listing
CREATE OR REPLACE FUNCTION has_purchased_listing(
  p_user_id UUID,
  p_listing_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders
    WHERE buyer_id = p_user_id
    AND listing_id = p_listing_id
    AND status IN ('paid', 'delivered', 'completed')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get seller earnings summary
CREATE OR REPLACE FUNCTION get_seller_earnings(p_seller_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  pending_payouts DECIMAL,
  completed_payouts DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT o.id)::BIGINT as total_orders,
    COALESCE(SUM(o.seller_amount), 0) as total_revenue,
    COALESCE((
      SELECT SUM(sp.amount) 
      FROM seller_payouts sp 
      WHERE sp.seller_id = p_seller_id 
      AND sp.status IN ('pending', 'scheduled', 'processing')
    ), 0) as pending_payouts,
    COALESCE((
      SELECT SUM(sp.amount) 
      FROM seller_payouts sp 
      WHERE sp.seller_id = p_seller_id 
      AND sp.status = 'completed'
    ), 0) as completed_payouts
  FROM orders o
  WHERE o.seller_id = p_seller_id
  AND o.status IN ('paid', 'delivered', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get platform statistics
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  total_commission DECIMAL,
  pending_orders BIGINT,
  open_disputes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(price_amount), 0) as total_revenue,
    COALESCE(SUM(commission_amount), 0) as total_commission,
    (SELECT COUNT(*)::BIGINT FROM orders WHERE status = 'payment_pending') as pending_orders,
    (SELECT COUNT(*)::BIGINT FROM disputes WHERE status IN ('open', 'under_review')) as open_disputes
  FROM orders
  WHERE status IN ('paid', 'delivered', 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-deliver digital orders (mark as delivered immediately after payment)
CREATE OR REPLACE FUNCTION auto_deliver_order()
RETURNS TRIGGER AS $$
BEGIN
  -- If order is paid, auto-deliver since it's a digital product
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    NEW.delivered_at := NOW();
    NEW.status := 'delivered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_deliver ON orders;
CREATE TRIGGER trigger_auto_deliver
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_deliver_order();
