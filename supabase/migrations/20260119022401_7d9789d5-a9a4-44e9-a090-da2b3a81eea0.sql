-- Create storage bucket for chatbot documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chatbot-documents', 'chatbot-documents', false);

-- Create RLS policies for the bucket
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chatbot-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chatbot-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chatbot-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to track uploaded documents for chatbots
CREATE TABLE public.chatbot_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view documents for their chatbots"
ON public.chatbot_documents
FOR SELECT
USING (owns_chatbot(chatbot_id));

CREATE POLICY "Users can insert documents for their chatbots"
ON public.chatbot_documents
FOR INSERT
WITH CHECK (owns_chatbot(chatbot_id));

CREATE POLICY "Users can delete documents for their chatbots"
ON public.chatbot_documents
FOR DELETE
USING (owns_chatbot(chatbot_id));