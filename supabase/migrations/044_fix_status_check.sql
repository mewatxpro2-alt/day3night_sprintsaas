-- Fix for seller_withdrawals status check constraint
-- The existing constraint might be too restrictive or expecting different casing

DO $$
BEGIN
    -- Drop the existing constraint if it exists
    ALTER TABLE public.seller_withdrawals DROP CONSTRAINT IF EXISTS seller_withdrawals_status_check;
    
    -- Add the constraint back with all used status values
    ALTER TABLE public.seller_withdrawals 
    ADD CONSTRAINT seller_withdrawals_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'failed', 'scheduled'));
END $$;

-- Force schema reload
NOTIFY pgrst, 'reload config';
