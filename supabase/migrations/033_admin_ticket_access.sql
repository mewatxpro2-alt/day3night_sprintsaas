-- =====================================================
-- MIGRATION 033: ADMIN TICKET ACCESS FIX
-- Creates RPC function to bypass RLS for admin ticket access
-- =====================================================

-- 1. Create a function to get all tickets for admin
-- This uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION get_admin_tickets(
    p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    ticket_number TEXT,
    order_id UUID,
    listing_id UUID,
    created_by UUID,
    subject TEXT,
    category TEXT,
    status TEXT,
    priority TEXT,
    source TEXT,
    buyer_id UUID,
    seller_id UUID,
    involves_admin BOOLEAN,
    contact_email TEXT,
    contact_name TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    order_number TEXT,
    listing_title TEXT,
    creator_name TEXT,
    creator_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;

    RETURN QUERY
    SELECT 
        t.id,
        t.ticket_number,
        t.order_id,
        t.listing_id,
        t.created_by,
        t.subject,
        t.category,
        t.status,
        t.priority,
        t.source,
        t.buyer_id,
        t.seller_id,
        t.involves_admin,
        t.contact_email,
        t.contact_name,
        t.created_at,
        t.updated_at,
        t.resolved_at,
        o.order_number,
        l.title AS listing_title,
        p.full_name AS creator_name,
        p.avatar_url AS creator_avatar
    FROM tickets t
    LEFT JOIN orders o ON t.order_id = o.id
    LEFT JOIN listings l ON o.listing_id = l.id
    LEFT JOIN profiles p ON t.created_by = p.id
    WHERE (p_status IS NULL OR p_status = 'all' OR t.status = p_status)
    ORDER BY t.created_at DESC;
END;
$$;

-- 2. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_tickets TO authenticated;

-- 3. Also create a simpler RLS fix - add a direct policy for admin
-- First drop existing policy
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Admin can view all tickets" ON tickets;

-- Create two separate policies (more reliable than OR in single policy)
-- Policy 1: Users see their own tickets
CREATE POLICY "Users can view own tickets" ON tickets
    FOR SELECT USING (
        created_by = auth.uid() 
        OR buyer_id = auth.uid() 
        OR seller_id = auth.uid()
    );

-- Policy 2: Admin sees all tickets (separate policy)
CREATE POLICY "Admin can view all tickets" ON tickets
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- 4. Apply same pattern to ticket_messages
DROP POLICY IF EXISTS "Participants can view ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Admin can view all ticket messages" ON ticket_messages;

CREATE POLICY "Participants can view ticket messages" ON ticket_messages
    FOR SELECT USING (
        ticket_id IN (
            SELECT id FROM tickets 
            WHERE created_by = auth.uid() 
            OR buyer_id = auth.uid() 
            OR seller_id = auth.uid()
        )
    );

CREATE POLICY "Admin can view all ticket messages" ON ticket_messages
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    );

-- 5. Comment
COMMENT ON FUNCTION get_admin_tickets IS 'Fetches all tickets for admin users, bypasses RLS using SECURITY DEFINER';
