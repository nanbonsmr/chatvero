-- Create table for storing crawled website content
CREATE TABLE public.crawled_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chatbot_id, url)
);

-- Enable RLS
ALTER TABLE public.crawled_pages ENABLE ROW LEVEL SECURITY;

-- Create policies using the owns_chatbot function
CREATE POLICY "Users can view crawled pages for their chatbots"
ON public.crawled_pages
FOR SELECT
USING (public.owns_chatbot(chatbot_id));

CREATE POLICY "Users can insert crawled pages for their chatbots"
ON public.crawled_pages
FOR INSERT
WITH CHECK (public.owns_chatbot(chatbot_id));

CREATE POLICY "Users can delete crawled pages for their chatbots"
ON public.crawled_pages
FOR DELETE
USING (public.owns_chatbot(chatbot_id));

-- Create index for faster lookups
CREATE INDEX idx_crawled_pages_chatbot_id ON public.crawled_pages(chatbot_id);