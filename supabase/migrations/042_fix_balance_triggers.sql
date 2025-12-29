-- Migration to fix seller balances and add triggers for automatic updates

-- 1. Create function to handle order status changes
CREATE OR REPLACE FUNCTION handle_order_balance_update()
RETURNS TRIGGER AS $$
BEGIN
    -- data is moving from OLD to NEW
    
    -- CASE 1: New Order (Paid) -> Add to Pending
    IF (TG_OP = 'INSERT' AND NEW.status = 'paid') OR 
       (TG_OP = 'UPDATE' AND OLD.status != 'paid' AND NEW.status = 'paid') THEN
        UPDATE public.profiles
        SET pending_balance = pending_balance + NEW.seller_amount
        WHERE id = NEW.seller_id;
    END IF;

    -- CASE 2: Order Completed -> Move from Pending to Available
    IF (TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed') THEN
        UPDATE public.profiles
        SET pending_balance = pending_balance - NEW.seller_amount,
            available_balance = available_balance + NEW.seller_amount
        WHERE id = NEW.seller_id;
    END IF;

    -- CASE 3: Order Refunded -> Deduct from wherever it was
    IF (TG_OP = 'UPDATE' AND OLD.status != 'refunded' AND NEW.status = 'refunded') THEN
        IF OLD.status = 'completed' THEN
            -- If it was available, take from available
            UPDATE public.profiles
            SET available_balance = available_balance - NEW.seller_amount
            WHERE id = NEW.seller_id;
        ELSE
            -- Otherwise it was likely pending
            UPDATE public.profiles
            SET pending_balance = pending_balance - NEW.seller_amount
            WHERE id = NEW.seller_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS trigger_update_balance_on_order ON public.orders;
CREATE TRIGGER trigger_update_balance_on_order
    AFTER INSERT OR UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_balance_update();

-- 3. Backfill Data for existing orders
-- Reset all balances first to be safe (or we can just calculate and set)
-- We will calculate from scratch for every seller

DO $$
DECLARE
    r RECORD;
    v_pending DECIMAL;
    v_available DECIMAL;
BEGIN
    FOR r IN SELECT id FROM public.profiles LOOP
        -- Calculate Available (Completed orders)
        SELECT COALESCE(SUM(seller_amount), 0) INTO v_available
        FROM public.orders
        WHERE seller_id = r.id AND status = 'completed';

        -- Calculate Pending (Paid or Delivered orders)
        SELECT COALESCE(SUM(seller_amount), 0) INTO v_pending
        FROM public.orders
        WHERE seller_id = r.id AND status IN ('paid', 'delivered');
        
        -- Subtract Withdrawals from Available (Completed withdrawals)
        -- Actually, withdrawals are already deducted from available_balance when requested!
        -- So we need to subtract ALL withdrawals (pending + processing + completed) because they lock the funds.
        -- Rejected withdrawals would have refunded the amount back, so we don't subtract them.
        -- Wait, if I'm recalculating from scratch based on ORDERS, I get the "Total Earnings Ever".
        -- Then I need to subtract "Total Withdrawn Ever" AND "Total Currently Locked in Requests".
        
        DECLARE
            v_withdrawals_deduction DECIMAL;
        BEGIN
            SELECT COALESCE(SUM(amount), 0) INTO v_withdrawals_deduction
            FROM public.seller_withdrawals
            WHERE seller_id = r.id AND status != 'rejected'; -- Pending, Processing, Completed all reduce available balance
            
            -- Update Profile
            UPDATE public.profiles
            SET available_balance = v_available - v_withdrawals_deduction,
                pending_balance = v_pending
            WHERE id = r.id;
        END;
    END LOOP;
END;
$$;
