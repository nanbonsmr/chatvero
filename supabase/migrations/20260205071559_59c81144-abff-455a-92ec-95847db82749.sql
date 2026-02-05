-- Add platform column to conversations table to track message source
ALTER TABLE public.conversations
ADD COLUMN platform text DEFAULT 'widget';

-- Add comment for clarity
COMMENT ON COLUMN public.conversations.platform IS 'Source platform: widget, facebook, instagram, whatsapp, telegram';