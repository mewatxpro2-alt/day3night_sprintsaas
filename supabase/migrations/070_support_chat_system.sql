-- =====================================================
-- Customer Support Chat System Migration
-- =====================================================
-- Creates tables and policies for real-time customer support
-- between users (authenticated or guest) and platform admins

-- =====================================================
-- TABLES
-- =====================================================

-- Support Conversations Table
CREATE TABLE support_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Messages Table
CREATE TABLE support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES support_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Conversations indexes
CREATE INDEX idx_support_conversations_user_id ON support_conversations(user_id);
CREATE INDEX idx_support_conversations_email ON support_conversations(email);
CREATE INDEX idx_support_conversations_status ON support_conversations(status);
CREATE INDEX idx_support_conversations_last_message ON support_conversations(last_message_at DESC NULLS LAST);

-- Messages indexes
CREATE INDEX idx_support_messages_conversation ON support_messages(conversation_id, created_at DESC);
CREATE INDEX idx_support_messages_unread ON support_messages(conversation_id, read_at) WHERE read_at IS NULL;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update last_message_at timestamp
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_message_at on new message
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON support_messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE support_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: support_conversations
-- =====================================================

-- Users can view their own conversations (by user_id OR email)
CREATE POLICY "Users can view own conversations"
ON support_conversations
FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (auth.uid() IS NULL AND email = current_setting('request.jwt.claims', true)::json->>'email')
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can view all conversations
CREATE POLICY "Admins can view all conversations"
ON support_conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Anyone can create a conversation (authenticated or guest)
CREATE POLICY "Anyone can create conversations"
ON support_conversations
FOR INSERT
WITH CHECK (true);

-- Only admins can update conversations (status changes)
CREATE POLICY "Admins can update conversations"
ON support_conversations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- RLS POLICIES: support_messages
-- =====================================================

-- Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
ON support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM support_conversations
    WHERE support_conversations.id = conversation_id
    AND (
      support_conversations.user_id = auth.uid()
      OR
      (auth.uid() IS NULL AND support_conversations.email = current_setting('request.jwt.claims', true)::json->>'email')
    )
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
ON support_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Users can insert messages as 'user' in their conversations
CREATE POLICY "Users can send messages in own conversations"
ON support_messages
FOR INSERT
WITH CHECK (
  sender_type = 'user'
  AND
  EXISTS (
    SELECT 1 FROM support_conversations
    WHERE support_conversations.id = conversation_id
    AND (
      support_conversations.user_id = auth.uid()
      OR
      support_conversations.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  )
);

-- Admins can insert messages as 'admin'
CREATE POLICY "Admins can send admin messages"
ON support_messages
FOR INSERT
WITH CHECK (
  sender_type = 'admin'
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update messages (mark as read)
CREATE POLICY "Admins can update messages"
ON support_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Enable realtime for instant messaging
ALTER PUBLICATION supabase_realtime ADD TABLE support_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE support_conversations IS 'Customer support chat conversations between users and admins';
COMMENT ON TABLE support_messages IS 'Messages within support conversations';
COMMENT ON COLUMN support_conversations.user_id IS 'Linked user if authenticated, NULL for guest users';
COMMENT ON COLUMN support_conversations.email IS 'Email for identification (required for guests)';
COMMENT ON COLUMN support_messages.sender_type IS 'Either user or admin';
COMMENT ON COLUMN support_messages.read_at IS 'Timestamp when message was read (NULL = unread)';
