-- Create social media channels table
CREATE TABLE public.chatbot_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'whatsapp', 'instagram', 'telegram')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  credentials JSONB DEFAULT '{}'::jsonb,
  page_id TEXT,
  page_name TEXT,
  webhook_token TEXT DEFAULT gen_random_uuid()::text,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chatbot_id, platform)
);

-- Enable RLS
ALTER TABLE public.chatbot_channels ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view channels for their chatbots"
ON public.chatbot_channels FOR SELECT
USING (owns_chatbot(chatbot_id));

CREATE POLICY "Users can insert channels for their chatbots"
ON public.chatbot_channels FOR INSERT
WITH CHECK (owns_chatbot(chatbot_id));

CREATE POLICY "Users can update channels for their chatbots"
ON public.chatbot_channels FOR UPDATE
USING (owns_chatbot(chatbot_id));

CREATE POLICY "Users can delete channels for their chatbots"
ON public.chatbot_channels FOR DELETE
USING (owns_chatbot(chatbot_id));

-- Trigger for updated_at
CREATE TRIGGER update_chatbot_channels_updated_at
BEFORE UPDATE ON public.chatbot_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();