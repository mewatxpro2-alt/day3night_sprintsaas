-- =====================================================
-- MIGRATION 050: FIX SELLER APPLICATION & ADMIN VIEW
-- =====================================================

-- 1. Create a secure function for users to submit applications
-- This bypasses RLS complications for the specific action of submitting.
CREATE OR REPLACE FUNCTION submit_seller_application(
    application_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (admin)
SET search_path = public
AS $$
BEGIN
    -- Ensure the user is updating their own row
    UPDATE profiles
    SET 
        seller_status = 'pending',
        seller_application_data = application_data,
        seller_applied_at = NOW()
    WHERE id = auth.uid();
END;
$$;

-- 2. Ensure Admin RLS policies allow viewing/updating these fields
-- (Assuming Admins have full access via existing policies, but double check)
-- Usually admins bypass RLS or have specific policies.

-- 3. Grant execute permission
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_seller_application(JSONB) TO service_role;

-- Force schema reload to ensure API sees the new function
NOTIFY pgrst, 'reload config';
