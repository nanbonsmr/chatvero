-- Create chatbots table
CREATE TABLE public.chatbots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'professional',
  goal TEXT NOT NULL DEFAULT 'lead_generation',
  welcome_message TEXT DEFAULT 'Hi! How can I help you today?',
  primary_color TEXT DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  page_url TEXT,
  user_agent TEXT
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  name TEXT,
  custom_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_chatbots_user_id ON public.chatbots(user_id);
CREATE INDEX idx_conversations_chatbot_id ON public.conversations(chatbot_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_leads_chatbot_id ON public.leads(chatbot_id);

-- Enable RLS on all tables
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Chatbots policies (only owner can manage)
CREATE POLICY "Users can view their own chatbots"
  ON public.chatbots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chatbots"
  ON public.chatbots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbots"
  ON public.chatbots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatbots"
  ON public.chatbots FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to check chatbot ownership
CREATE OR REPLACE FUNCTION public.owns_chatbot(chatbot_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chatbots
    WHERE id = chatbot_uuid AND user_id = auth.uid()
  );
$$;

-- Conversations policies (owner can view, public can create for widget)
CREATE POLICY "Owners can view conversations for their chatbots"
  ON public.conversations FOR SELECT
  USING (public.owns_chatbot(chatbot_id));

CREATE POLICY "Anyone can create conversations (for widget)"
  ON public.conversations FOR INSERT
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Owners can view messages for their chatbots"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND public.owns_chatbot(c.chatbot_id)
    )
  );

CREATE POLICY "Anyone can create messages (for widget)"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Leads policies
CREATE POLICY "Owners can view leads for their chatbots"
  ON public.leads FOR SELECT
  USING (public.owns_chatbot(chatbot_id));

CREATE POLICY "Anyone can create leads (for widget)"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can delete leads for their chatbots"
  ON public.leads FOR DELETE
  USING (public.owns_chatbot(chatbot_id));

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_chatbots_updated_at
  BEFORE UPDATE ON public.chatbots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();