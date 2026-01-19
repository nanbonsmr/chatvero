export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  website_url: string;
  tone: string;
  goal: string;
  welcome_message: string | null;
  primary_color: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ChatbotWithStats extends Chatbot {
  total_chats: number;
  leads_captured: number;
  conversion_rate: number;
}
