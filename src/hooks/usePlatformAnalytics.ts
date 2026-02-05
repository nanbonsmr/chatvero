 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { startOfDay, subDays } from "date-fns";
 
 interface PlatformStats {
   platform: string;
   conversations: number;
   messages: number;
   leads: number;
   label: string;
   color: string;
 }
 
 interface PlatformAnalyticsData {
   platformStats: PlatformStats[];
   totals: {
     totalFromSocial: number;
     totalFromWidget: number;
     socialPercentage: number;
   };
 }
 
 const PLATFORM_CONFIG: Record<string, { label: string; color: string }> = {
   widget: { label: "Website Widget", color: "#6366f1" },
   facebook: { label: "Facebook", color: "#1877f2" },
   instagram: { label: "Instagram", color: "#e4405f" },
   whatsapp: { label: "WhatsApp", color: "#25d366" },
   telegram: { label: "Telegram", color: "#0088cc" },
 };
 
 export function usePlatformAnalytics(days: number = 30, chatbotId?: string) {
   return useQuery({
     queryKey: ["platform-analytics", days, chatbotId],
     queryFn: async (): Promise<PlatformAnalyticsData> => {
       const startDate = startOfDay(subDays(new Date(), days));
 
       // Get chatbots
       let chatbotsQuery = supabase.from("chatbots").select("id");
       if (chatbotId) {
         chatbotsQuery = chatbotsQuery.eq("id", chatbotId);
       }
 
       const { data: chatbots, error: chatbotsError } = await chatbotsQuery;
       if (chatbotsError) throw chatbotsError;
 
       const chatbotIds = chatbots?.map((c) => c.id) || [];
 
       if (chatbotIds.length === 0) {
         return {
           platformStats: [],
           totals: { totalFromSocial: 0, totalFromWidget: 0, socialPercentage: 0 },
         };
       }
 
       // Get conversations with platform info
       const { data: conversations, error: convError } = await supabase
         .from("conversations")
         .select("id, platform, message_count, has_lead")
         .in("chatbot_id", chatbotIds)
         .gte("started_at", startDate.toISOString());
 
       if (convError) throw convError;
 
       // Aggregate by platform
       const platformMap = new Map<string, { conversations: number; messages: number; leads: number }>();
 
       // Initialize all platforms
       Object.keys(PLATFORM_CONFIG).forEach((platform) => {
         platformMap.set(platform, { conversations: 0, messages: 0, leads: 0 });
       });
 
       conversations?.forEach((conv) => {
         const platform = conv.platform || "widget";
         const stats = platformMap.get(platform) || { conversations: 0, messages: 0, leads: 0 };
         stats.conversations++;
         stats.messages += conv.message_count || 0;
         if (conv.has_lead) stats.leads++;
         platformMap.set(platform, stats);
       });
 
       const platformStats: PlatformStats[] = Array.from(platformMap.entries())
         .map(([platform, stats]) => ({
           platform,
           ...stats,
           label: PLATFORM_CONFIG[platform]?.label || platform,
           color: PLATFORM_CONFIG[platform]?.color || "#888888",
         }))
         .filter((p) => p.conversations > 0)
         .sort((a, b) => b.conversations - a.conversations);
 
       const totalFromWidget = platformMap.get("widget")?.conversations || 0;
       const totalFromSocial = (conversations?.length || 0) - totalFromWidget;
       const totalAll = conversations?.length || 0;
 
       return {
         platformStats,
         totals: {
           totalFromSocial,
           totalFromWidget,
           socialPercentage: totalAll > 0 ? Math.round((totalFromSocial / totalAll) * 100) : 0,
         },
       };
     },
     enabled: true,
   });
 }