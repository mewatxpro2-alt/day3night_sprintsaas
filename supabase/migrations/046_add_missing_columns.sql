-- Fix missing timestamp columns in seller_withdrawals table
-- The table was created but missing critical timestamp columns

DO $$
BEGIN
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seller_withdrawals' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.seller_withdrawals 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Added created_at column to seller_withdrawals';
    END IF;

    -- Add processed_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seller_withdrawals' 
        AND column_name = 'processed_at'
    ) THEN
        ALTER TABLE public.seller_withdrawals 
        ADD COLUMN processed_at TIMESTAMPTZ;
        
        RAISE NOTICE 'Added processed_at column to seller_withdrawals';
    END IF;

    -- Add processed_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'seller_withdrawals' 
        AND column_name = 'processed_by'
    ) THEN
        ALTER TABLE public.seller_withdrawals 
        ADD COLUMN processed_by UUID REFERENCES public.profiles(id);
        
        RAISE NOTICE 'Added processed_by column to seller_withdrawals';
    END IF;
END $$;

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload config';
