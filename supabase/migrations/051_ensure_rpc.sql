-- =====================================================
-- MIGRATION 051: ENSURE RPC PERMISSIONS
-- =====================================================

-- Drop first to avoid signature conflicts
DROP FUNCTION IF EXISTS submit_seller_application(JSONB);

-- Recreate with explicit permissions
CREATE OR REPLACE FUNCTION submit_seller_application(
    application_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as creator (postgres/admin)
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Update the profile
    UPDATE profiles
    SET 
        seller_status = 'pending',
        seller_application_data = application_data,
        seller_applied_at = NOW()
    WHERE id = v_user_id;
    
    -- Verify update happened
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for user %', v_user_id;
    END IF;
END;
$$;

-- Grant permissions explicitly
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO anon; -- Just in case, though auth check handles it

-- Force reload
NOTIFY pgrst, 'reload config';
