-- Add admin role support and contact messages table

-- 1. Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- unread, read, resolved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 3. Admin RLS Policies for Submissions
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Admin can view all submissions" ON submissions;
DROP POLICY IF EXISTS "Admin can update all submissions" ON submissions;

CREATE POLICY "Admin can view all submissions"
  ON submissions FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all submissions"
  ON submissions FOR UPDATE
  USING (
    (auth.uid() = user_id AND status = 'pending') OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 4. Admin RLS Policies for Listings
DROP POLICY IF EXISTS "Admin can update all listings" ON listings;

CREATE POLICY "Admin can update all listings"
  ON listings FOR UPDATE
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 5. Admin RLS Policies for Contact Messages
CREATE POLICY "Admin can view contact messages"
  ON contact_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update contact messages"
  ON contact_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Anyone can insert contact messages (public form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- 6. Create index for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);
