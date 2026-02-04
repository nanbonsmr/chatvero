import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

// Plan limits configuration
export const PLAN_LIMITS = {
  free: {
    name: "Free",
    chatbots: 1,
    messagesPerMonth: 100,
    features: {
      basicAnalytics: true,
      advancedAnalytics: false,
      customBranding: false,
      leadCapture: false,
      crmIntegrations: false,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  starter: {
    name: "Starter",
    chatbots: 1,
    messagesPerMonth: 1000,
    features: {
      basicAnalytics: true,
      advancedAnalytics: false,
      customBranding: false,
      leadCapture: false,
      crmIntegrations: false,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  growth: {
    name: "Growth",
    chatbots: 5,
    messagesPerMonth: 10000,
    features: {
      basicAnalytics: true,
      advancedAnalytics: true,
      customBranding: true,
      leadCapture: true,
      crmIntegrations: true,
      whiteLabel: false,
      apiAccess: false,
      prioritySupport: true,
    },
  },
  business: {
    name: "Business",
    chatbots: Infinity,
    messagesPerMonth: Infinity,
    features: {
      basicAnalytics: true,
      advancedAnalytics: true,
      customBranding: true,
      leadCapture: true,
      crmIntegrations: true,
      whiteLabel: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export interface UsageData {
  chatbotsUsed: number;
  messagesThisMonth: number;
}

export interface PlanLimitsData {
  plan: PlanType;
  limits: (typeof PLAN_LIMITS)[PlanType];
  usage: UsageData;
  canCreateChatbot: boolean;
  canSendMessage: boolean;
  chatbotUsagePercent: number;
  messageUsagePercent: number;
}

export const usePlanLimits = () => {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();

  return useQuery({
    queryKey: ["plan-limits", user?.id, subscription?.plan],
    queryFn: async (): Promise<PlanLimitsData> => {
      if (!user?.id) {
        throw new Error("Not authenticated");
      }

      // Get current plan
      const plan: PlanType = (subscription?.plan as PlanType) || "free";
      const limits = PLAN_LIMITS[plan];

      // Get chatbot count
      const { count: chatbotCount, error: chatbotError } = await supabase
        .from("chatbots")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (chatbotError) throw chatbotError;

      // Get message count for this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // First get all chatbot IDs for this user
      const { data: userChatbots, error: userChatbotsError } = await supabase
        .from("chatbots")
        .select("id")
        .eq("user_id", user.id);

      if (userChatbotsError) throw userChatbotsError;

      let messageCount = 0;
      if (userChatbots && userChatbots.length > 0) {
        const chatbotIds = userChatbots.map((c) => c.id);

        // Get conversations for these chatbots
        const { data: conversations, error: convError } = await supabase
          .from("conversations")
          .select("id")
          .in("chatbot_id", chatbotIds);

        if (convError) throw convError;

        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map((c) => c.id);

          // Count messages from this month
          const { count, error: msgError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .in("conversation_id", conversationIds)
            .gte("created_at", startOfMonth.toISOString())
            .eq("role", "assistant"); // Only count AI responses as "messages"

          if (msgError) throw msgError;
          messageCount = count || 0;
        }
      }

      const chatbotsUsed = chatbotCount || 0;
      const messagesThisMonth = messageCount;

      const canCreateChatbot = chatbotsUsed < limits.chatbots;
      const canSendMessage = messagesThisMonth < limits.messagesPerMonth;

      const chatbotUsagePercent =
        limits.chatbots === Infinity
          ? 0
          : Math.min(100, (chatbotsUsed / limits.chatbots) * 100);

      const messageUsagePercent =
        limits.messagesPerMonth === Infinity
          ? 0
          : Math.min(100, (messagesThisMonth / limits.messagesPerMonth) * 100);

      return {
        plan,
        limits,
        usage: {
          chatbotsUsed,
          messagesThisMonth,
        },
        canCreateChatbot,
        canSendMessage,
        chatbotUsagePercent,
        messageUsagePercent,
      };
    },
    enabled: !!user?.id,
  });
};
