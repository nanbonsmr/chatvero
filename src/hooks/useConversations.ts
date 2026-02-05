import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Conversation {
  id: string;
  chatbot_id: string;
  visitor_id: string;
  started_at: string;
  ended_at: string | null;
  page_url: string | null;
  user_agent: string | null;
  category: string;
  archived_at: string | null;
   platform: string;
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
  const isMountedRef = useRef(true);

  const queryResult = useQuery({
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
        archived_at: conv.archived_at,
         platform: conv.platform || "widget",
        chatbot_name: conv.chatbots?.name,
        message_count: conv.messages?.length || 0,
        last_message: conv.messages?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]?.content || "",
      }));
    },
    enabled: !!user,
  });

  // Set up realtime subscription after initial query setup
  useEffect(() => {
    isMountedRef.current = true;

    if (!user) return;

    const channelName = `conversations-${chatbotId || 'all'}-${user.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          if (isMountedRef.current) {
            // Use setTimeout to avoid calling during render
            setTimeout(() => {
              if (isMountedRef.current) {
                queryClient.invalidateQueries({ queryKey: ["conversations", user?.id, chatbotId] });
              }
            }, 100);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          if (isMountedRef.current) {
            setTimeout(() => {
              if (isMountedRef.current) {
                queryClient.invalidateQueries({ queryKey: ["conversations", user?.id, chatbotId] });
              }
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, chatbotId, queryClient]);

  return queryResult;
}

export function useConversationMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);

  const queryResult = useQuery({
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

  // Set up realtime subscription for messages
  useEffect(() => {
    isMountedRef.current = true;

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
        () => {
          if (isMountedRef.current) {
            setTimeout(() => {
              if (isMountedRef.current) {
                queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
              }
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return queryResult;
}

export function useArchiveConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationId, archive }: { conversationId: string; archive: boolean }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: archive ? "Conversation archived" : "Conversation restored",
        description: archive 
          ? "The conversation has been moved to archives" 
          : "The conversation has been restored",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive",
      });
      console.error("Archive error:", error);
    },
  });
}

export function useDeleteConversation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // First delete messages
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("conversation_id", conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Conversation deleted",
        description: "The conversation and all its messages have been permanently deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
      console.error("Delete error:", error);
    },
  });
}

export function useBulkArchiveConversations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationIds, archive }: { conversationIds: string[]; archive: boolean }) => {
      const { error } = await supabase
        .from("conversations")
        .update({ archived_at: archive ? new Date().toISOString() : null })
        .in("id", conversationIds);

      if (error) throw error;
      return conversationIds.length;
    },
    onSuccess: (count, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: archive ? "Conversations archived" : "Conversations restored",
        description: `${count} conversation${count !== 1 ? "s" : ""} ${archive ? "archived" : "restored"}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update conversations",
        variant: "destructive",
      });
      console.error("Bulk archive error:", error);
    },
  });
}

export function useBulkDeleteConversations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (conversationIds: string[]) => {
      // First delete all messages for these conversations
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .in("conversation_id", conversationIds);

      if (messagesError) throw messagesError;

      // Then delete the conversations
      const { error } = await supabase
        .from("conversations")
        .delete()
        .in("id", conversationIds);

      if (error) throw error;
      return conversationIds.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast({
        title: "Conversations deleted",
        description: `${count} conversation${count !== 1 ? "s" : ""} permanently deleted`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete conversations",
        variant: "destructive",
      });
      console.error("Bulk delete error:", error);
    },
  });
}
