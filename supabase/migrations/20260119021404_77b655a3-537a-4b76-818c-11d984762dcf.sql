-- Add archived_at column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN archived_at timestamp with time zone DEFAULT NULL;

-- Create index for archived filter
CREATE INDEX idx_conversations_archived ON public.conversations(archived_at);

-- Allow owners to delete their conversations
CREATE POLICY "Owners can delete conversations for their chatbots"
ON public.conversations
FOR DELETE
USING (owns_chatbot(chatbot_id));

-- Allow owners to update their conversations (for archiving)
CREATE POLICY "Owners can update conversations for their chatbots"
ON public.conversations
FOR UPDATE
USING (owns_chatbot(chatbot_id));

-- Allow owners to delete messages for their chatbots' conversations
CREATE POLICY "Owners can delete messages for their chatbots"
ON public.messages
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM conversations c
  WHERE c.id = messages.conversation_id AND owns_chatbot(c.chatbot_id)
));