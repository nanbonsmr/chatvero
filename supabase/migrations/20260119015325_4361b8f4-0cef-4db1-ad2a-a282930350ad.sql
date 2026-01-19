-- Add category column to conversations table
ALTER TABLE public.conversations 
ADD COLUMN category text DEFAULT 'general';

-- Create index for better filtering performance
CREATE INDEX idx_conversations_category ON public.conversations(category);
CREATE INDEX idx_conversations_started_at ON public.conversations(started_at DESC);