import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CrawlRequest {
  chatbot_id: string;
  url: string;
  max_pages?: number;
}

// Simple HTML text extractor
function extractTextFromHtml(html: string): { title: string; content: string } {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Remove script and style tags
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Remove all HTML tags
  content = content.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  content = content
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Clean up whitespace
  content = content
    .replace(/\s+/g, " ")
    .trim();

  // Limit content length to avoid storing too much
  if (content.length > 10000) {
    content = content.substring(0, 10000) + "...";
  }

  return { title, content };
}

// Extract links from HTML
function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      
      // Skip anchors, javascript, mailto, tel links
      if (href.startsWith("#") || href.startsWith("javascript:") || 
          href.startsWith("mailto:") || href.startsWith("tel:")) {
        continue;
      }

      // Resolve relative URLs
      const absoluteUrl = new URL(href, baseUrl).href;
      
      // Only include links from the same domain
      const base = new URL(baseUrl);
      const link = new URL(absoluteUrl);
      if (link.hostname === base.hostname) {
        // Remove hash and trailing slash for consistency
        link.hash = "";
        const cleanUrl = link.href.replace(/\/$/, "");
        if (!links.includes(cleanUrl)) {
          links.push(cleanUrl);
        }
      }
    } catch {
      // Invalid URL, skip
    }
  }

  return links;
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatbotCrawler/1.0)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      console.log(`Skipping non-HTML content at ${url}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify user owns the chatbot
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { chatbot_id, url, max_pages = 10 }: CrawlRequest = await req.json();

    if (!chatbot_id || !url) {
      return new Response(
        JSON.stringify({ error: "chatbot_id and url are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership
    const { data: chatbot, error: chatbotError } = await userSupabase
      .from("chatbots")
      .select("id, website_url")
      .eq("id", chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
      return new Response(
        JSON.stringify({ error: "Chatbot not found or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting crawl for chatbot ${chatbot_id} at ${url}`);

    const crawledUrls = new Set<string>();
    const toCrawl = [url];
    const results: { url: string; title: string; success: boolean }[] = [];
    const maxPagesLimit = Math.min(max_pages, 20); // Cap at 20 pages

    while (toCrawl.length > 0 && crawledUrls.size < maxPagesLimit) {
      const currentUrl = toCrawl.shift()!;
      
      // Normalize URL
      const normalizedUrl = currentUrl.replace(/\/$/, "");
      if (crawledUrls.has(normalizedUrl)) {
        continue;
      }

      crawledUrls.add(normalizedUrl);
      console.log(`Crawling: ${normalizedUrl}`);

      const html = await fetchPage(normalizedUrl);
      if (!html) {
        results.push({ url: normalizedUrl, title: "", success: false });
        continue;
      }

      const { title, content } = extractTextFromHtml(html);

      if (content.length < 50) {
        console.log(`Skipping ${normalizedUrl} - not enough content`);
        results.push({ url: normalizedUrl, title, success: false });
        continue;
      }

      // Upsert crawled content
      const { error: upsertError } = await supabase
        .from("crawled_pages")
        .upsert(
          {
            chatbot_id,
            url: normalizedUrl,
            title,
            content,
            crawled_at: new Date().toISOString(),
          },
          { onConflict: "chatbot_id,url" }
        );

      if (upsertError) {
        console.error(`Error saving ${normalizedUrl}:`, upsertError);
        results.push({ url: normalizedUrl, title, success: false });
      } else {
        results.push({ url: normalizedUrl, title, success: true });
      }

      // Extract and queue more links
      if (crawledUrls.size < maxPagesLimit) {
        const links = extractLinks(html, normalizedUrl);
        for (const link of links) {
          if (!crawledUrls.has(link) && !toCrawl.includes(link)) {
            toCrawl.push(link);
          }
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Crawl complete: ${successCount}/${results.length} pages saved`);

    return new Response(
      JSON.stringify({
        success: true,
        pages_crawled: results.length,
        pages_saved: successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Crawl error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Crawl failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
