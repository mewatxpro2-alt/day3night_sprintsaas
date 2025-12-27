-- Add attachments support to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments TEXT[]; -- Array of public URLs

-- Create a storage bucket for message attachments if not exists
-- separate from submissions for better access control
-- (Bucket creation is manual or via client, but policy can be set here)

-- Enable RLS for storage objects if not already
-- (Assuming standard storage.objects RLS)
