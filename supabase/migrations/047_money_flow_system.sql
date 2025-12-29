-- =====================================================
-- MONEY FLOW SYSTEM - Complete Refund & Balance Logic
-- =====================================================

-- 1. ADD MISSING COLUMNS
-- =====================================================

-- Add buyer_id to refund_requests for proper FK joins
ALTER TABLE public.refund_requests 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES public.profiles(id);

-- Backfill buyer_id from orders table
UPDATE public.refund_requests rr
SET buyer_id = o.buyer_id
FROM public.orders o
WHERE rr.order_id = o.id AND rr.buyer_id IS NULL;

-- Add disputed_balance to profiles (funds locked due to refund requests)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS disputed_balance DECIMAL(10,2) DEFAULT 0.00;

-- 2. REFUND LIFECYCLE TRIGGERS
-- =====================================================

-- Trigger 1: Lock funds when refund is requested
CREATE OR REPLACE FUNCTION lock_funds_on_refund_request()
RETURNS TRIGGER AS $$
BEGIN
    -- Update order status to 'disputed'
    UPDATE public.orders 
    SET status = 'disputed'
    WHERE id = NEW.order_id;
    
    -- Move seller funds from pending to disputed (locked)
    UPDATE public.profiles p
    SET 
        disputed_balance = disputed_balance + o.seller_amount,
        pending_balance = GREATEST(0, pending_balance - o.seller_amount)
    FROM public.orders o
    WHERE o.id = NEW.order_id 
    AND p.id = o.seller_id;
    
    RAISE NOTICE 'Locked ₹% for refund request %', (SELECT seller_amount FROM public.orders WHERE id = NEW.order_id), NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_lock_funds_on_refund ON public.refund_requests;
CREATE TRIGGER trigger_lock_funds_on_refund
    AFTER INSERT ON public.refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION lock_funds_on_refund_request();

-- Trigger 2: Process refund completion (return money to buyer, deduct from seller)
CREATE OR REPLACE FUNCTION complete_refund()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if status changed TO 'completed'
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
        
        -- Deduct from seller's disputed balance
        UPDATE public.profiles p
        SET disputed_balance = GREATEST(0, disputed_balance - o.seller_amount)
        FROM public.orders o
        WHERE o.id = NEW.order_id AND p.id = o.seller_id;
        
        -- Update order status to 'refunded'
        UPDATE public.orders 
        SET status = 'refunded'
        WHERE id = NEW.order_id;
        
        -- TODO: Integrate with payment gateway to actually refund buyer
        RAISE NOTICE 'Refund completed for order %. Buyer should be refunded ₹%', 
            NEW.order_id, 
            (SELECT price_amount FROM public.orders WHERE id = NEW.order_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_complete_refund ON public.refund_requests;
CREATE TRIGGER trigger_complete_refund
    AFTER UPDATE ON public.refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION complete_refund();

-- Trigger 3: Unlock funds if refund is rejected
CREATE OR REPLACE FUNCTION unlock_funds_on_refund_rejection()
RETURNS TRIGGER AS $$
BEGIN
    -- Only act if status changed TO 'rejected'
    IF OLD.status != 'rejected' AND NEW.status = 'rejected' THEN
        
        -- Move funds back from disputed to pending
        UPDATE public.profiles p
        SET 
            disputed_balance = GREATEST(0, disputed_balance - o.seller_amount),
            pending_balance = pending_balance + o.seller_amount
        FROM public.orders o
        WHERE o.id = NEW.order_id AND p.id = o.seller_id;
        
        -- Restore order status (back to paid if it was disputed)
        UPDATE public.orders 
        SET status = CASE 
            WHEN status = 'disputed' THEN 'paid'
            ELSE status 
        END
        WHERE id = NEW.order_id;
        
        RAISE NOTICE 'Unlocked ₹% for rejected refund %', 
            (SELECT seller_amount FROM public.orders WHERE id = NEW.order_id), 
            NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_unlock_on_rejection ON public.refund_requests;
CREATE TRIGGER trigger_unlock_on_rejection
    AFTER UPDATE ON public.refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION unlock_funds_on_refund_rejection();

-- 3. PREVENT WITHDRAWAL OF DISPUTED FUNDS
-- =====================================================

-- Update the withdrawal trigger to check disputed balance
DROP FUNCTION IF EXISTS handle_withdrawal_request() CASCADE;
CREATE OR REPLACE FUNCTION handle_withdrawal_request()
RETURNS TRIGGER AS $$
DECLARE
    v_profile profiles%ROWTYPE;
BEGIN
    -- Get seller profile with lock
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE id = NEW.seller_id
    FOR UPDATE;
    
    -- Check if they have enough AVAILABLE balance (not including disputed)
    IF v_profile.available_balance < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient available balance. Available: ₹%, Requested: ₹%', 
            v_profile.available_balance, NEW.amount;
    END IF;
    
    -- Deduct from available balance
    UPDATE public.profiles
    SET available_balance = available_balance - NEW.amount
    WHERE id = NEW.seller_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_deduct_balance_on_withdrawal ON public.seller_withdrawals;
CREATE TRIGGER trigger_deduct_balance_on_withdrawal
    AFTER INSERT ON public.seller_withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION handle_withdrawal_request();

-- 4. BACKFILL EXISTING DATA
-- =====================================================

-- For any existing 'reported' refund requests, lock the disputed funds
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT rr.id, rr.order_id, o.seller_id, o.seller_amount
        FROM public.refund_requests rr
        JOIN public.orders o ON o.id = rr.order_id
        WHERE rr.status = 'reported'
        AND o.status != 'disputed'
    LOOP
        -- Update order status
        UPDATE public.orders SET status = 'disputed' WHERE id = r.order_id;
        
        -- Move to disputed balance
        UPDATE public.profiles
        SET 
            disputed_balance = disputed_balance + r.seller_amount,
            pending_balance = GREATEST(0, pending_balance - r.seller_amount)
        WHERE id = r.seller_id;
        
        RAISE NOTICE 'Backfilled lock for refund request %', r.id;
    END LOOP;
END $$;

-- 5. HELPER VIEW: Seller Balance Summary
-- =====================================================

CREATE OR REPLACE VIEW seller_balance_summary AS
SELECT 
    p.id as seller_id,
    p.full_name,
    p.email,
    p.available_balance,
    p.pending_balance,
    p.disputed_balance,
    p.withdrawn_total,
    (p.available_balance + p.pending_balance + p.disputed_balance) as total_earnings,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('paid', 'delivered', 'completed')) as total_orders,
    COUNT(DISTINCT rr.id) FILTER (WHERE rr.status IN ('reported', 'under_review')) as active_refund_requests
FROM public.profiles p
LEFT JOIN public.orders o ON o.seller_id = p.id
LEFT JOIN public.refund_requests rr ON rr.order_id = o.id
WHERE p.role = 'seller'
GROUP BY p.id;

COMMENT ON VIEW seller_balance_summary IS 'Complete seller financial overview including disputed funds';

-- Force schema reload
NOTIFY pgrst, 'reload config';
