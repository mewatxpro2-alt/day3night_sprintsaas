-- =====================================================
-- MIGRATION 041: SELLER WITHDRAWAL SYSTEM
-- =====================================================

-- 1. SELLER BANK ACCOUNTS
-- Stores bank/UPI details. One record per seller.
CREATE TABLE IF NOT EXISTS public.seller_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Bank Details
    account_holder_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number_last4 TEXT NOT NULL, -- Security: Don't store full number if not PCI compliant, or store encrypted. For MVP, we'll store basic info.
    -- Actually, for a real withdrawal we need the full number. 
    -- Assuming we store it plain for MVP as requested, but "last4" suggested in previous code.
    -- Let's store full details so admin can actually PAY them.
    account_number TEXT NOT NULL, 
    ifsc_code TEXT NOT NULL,
    
    -- UPI
    upi_id TEXT,
    
    is_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT bank_details_check CHECK (
        (account_number IS NOT NULL AND ifsc_code IS NOT NULL) OR (upi_id IS NOT NULL)
    )
);

-- 2. SELLER WITHDRAWALS
-- Tracks each withdrawal request
CREATE TABLE IF NOT EXISTS public.seller_withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'INR',
    
    status TEXT NOT NULL DEFAULT 'pending', 
    -- 'pending': Requested by seller
    -- 'processing': Admin acknowledged, in progress
    -- 'completed': Money sent
    -- 'rejected': Invalid request
    
    payment_method TEXT NOT NULL, -- 'bank_transfer', 'upi'
    payment_details JSONB, -- Snapshot of bank details at time of request
    
    admin_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ, -- When it moved to completed/rejected
    processed_by UUID REFERENCES public.profiles(id)
);

-- 3. PROFILES UPDATES (Balances)
-- We need to track balances. 
-- available_balance: Amount ready to withdraw (From 'Paid' orders)
-- pending_balance: Amount in 'Escrow' (From 'Pending'/'Delivered' orders)
-- withdrawn_total: Lifetime withdrawn
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS available_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pending_balance DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS withdrawn_total DECIMAL(10,2) DEFAULT 0.00;

-- 4. RLS POLICIES

-- Bank Accounts
ALTER TABLE public.seller_bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bank details"
    ON public.seller_bank_accounts
    FOR ALL
    USING (seller_id = auth.uid());

CREATE POLICY "Admins can view all bank details"
    ON public.seller_bank_accounts
    FOR SELECT
    USING (
        EXISTS ( SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' )
    );

-- Withdrawals
ALTER TABLE public.seller_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view and create their own withdrawals"
    ON public.seller_withdrawals
    FOR ALL
    USING (seller_id = auth.uid());

CREATE POLICY "Admins can manage all withdrawals"
    ON public.seller_withdrawals
    FOR ALL
    USING (
        EXISTS ( SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' )
    );


-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_seller_withdrawals_seller ON public.seller_withdrawals(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_withdrawals_status ON public.seller_withdrawals(status);


-- 6. TRIGGERS (Auto-update Balance)
-- When an order is marked 'completed' (or whatever status releases funds), we should move funds to available_balance.
-- However, existing logic might calculate balance dynamically from orders. 
-- To support "Withdrawals", we must decrement `available_balance` when a withdrawal is created.

-- Function to handle withdrawal request (Deduct balance immediately to lock funds)
CREATE OR REPLACE FUNCTION handle_withdrawal_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Deduct from profile available balance
    UPDATE public.profiles
    SET available_balance = available_balance - NEW.amount
    WHERE id = NEW.seller_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_deduct_balance_on_withdrawal
    AFTER INSERT ON public.seller_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION handle_withdrawal_request();


-- Function to handle rejection (Refund balance)
CREATE OR REPLACE FUNCTION handle_withdrawal_rejection()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
        UPDATE public.profiles
        SET available_balance = available_balance + NEW.amount
        WHERE id = NEW.seller_id;
    END IF;
    
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        UPDATE public.profiles
        SET withdrawn_total = withdrawn_total + NEW.amount
        WHERE id = NEW.seller_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_handle_withdrawal_status_change
    AFTER UPDATE ON public.seller_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION handle_withdrawal_rejection();
