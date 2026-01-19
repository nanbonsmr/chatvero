import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CrawledPage {
  id: string;
  chatbot_id: string;
  url: string;
  title: string | null;
  content: string;
  crawled_at: string;
}

export function useCrawledPages(chatbotId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["crawled-pages", chatbotId],
    queryFn: async (): Promise<CrawledPage[]> => {
      if (!chatbotId) return [];

      const { data, error } = await supabase
        .from("crawled_pages")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("crawled_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!chatbotId,
  });
}

export function useDeleteCrawledPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pageId, chatbotId }: { pageId: string; chatbotId: string }) => {
      const { error } = await supabase
        .from("crawled_pages")
        .delete()
        .eq("id", pageId);

      if (error) throw error;
      return chatbotId;
    },
    onSuccess: (chatbotId) => {
      queryClient.invalidateQueries({ queryKey: ["crawled-pages", chatbotId] });
    },
  });
}

export function useRecrawlPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chatbotId, url }: { chatbotId: string; url: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        "https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/crawl-website",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            chatbot_id: chatbotId,
            url,
            max_pages: 1,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Recrawl failed");
      }

      return { chatbotId, result: await response.json() };
    },
    onSuccess: ({ chatbotId }) => {
      queryClient.invalidateQueries({ queryKey: ["crawled-pages", chatbotId] });
    },
  });
}
