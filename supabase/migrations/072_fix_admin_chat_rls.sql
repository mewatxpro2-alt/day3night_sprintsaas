-- Allow admins to send system messages (e.g. "Marked as Resolved")
DROP POLICY "Admins can send admin messages" ON support_messages;

CREATE POLICY "Admins can send admin and system messages"
ON support_messages
FOR INSERT
WITH CHECK (
  sender_type IN ('admin', 'system')
  AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
