-- =====================================================
-- MIGRATION 053: SELLER REJECTION SYSTEM
-- =====================================================

-- 1. Schema Updates
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS rejection_reason_public TEXT,
ADD COLUMN IF NOT EXISTS rejection_notes_internal TEXT,
ADD COLUMN IF NOT EXISTS reapply_allowed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reapply_after_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_count INTEGER DEFAULT 0;

-- Update constraint to allow new statuses
DO $$ 
BEGIN 
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_seller_status_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_seller_status_check 
    CHECK (seller_status IN ('not_applied', 'pending', 'approved', 'rejected', 'rejected_soft', 'rejected_hard'));
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- 2. Admin Rejection Logic (RPC)
CREATE OR REPLACE FUNCTION reject_seller_application(
    target_user_id UUID,
    rejection_type TEXT, -- 'soft' or 'hard'
    reason_public TEXT,
    notes_internal TEXT,
    cooldown_days INTEGER DEFAULT 7
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INTEGER;
BEGIN
    -- Get current rejection count
    SELECT rejection_count INTO current_count FROM profiles WHERE id = target_user_id;
    current_count := COALESCE(current_count, 0) + 1;

    -- Auto-hard reject if count >= 3
    IF current_count >= 3 THEN
        rejection_type := 'hard';
        reason_public := reason_public || ' (Maximum reapplication attempts reached)';
    END IF;

    IF rejection_type = 'hard' THEN
        UPDATE profiles
        SET 
            seller_status = 'rejected_hard',
            rejection_reason_public = reason_public,
            rejection_notes_internal = notes_internal,
            reapply_allowed = false,
            reapply_after_date = NULL,
            rejection_count = current_count,
            seller_reviewed_at = NOW()
        WHERE id = target_user_id;
    ELSE -- Soft Rejection
        UPDATE profiles
        SET 
            seller_status = 'rejected_soft',
            rejection_reason_public = reason_public,
            rejection_notes_internal = notes_internal,
            reapply_allowed = true,
            reapply_after_date = NOW() + (cooldown_days || ' days')::INTERVAL,
            rejection_count = current_count,
            seller_reviewed_at = NOW()
        WHERE id = target_user_id;
    END IF;
END;
$$;

-- 3. Update Submission Logic to respect bans/cooldowns
CREATE OR REPLACE FUNCTION submit_seller_application(
    application_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_status TEXT;
    v_reapply_date TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    
    SELECT seller_status, reapply_after_date 
    INTO v_status, v_reapply_date 
    FROM profiles 
    WHERE id = v_user_id;

    -- Checks
    IF v_status = 'rejected_hard' THEN
        RAISE EXCEPTION 'Your application has been permanently rejected.';
    END IF;

    IF v_status = 'rejected_soft' AND NOW() < v_reapply_date THEN
        RAISE EXCEPTION 'Please wait until the cooldown period ends before reapplying.';
    END IF;

    -- Update
    UPDATE profiles
    SET 
        seller_status = 'pending',
        seller_application_data = application_data,
        seller_applied_at = NOW()
    WHERE id = v_user_id;
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION reject_seller_application(UUID, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO authenticated;

NOTIFY pgrst, 'reload config';
