import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CrawlResult {
  success: boolean;
  pages_crawled: number;
  pages_saved: number;
  results: { url: string; title: string; success: boolean }[];
}

export function useCrawlWebsite() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crawl = async (chatbotId: string, url: string, maxPages = 10): Promise<CrawlResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

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
            max_pages: maxPages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Crawl failed");
      }

      const result: CrawlResult = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Crawl failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { crawl, isLoading, error };
}
