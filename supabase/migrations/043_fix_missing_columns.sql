-- Fix for missing columns in seller_withdrawals table
-- It seems the payment_details column might be missing or the schema cache is stale

DO $$
BEGIN
    -- Add payment_details if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seller_withdrawals' 
        AND column_name = 'payment_details'
    ) THEN
        ALTER TABLE public.seller_withdrawals ADD COLUMN payment_details JSONB;
    END IF;

    -- Add admin_notes if it doesn't exist (just to be safe)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seller_withdrawals' 
        AND column_name = 'admin_notes'
    ) THEN
        ALTER TABLE public.seller_withdrawals ADD COLUMN admin_notes TEXT;
    END IF;
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
