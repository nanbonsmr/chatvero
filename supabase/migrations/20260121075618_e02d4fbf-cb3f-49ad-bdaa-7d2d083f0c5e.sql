-- Add logo_url column to chatbots table
ALTER TABLE public.chatbots 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create storage bucket for chatbot assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('chatbot-assets', 'chatbot-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their chatbot assets
CREATE POLICY "Users can upload their chatbot assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chatbot-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their chatbot assets
CREATE POLICY "Users can update their chatbot assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'chatbot-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their chatbot assets
CREATE POLICY "Users can delete their chatbot assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'chatbot-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to chatbot assets (for widget display)
CREATE POLICY "Public can view chatbot assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chatbot-assets');