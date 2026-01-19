-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to chatbot_chunks
ALTER TABLE public.chatbot_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_chatbot_chunks_embedding 
ON public.chatbot_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(384),
  match_chatbot_id uuid,
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source_url text,
  source_type text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chatbot_chunks.id,
    chatbot_chunks.content,
    chatbot_chunks.source_url,
    chatbot_chunks.source_type,
    1 - (chatbot_chunks.embedding <=> query_embedding) as similarity
  FROM chatbot_chunks
  WHERE chatbot_chunks.chatbot_id = match_chatbot_id
    AND chatbot_chunks.embedding IS NOT NULL
    AND 1 - (chatbot_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY chatbot_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;