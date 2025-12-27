-- =====================================================
-- RLS POLICIES: Seller Inquiries
-- Migration 011: Row Level Security for seller_inquiries table
-- =====================================================

-- Enable RLS on seller_inquiries
ALTER TABLE seller_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Buyers can view inquiries they sent
CREATE POLICY "Buyers can view their own inquiries"
  ON seller_inquiries
  FOR SELECT
  USING (buyer_id = auth.uid());

-- Policy: Sellers can view inquiries for their listings
-- (Assuming sellers are the ones listed in seller_id column)
CREATE POLICY "Sellers can view inquiries for their listings"
  ON seller_inquiries
  FOR SELECT
  USING (seller_id = auth.uid());

-- Policy: Buyers can create new inquiries
CREATE POLICY "Buyers can create inquiries"
  ON seller_inquiries
  FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Policy: Sellers can update inquiries (mark as read, add reply)
CREATE POLICY "Sellers can update their received inquiries"
  ON seller_inquiries
  FOR UPDATE
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

-- Policy: Buyers can update their own inquiries (e.g., mark as archived)
CREATE POLICY "Buyers can update their own inquiries"
  ON seller_inquiries
  FOR UPDATE
  USING (buyer_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid());

-- Policy: Admin can view all inquiries
-- Using role = 'admin' instead of is_admin which is a function/column mismatch
CREATE POLICY "Admins can view all inquiries"
  ON seller_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can update all inquiries
CREATE POLICY "Admins can update all inquiries"
  ON seller_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admin can delete inquiries (for moderation)
CREATE POLICY "Admins can delete inquiries"
  ON seller_inquiries
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
