import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Chatbot, ChatbotWithStats } from "@/types/chatbot";
import { useAuth } from "./useAuth";

export const useChatbots = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["chatbots", user?.id],
    queryFn: async (): Promise<ChatbotWithStats[]> => {
      if (!user) return [];

      // Fetch chatbots
      const { data: chatbots, error } = await supabase
        .from("chatbots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For each chatbot, fetch stats
      const chatbotsWithStats = await Promise.all(
        (chatbots as Chatbot[]).map(async (chatbot) => {
          // Get conversation count
          const { count: chatCount } = await supabase
            .from("conversations")
            .select("*", { count: "exact", head: true })
            .eq("chatbot_id", chatbot.id);

          // Get leads count
          const { count: leadsCount } = await supabase
            .from("leads")
            .select("*", { count: "exact", head: true })
            .eq("chatbot_id", chatbot.id);

          const totalChats = chatCount || 0;
          const leadsCaptures = leadsCount || 0;
          const conversionRate = totalChats > 0 ? (leadsCaptures / totalChats) * 100 : 0;

          return {
            ...chatbot,
            total_chats: totalChats,
            leads_captured: leadsCaptures,
            conversion_rate: Math.round(conversionRate * 10) / 10,
          };
        })
      );

      return chatbotsWithStats;
    },
    enabled: !!user,
  });
};

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      website_url: string;
      tone: string;
      goal: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: chatbot, error } = await supabase
        .from("chatbots")
        .insert({
          user_id: user.id,
          name: data.name,
          website_url: data.website_url,
          tone: data.tone,
          goal: data.goal,
        })
        .select()
        .single();

      if (error) throw error;
      return chatbot as Chatbot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
};

export const useDeleteChatbot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatbotId: string) => {
      const { error } = await supabase
        .from("chatbots")
        .delete()
        .eq("id", chatbotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbots"] });
    },
  });
};
