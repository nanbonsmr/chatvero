 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
export type Platform = "facebook" | "whatsapp" | "instagram" | "telegram";

const SUPABASE_URL = "https://czhltxnpaukjqmtgrgzc.supabase.co";
 
 export interface ChatbotChannel {
   id: string;
   chatbot_id: string;
   platform: Platform;
   is_active: boolean;
   credentials: Record<string, string>;
   page_id: string | null;
   page_name: string | null;
   webhook_token: string;
   connected_at: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export const useChannels = (chatbotId: string | undefined) => {
   return useQuery({
     queryKey: ["channels", chatbotId],
     queryFn: async (): Promise<ChatbotChannel[]> => {
       if (!chatbotId) return [];
 
       const { data, error } = await supabase
         .from("chatbot_channels")
         .select("*")
         .eq("chatbot_id", chatbotId)
         .order("created_at", { ascending: true });
 
       if (error) throw error;
       return (data || []) as ChatbotChannel[];
     },
     enabled: !!chatbotId,
   });
 };
 
 export const useConnectChannel = () => {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({
       chatbotId,
       platform,
       credentials,
       pageId,
       pageName,
     }: {
       chatbotId: string;
       platform: Platform;
       credentials: Record<string, string>;
       pageId?: string;
       pageName?: string;
     }) => {
       // Check if channel already exists
       const { data: existing } = await supabase
         .from("chatbot_channels")
         .select("id")
         .eq("chatbot_id", chatbotId)
         .eq("platform", platform)
         .maybeSingle();
 
       if (existing) {
         // Update existing channel
         const { data, error } = await supabase
           .from("chatbot_channels")
           .update({
             credentials,
             page_id: pageId,
             page_name: pageName,
             is_active: true,
             connected_at: new Date().toISOString(),
           })
           .eq("id", existing.id)
           .select()
           .single();
 
         if (error) throw error;
      const channel = data as ChatbotChannel;
      
      // Auto-register webhook for Telegram
      if (platform === "telegram" && credentials.bot_token) {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/register-telegram-webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channel_id: channel.id,
              bot_token: credentials.bot_token,
              webhook_token: channel.webhook_token,
            }),
          });
          const result = await response.json();
          if (!result.success) {
            console.error("Telegram webhook registration failed:", result);
          }
        } catch (err) {
          console.error("Failed to register Telegram webhook:", err);
        }
      }
      
      return channel;
       } else {
         // Create new channel
         const { data, error } = await supabase
           .from("chatbot_channels")
           .insert({
             chatbot_id: chatbotId,
             platform,
             credentials,
             page_id: pageId,
             page_name: pageName,
             is_active: true,
             connected_at: new Date().toISOString(),
           })
           .select()
           .single();
 
         if (error) throw error;
      const channel = data as ChatbotChannel;
      
      // Auto-register webhook for Telegram
      if (platform === "telegram" && credentials.bot_token) {
        try {
          const response = await fetch(`${SUPABASE_URL}/functions/v1/register-telegram-webhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channel_id: channel.id,
              bot_token: credentials.bot_token,
              webhook_token: channel.webhook_token,
            }),
          });
          const result = await response.json();
          if (!result.success) {
            console.error("Telegram webhook registration failed:", result);
          }
        } catch (err) {
          console.error("Failed to register Telegram webhook:", err);
        }
      }
      
      return channel;
       }
     },
     onSuccess: (_, variables) => {
       queryClient.invalidateQueries({ queryKey: ["channels", variables.chatbotId] });
     },
   });
 };
 
 export const useToggleChannel = () => {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({
       channelId,
       isActive,
       chatbotId,
     }: {
       channelId: string;
       isActive: boolean;
       chatbotId: string;
     }) => {
       const { error } = await supabase
         .from("chatbot_channels")
         .update({ is_active: isActive })
         .eq("id", channelId);
 
       if (error) throw error;
       return { channelId, isActive, chatbotId };
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ["channels", data.chatbotId] });
     },
   });
 };
 
 export const useDisconnectChannel = () => {
   const queryClient = useQueryClient();
 
   return useMutation({
     mutationFn: async ({
       channelId,
       chatbotId,
     }: {
       channelId: string;
       chatbotId: string;
     }) => {
       const { error } = await supabase
         .from("chatbot_channels")
         .delete()
         .eq("id", channelId);
 
       if (error) throw error;
       return { channelId, chatbotId };
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ["channels", data.chatbotId] });
     },
   });
 };