-- Add analytics columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS intent text,
ADD COLUMN IF NOT EXISTS has_context boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sources_used integer DEFAULT 0;

-- Add topic tracking to conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS primary_intent text,
ADD COLUMN IF NOT EXISTS message_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_lead boolean DEFAULT false;

-- Create conversation_analytics table for aggregated stats
CREATE TABLE IF NOT EXISTS public.conversation_analytics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id uuid NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  intent text NOT NULL,
  conversation_count integer DEFAULT 0,
  message_count integer DEFAULT 0,
  context_hit_count integer DEFAULT 0,
  avg_sources_used numeric(4,2) DEFAULT 0,
  lead_conversion_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(chatbot_id, date, intent)
);

-- Enable RLS
ALTER TABLE public.conversation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversation_analytics
CREATE POLICY "Users can view analytics for their chatbots"
ON public.conversation_analytics
FOR SELECT
USING (owns_chatbot(chatbot_id));

CREATE POLICY "Service role can manage analytics"
ON public.conversation_analytics
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversation_analytics_chatbot_date 
ON public.conversation_analytics(chatbot_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_primary_intent 
ON public.conversations(chatbot_id, primary_intent);

-- Function to update analytics aggregates
CREATE OR REPLACE FUNCTION public.update_conversation_analytics(
  p_chatbot_id uuid,
  p_intent text,
  p_has_context boolean DEFAULT false,
  p_sources_used integer DEFAULT 0,
  p_is_lead boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO conversation_analytics (
    chatbot_id, 
    date, 
    intent, 
    conversation_count,
    message_count,
    context_hit_count,
    avg_sources_used,
    lead_conversion_count
  )
  VALUES (
    p_chatbot_id,
    CURRENT_DATE,
    p_intent,
    1,
    1,
    CASE WHEN p_has_context THEN 1 ELSE 0 END,
    p_sources_used,
    CASE WHEN p_is_lead THEN 1 ELSE 0 END
  )
  ON CONFLICT (chatbot_id, date, intent)
  DO UPDATE SET
    message_count = conversation_analytics.message_count + 1,
    context_hit_count = conversation_analytics.context_hit_count + 
      CASE WHEN p_has_context THEN 1 ELSE 0 END,
    avg_sources_used = (
      (conversation_analytics.avg_sources_used * conversation_analytics.message_count + p_sources_used) / 
      (conversation_analytics.message_count + 1)
    ),
    lead_conversion_count = conversation_analytics.lead_conversion_count + 
      CASE WHEN p_is_lead THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;