-- Fix RLS Policies for Withdrawal System
-- Using a SECURITY DEFINER function to safely check for admin role bypassing RLS recursion/restrictions

-- 1. Create a safe admin check function
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix Seller Withdrawals Policies
ALTER TABLE public.seller_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sellers can view and create their own withdrawals" ON public.seller_withdrawals;
DROP POLICY IF EXISTS "Admins can manage all withdrawals" ON public.seller_withdrawals;
DROP POLICY IF EXISTS "Enable read/write for own withdrawals" ON public.seller_withdrawals;
DROP POLICY IF EXISTS "Enable all access for admins" ON public.seller_withdrawals;

-- New Policies
CREATE POLICY "seller_access_own_withdrawals"
ON public.seller_withdrawals
FOR ALL
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "admin_access_all_withdrawals"
ON public.seller_withdrawals
FOR ALL
USING (public.check_is_admin());

-- 3. Fix Seller Bank Accounts Policies
ALTER TABLE public.seller_bank_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own bank details" ON public.seller_bank_accounts;
DROP POLICY IF EXISTS "Admins can view all bank details" ON public.seller_bank_accounts;
DROP POLICY IF EXISTS "Enable read/write for own bank details" ON public.seller_bank_accounts;
DROP POLICY IF EXISTS "Enable all access for admins bank" ON public.seller_bank_accounts;

-- New Policies
CREATE POLICY "seller_manage_own_bank"
ON public.seller_bank_accounts
FOR ALL
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

CREATE POLICY "admin_view_all_bank"
ON public.seller_bank_accounts
FOR ALL
USING (public.check_is_admin());

-- Force schema reload
NOTIFY pgrst, 'reload config';
