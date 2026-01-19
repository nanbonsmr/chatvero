-- Create table for storing parsed document chunks
CREATE TABLE public.chatbot_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.chatbot_documents(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'document', -- 'document' or 'crawled'
  source_url TEXT,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_chunks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view chunks for their chatbots"
ON public.chatbot_chunks
FOR SELECT
USING (owns_chatbot(chatbot_id));

CREATE POLICY "Service role can insert chunks"
ON public.chatbot_chunks
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete chunks for their chatbots"
ON public.chatbot_chunks
FOR DELETE
USING (owns_chatbot(chatbot_id));

-- Create index for faster lookups
CREATE INDEX idx_chatbot_chunks_chatbot_id ON public.chatbot_chunks(chatbot_id);
CREATE INDEX idx_chatbot_chunks_document_id ON public.chatbot_chunks(document_id);

-- Add UPDATE policy to chatbot_documents for status updates
CREATE POLICY "Service role can update document status"
ON public.chatbot_documents
FOR UPDATE
WITH CHECK (true);