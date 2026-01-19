import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Conversation {
  id: string;
  chatbot_id: string;
  visitor_id: string;
  started_at: string;
  ended_at: string | null;
  page_url: string | null;
  user_agent: string | null;
  category: string;
  chatbot_name?: string;
  message_count?: number;
  last_message?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
}

export function useConversations(chatbotId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          console.log('Conversation realtime update:', payload);
          // Invalidate and refetch conversations
          queryClient.invalidateQueries({ queryKey: ["conversations", user?.id, chatbotId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message realtime update:', payload);
          // Invalidate conversations to update message counts and last_message
          queryClient.invalidateQueries({ queryKey: ["conversations", user?.id, chatbotId] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [user, chatbotId, queryClient]);

  return useQuery({
    queryKey: ["conversations", user?.id, chatbotId],
    queryFn: async (): Promise<Conversation[]> => {
      let query = supabase
        .from("conversations")
        .select(`
          *,
          chatbots!inner(name, user_id),
          messages(id, content, created_at)
        `)
        .order("started_at", { ascending: false })
        .limit(100);

      if (chatbotId) {
        query = query.eq("chatbot_id", chatbotId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((conv: any) => ({
        id: conv.id,
        chatbot_id: conv.chatbot_id,
        visitor_id: conv.visitor_id,
        started_at: conv.started_at,
        ended_at: conv.ended_at,
        page_url: conv.page_url,
        user_agent: conv.user_agent,
        category: conv.category || "general",
        chatbot_name: conv.chatbots?.name,
        message_count: conv.messages?.length || 0,
        last_message: conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]?.content || "",
      }));
    },
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('New message received:', payload);
          // Invalidate and refetch messages
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        }
      )
      .subscribe((status) => {
        console.log('Messages realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up messages realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async (): Promise<Message[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!conversationId,
  });
}
