import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfDay, subDays, format } from "date-fns";

interface DailyStats {
  date: string;
  conversations: number;
  leads: number;
  messages: number;
}

interface AnalyticsData {
  dailyStats: DailyStats[];
  totals: {
    totalConversations: number;
    totalLeads: number;
    totalMessages: number;
    conversionRate: number;
  };
  chatbotBreakdown: {
    id: string;
    name: string;
    conversations: number;
    leads: number;
  }[];
}

export function useAnalytics(days: number = 30, chatbotId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics", user?.id, days, chatbotId],
    queryFn: async (): Promise<AnalyticsData> => {
      const startDate = startOfDay(subDays(new Date(), days));

      // Get user's chatbots first
      let chatbotsQuery = supabase
        .from("chatbots")
        .select("id, name");
      
      if (chatbotId) {
        chatbotsQuery = chatbotsQuery.eq("id", chatbotId);
      }

      const { data: chatbots, error: chatbotsError } = await chatbotsQuery;
      if (chatbotsError) throw chatbotsError;

      const chatbotIds = chatbots?.map(c => c.id) || [];
      
      if (chatbotIds.length === 0) {
        return {
          dailyStats: [],
          totals: { totalConversations: 0, totalLeads: 0, totalMessages: 0, conversionRate: 0 },
          chatbotBreakdown: [],
        };
      }

      // Get conversations
      const { data: conversations, error: convError } = await supabase
        .from("conversations")
        .select("id, chatbot_id, started_at")
        .in("chatbot_id", chatbotIds)
        .gte("started_at", startDate.toISOString());

      if (convError) throw convError;

      // Get leads
      const { data: leads, error: leadsError } = await supabase
        .from("leads")
        .select("id, chatbot_id, created_at")
        .in("chatbot_id", chatbotIds)
        .gte("created_at", startDate.toISOString());

      if (leadsError) throw leadsError;

      // Get messages count by joining through conversations
      const conversationIds = conversations?.map(c => c.id) || [];
      let messagesCount = 0;
      
      if (conversationIds.length > 0) {
        const { count, error: msgError } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .in("conversation_id", conversationIds);
        
        if (!msgError && count) {
          messagesCount = count;
        }
      }

      // Build daily stats
      const dailyMap = new Map<string, DailyStats>();
      
      // Initialize all days
      for (let i = days - 1; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        dailyMap.set(date, { date, conversations: 0, leads: 0, messages: 0 });
      }

      // Count conversations per day
      conversations?.forEach((conv) => {
        const date = format(new Date(conv.started_at), "yyyy-MM-dd");
        const stat = dailyMap.get(date);
        if (stat) stat.conversations++;
      });

      // Count leads per day
      leads?.forEach((lead) => {
        const date = format(new Date(lead.created_at), "yyyy-MM-dd");
        const stat = dailyMap.get(date);
        if (stat) stat.leads++;
      });

      const dailyStats = Array.from(dailyMap.values());

      // Calculate chatbot breakdown
      const chatbotBreakdown = chatbots?.map((bot) => ({
        id: bot.id,
        name: bot.name,
        conversations: conversations?.filter(c => c.chatbot_id === bot.id).length || 0,
        leads: leads?.filter(l => l.chatbot_id === bot.id).length || 0,
      })) || [];

      const totalConversations = conversations?.length || 0;
      const totalLeads = leads?.length || 0;

      return {
        dailyStats,
        totals: {
          totalConversations,
          totalLeads,
          totalMessages: messagesCount,
          conversionRate: totalConversations > 0 
            ? Math.round((totalLeads / totalConversations) * 100 * 10) / 10
            : 0,
        },
        chatbotBreakdown,
      };
    },
    enabled: !!user,
  });
}
