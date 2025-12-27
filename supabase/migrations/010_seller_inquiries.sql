-- =====================================================
-- SELLER INQUIRIES: Pre-Purchase Messaging System
-- Migration 010: Allow buyers to contact sellers before purchase
-- =====================================================

-- Create seller_inquiries table
CREATE TABLE IF NOT EXISTS seller_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Message Content
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  
  -- Reply (optional, can be null if no reply yet)
  seller_reply TEXT,
  replied_at TIMESTAMPTZ,
  
  -- Metadata
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_seller ON seller_inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_buyer ON seller_inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_listing ON seller_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_status ON seller_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_created ON seller_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_inquiries_unread ON seller_inquiries(seller_id, status) WHERE status = 'new';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_seller_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_seller_inquiries_updated_at ON seller_inquiries;
CREATE TRIGGER set_seller_inquiries_updated_at
  BEFORE UPDATE ON seller_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_seller_inquiries_updated_at();

-- Trigger to auto-set read_at when status changes to 'read' or 'replied'
CREATE OR REPLACE FUNCTION set_inquiry_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('read', 'replied') AND OLD.status = 'new' AND NEW.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_set_inquiry_read_at ON seller_inquiries;
CREATE TRIGGER auto_set_inquiry_read_at
  BEFORE UPDATE ON seller_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_inquiry_read_at();

-- Trigger to auto-set replied_at when seller_reply is added
CREATE OR REPLACE FUNCTION set_inquiry_replied_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.seller_reply IS NOT NULL AND OLD.seller_reply IS NULL THEN
    NEW.replied_at = NOW();
    NEW.status = 'replied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_set_inquiry_replied_at ON seller_inquiries;
CREATE TRIGGER auto_set_inquiry_replied_at
  BEFORE UPDATE ON seller_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION set_inquiry_replied_at();
