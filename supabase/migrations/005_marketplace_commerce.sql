-- =====================================================
-- PHASE 3: MARKETPLACE COMMERCE
-- Migration 005: Orders, Payments, Payouts, Messages
-- =====================================================

-- 1. PLATFORM_CONFIG: Admin-configurable settings
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default configuration
INSERT INTO platform_config (key, value) VALUES
  ('commission_rate', '0.15'::jsonb),
  ('payout_delay_days', '3'::jsonb),
  ('max_downloads_per_order', '10'::jsonb),
  ('refund_window_days', '7'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 2. ORDERS: Core transaction record
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- Human readable: ORD-XXXXXX
  
  -- Participants
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  
  -- Pricing (immutable snapshot at purchase time)
  price_amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.15 = 15%
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL, -- price - commission
  currency TEXT DEFAULT 'INR',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'created',
  -- States: created, payment_pending, paid, delivered, completed, refunded, disputed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT
);

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- 3. PAYMENTS: Payment gateway records
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  
  -- Razorpay fields
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  -- States: pending, authorized, captured, failed, refunded
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  method TEXT, -- upi, card, netbanking, wallet
  
  -- Metadata
  error_code TEXT,
  error_description TEXT,
  webhook_payload JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SELLER_BANK_ACCOUNTS: Seller payout details
CREATE TABLE IF NOT EXISTS seller_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
  
  -- Bank details
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL, -- Only store last 4 digits
  ifsc_code TEXT NOT NULL,
  
  -- UPI alternative
  upi_id TEXT,
  
  -- Razorpay linked account
  razorpay_fund_account_id TEXT,
  razorpay_contact_id TEXT,
  
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SELLER_PAYOUTS: Track payouts to sellers
CREATE TABLE IF NOT EXISTS seller_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- States: pending, scheduled, processing, completed, failed
  
  -- Razorpay Payout
  razorpay_payout_id TEXT,
  
  -- Payout method
  payout_method TEXT, -- bank_transfer, upi
  
  scheduled_at TIMESTAMPTZ, -- When payout is scheduled
  processed_at TIMESTAMPTZ, -- When payout was sent
  
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDER_ACCESS: Controls what buyer can access per order
CREATE TABLE IF NOT EXISTS order_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL UNIQUE,
  
  -- Access grants
  source_files_url TEXT, -- Protected download link (signed URL)
  access_granted_at TIMESTAMPTZ DEFAULT NOW(),
  access_expires_at TIMESTAMPTZ, -- Optional expiry
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 10, -- Limit downloads
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESSAGES: Buyer-Seller communication (unlocked post-purchase)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL, -- Messages are order-scoped
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Admin moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT,
  flagged_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. DISPUTES: For refund/dispute handling
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL UNIQUE,
  raised_by UUID REFERENCES profiles(id) NOT NULL, -- buyer or seller
  
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[], -- Screenshots, etc.
  
  status TEXT DEFAULT 'open',
  -- States: open, under_review, resolved_refund, resolved_no_refund, closed
  
  resolution TEXT,
  resolved_by UUID REFERENCES profiles(id), -- Admin who resolved
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment ON payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_seller_payouts_seller ON seller_payouts(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_order ON seller_payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_payouts_status ON seller_payouts(status);

CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_disputes_order ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- =====================================================
-- UPDATE LISTINGS TABLE: Add source files column
-- =====================================================

ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_files_url TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS source_files_size_mb DECIMAL(10,2);

-- =====================================================
-- UPDATE PROFILES TABLE: Add seller fields
-- =====================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS seller_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12,2) DEFAULT 0;
