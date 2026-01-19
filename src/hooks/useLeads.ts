import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Lead {
  id: string;
  chatbot_id: string;
  conversation_id: string | null;
  email: string | null;
  phone: string | null;
  name: string | null;
  custom_data: Record<string, unknown> | null;
  created_at: string;
  chatbot_name?: string;
}

export const useLeads = (filters?: {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  chatbotId?: string;
}) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leads", user?.id, filters],
    queryFn: async (): Promise<Lead[]> => {
      if (!user) return [];

      // First get user's chatbot IDs
      const { data: chatbots } = await supabase
        .from("chatbots")
        .select("id, name");

      if (!chatbots || chatbots.length === 0) return [];

      const chatbotMap = new Map(chatbots.map((c) => [c.id, c.name]));
      const chatbotIds = chatbots.map((c) => c.id);

      // Build leads query
      let query = supabase
        .from("leads")
        .select("*")
        .in("chatbot_id", chatbotIds)
        .order("created_at", { ascending: false });

      // Apply chatbot filter
      if (filters?.chatbotId) {
        query = query.eq("chatbot_id", filters.chatbotId);
      }

      // Apply date filters
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        const endOfDay = new Date(filters.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endOfDay.toISOString());
      }

      const { data: leads, error } = await query;

      if (error) throw error;

      // Filter by search and add chatbot name
      let filteredLeads: Lead[] = (leads || []).map((lead) => ({
        ...lead,
        custom_data: (lead.custom_data as Record<string, unknown>) || {},
        chatbot_name: chatbotMap.get(lead.chatbot_id) || "Unknown",
      }));

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredLeads = filteredLeads.filter(
          (lead) =>
            lead.email?.toLowerCase().includes(searchLower) ||
            lead.phone?.toLowerCase().includes(searchLower) ||
            lead.name?.toLowerCase().includes(searchLower)
        );
      }

      return filteredLeads;
    },
    enabled: !!user,
  });
};
