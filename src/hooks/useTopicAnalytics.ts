import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { startOfDay, subDays } from "date-fns";

export interface TopicStats {
  intent: string;
  label: string;
  messageCount: number;
  contextHitRate: number;
  avgSourcesUsed: number;
  leadConversions: number;
  color: string;
}

export interface TopicAnalyticsData {
  topicStats: TopicStats[];
  totals: {
    totalWithContext: number;
    totalWithoutContext: number;
    overallContextHitRate: number;
    avgSourcesPerMessage: number;
  };
  dailyTopics: {
    date: string;
    pricing: number;
    features: number;
    support: number;
    general: number;
    howTo: number;
    contact: number;
  }[];
}

const INTENT_CONFIG: Record<string, { label: string; color: string }> = {
  pricing: { label: "Pricing Questions", color: "#f59e0b" },
  features: { label: "Feature Inquiries", color: "#3b82f6" },
  "how-to": { label: "How-To Guides", color: "#8b5cf6" },
  contact: { label: "Contact Requests", color: "#10b981" },
  about: { label: "About Company", color: "#ec4899" },
  troubleshooting: { label: "Troubleshooting", color: "#ef4444" },
  general: { label: "General Questions", color: "#6b7280" },
};

export function useTopicAnalytics(days: number = 30, chatbotId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["topic-analytics", user?.id, days, chatbotId],
    queryFn: async (): Promise<TopicAnalyticsData> => {
      const startDate = startOfDay(subDays(new Date(), days));

      // Get chatbot IDs
      let chatbotsQuery = supabase.from("chatbots").select("id");
      if (chatbotId) {
        chatbotsQuery = chatbotsQuery.eq("id", chatbotId);
      }

      const { data: chatbots, error: chatbotsError } = await chatbotsQuery;
      if (chatbotsError) throw chatbotsError;

      const chatbotIds = chatbots?.map((c) => c.id) || [];

      if (chatbotIds.length === 0) {
        return {
          topicStats: [],
          totals: {
            totalWithContext: 0,
            totalWithoutContext: 0,
            overallContextHitRate: 0,
            avgSourcesPerMessage: 0,
          },
          dailyTopics: [],
        };
      }

      // Get conversation analytics from the aggregated table
      const { data: analytics, error: analyticsError } = await supabase
        .from("conversation_analytics")
        .select("*")
        .in("chatbot_id", chatbotIds)
        .gte("date", startDate.toISOString().split("T")[0]);

      if (analyticsError) {
        console.error("Analytics query error:", analyticsError);
        // Fallback to message-level data if analytics table is empty
        return await getFallbackAnalytics(chatbotIds, startDate, days);
      }

      if (!analytics || analytics.length === 0) {
        // Fallback to message-level data
        return await getFallbackAnalytics(chatbotIds, startDate, days);
      }

      // Aggregate by intent
      const intentMap = new Map<string, {
        messageCount: number;
        contextHitCount: number;
        totalSources: number;
        leadConversions: number;
      }>();

      // Daily aggregation
      const dailyMap = new Map<string, Record<string, number>>();

      for (const record of analytics) {
        const intent = record.intent || "general";
        
        // Aggregate totals
        const existing = intentMap.get(intent) || {
          messageCount: 0,
          contextHitCount: 0,
          totalSources: 0,
          leadConversions: 0,
        };

        existing.messageCount += record.message_count || 0;
        existing.contextHitCount += record.context_hit_count || 0;
        existing.totalSources += (record.avg_sources_used || 0) * (record.message_count || 1);
        existing.leadConversions += record.lead_conversion_count || 0;

        intentMap.set(intent, existing);

        // Daily aggregation
        const dateKey = record.date;
        const dailyData = dailyMap.get(dateKey) || {};
        dailyData[intent] = (dailyData[intent] || 0) + (record.message_count || 0);
        dailyMap.set(dateKey, dailyData);
      }

      // Build topic stats
      const topicStats: TopicStats[] = Array.from(intentMap.entries()).map(([intent, data]) => {
        const config = INTENT_CONFIG[intent] || { label: intent, color: "#6b7280" };
        return {
          intent,
          label: config.label,
          messageCount: data.messageCount,
          contextHitRate: data.messageCount > 0 
            ? Math.round((data.contextHitCount / data.messageCount) * 100) 
            : 0,
          avgSourcesUsed: data.messageCount > 0 
            ? Math.round((data.totalSources / data.messageCount) * 10) / 10 
            : 0,
          leadConversions: data.leadConversions,
          color: config.color,
        };
      }).sort((a, b) => b.messageCount - a.messageCount);

      // Calculate totals
      const totalMessages = topicStats.reduce((sum, t) => sum + t.messageCount, 0);
      const totalContextHits = Array.from(intentMap.values())
        .reduce((sum, d) => sum + d.contextHitCount, 0);
      const totalSources = Array.from(intentMap.values())
        .reduce((sum, d) => sum + d.totalSources, 0);

      // Build daily topics array
      const dailyTopics = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          date,
          pricing: data.pricing || 0,
          features: data.features || 0,
          support: data.troubleshooting || 0,
          general: data.general || 0,
          howTo: data["how-to"] || 0,
          contact: data.contact || 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        topicStats,
        totals: {
          totalWithContext: totalContextHits,
          totalWithoutContext: totalMessages - totalContextHits,
          overallContextHitRate: totalMessages > 0 
            ? Math.round((totalContextHits / totalMessages) * 100) 
            : 0,
          avgSourcesPerMessage: totalMessages > 0 
            ? Math.round((totalSources / totalMessages) * 10) / 10 
            : 0,
        },
        dailyTopics,
      };
    },
    enabled: !!user,
  });
}

