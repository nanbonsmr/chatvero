-- Add new settings columns to chatbots table for enhanced welcome behavior
ALTER TABLE public.chatbots 
ADD COLUMN IF NOT EXISTS auto_show_welcome boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS welcome_delay_seconds integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS follow_up_message text;