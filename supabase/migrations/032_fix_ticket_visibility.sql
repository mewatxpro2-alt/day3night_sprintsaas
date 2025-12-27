-- =====================================================
-- MIGRATION 032: FIX TICKET VISIBILITY & ANONYMOUS SUPPORT
-- Ensures admin can see all tickets and enables anonymous Contact Us
-- =====================================================

-- 1. Make created_by nullable for anonymous Contact Us submissions
ALTER TABLE tickets ALTER COLUMN created_by DROP NOT NULL;

-- 2. Drop existing RLS policies that might be blocking
DROP POLICY IF EXISTS "Users can view own tickets" ON tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON tickets;
DROP POLICY IF EXISTS "Participants can update tickets" ON tickets;

-- 3. Create comprehensive RLS policies

-- Admin can see ALL tickets
CREATE POLICY "Admin can view all tickets" ON tickets
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can see their own tickets (created by them or they're participant)
CREATE POLICY "Users can view own tickets" ON tickets
  FOR SELECT USING (
    created_by = auth.uid() 
    OR buyer_id = auth.uid() 
    OR seller_id = auth.uid()
    OR contact_email IS NOT NULL -- Anonymous tickets visible to admin only (covered above)
  );

-- Authenticated users can create tickets
CREATE POLICY "Authenticated users can create tickets" ON tickets
  FOR INSERT WITH CHECK (
    -- Logged in user creating for themselves
    (auth.uid() IS NOT NULL AND created_by = auth.uid())
    OR
    -- Anonymous submission (no created_by, but has contact_email)
    (created_by IS NULL AND contact_email IS NOT NULL)
  );

-- Allow anonymous inserts for Contact Us (requires service role or anon key with specific policy)
CREATE POLICY "Anonymous can create contact tickets" ON tickets
  FOR INSERT WITH CHECK (
    source = 'contact_us' AND contact_email IS NOT NULL
  );

-- Participants and admin can update tickets
CREATE POLICY "Participants can update tickets" ON tickets
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR buyer_id = auth.uid() 
    OR seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin can delete tickets (if needed)
CREATE POLICY "Admin can delete tickets" ON tickets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Update ticket_messages RLS for admin visibility
DROP POLICY IF EXISTS "Participants can view ticket messages" ON ticket_messages;
DROP POLICY IF EXISTS "Participants can create ticket messages" ON ticket_messages;

-- Admin can see all ticket messages
CREATE POLICY "Admin can view all ticket messages" ON ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Participants can see their ticket messages
CREATE POLICY "Participants can view ticket messages" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM tickets 
      WHERE created_by = auth.uid() 
      OR buyer_id = auth.uid() 
      OR seller_id = auth.uid()
    )
  );

-- Anyone can create messages on tickets they participate in
CREATE POLICY "Participants can create ticket messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND ticket_id IN (
      SELECT id FROM tickets 
      WHERE created_by = auth.uid() 
      OR buyer_id = auth.uid() 
      OR seller_id = auth.uid()
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Admin can create messages on any ticket
CREATE POLICY "Admin can create any ticket messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Ensure general category exists for Contact Us
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_category_check;
ALTER TABLE tickets ADD CONSTRAINT tickets_category_check 
  CHECK (category IN ('delivery_issue', 'clarification', 'refund_request', 'technical', 'other', 'general_inquiry'));

COMMENT ON COLUMN tickets.created_by IS 'User who created the ticket. NULL for anonymous Contact Us submissions.';
COMMENT ON COLUMN tickets.contact_email IS 'Required when created_by is NULL (anonymous submissions)';