// Fallback when conversation_analytics table is empty
async function getFallbackAnalytics(
  chatbotIds: string[], 
  startDate: Date,
  days: number
): Promise<TopicAnalyticsData> {
  // Get conversations with primary_intent
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, primary_intent, started_at")
    .in("chatbot_id", chatbotIds)
    .gte("started_at", startDate.toISOString());

  const intentCounts = new Map<string, number>();
  const dailyMap = new Map<string, Record<string, number>>();

  // Initialize days
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split("T")[0];
    dailyMap.set(dateKey, {});
  }

  conversations?.forEach((conv) => {
    const intent = conv.primary_intent || "general";
    intentCounts.set(intent, (intentCounts.get(intent) || 0) + 1);

    const dateKey = new Date(conv.started_at).toISOString().split("T")[0];
    const dailyData = dailyMap.get(dateKey) || {};
    dailyData[intent] = (dailyData[intent] || 0) + 1;
    dailyMap.set(dateKey, dailyData);
  });

  const topicStats: TopicStats[] = Array.from(intentCounts.entries())
    .map(([intent, count]) => {
      const config = INTENT_CONFIG[intent] || { label: intent, color: "#6b7280" };
      return {
        intent,
        label: config.label,
        messageCount: count,
        contextHitRate: 0,
        avgSourcesUsed: 0,
        leadConversions: 0,
        color: config.color,
      };
    })
    .sort((a, b) => b.messageCount - a.messageCount);

  const dailyTopics = Array.from(dailyMap.entries())
    .map(([date, data]) => ({
      date,
      pricing: data.pricing || 0,
      features: data.features || 0,
      support: data.troubleshooting || 0,
      general: data.general || 0,
      howTo: data["how-to"] || 0,
      contact: data.contact || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    topicStats,
    totals: {
      totalWithContext: 0,
      totalWithoutContext: topicStats.reduce((sum, t) => sum + t.messageCount, 0),
      overallContextHitRate: 0,
      avgSourcesPerMessage: 0,
    },
    dailyTopics,
  };
}
