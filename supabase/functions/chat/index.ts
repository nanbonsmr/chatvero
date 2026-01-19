import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ChatRequest {
  chatbot_id: string;
  message: string;
  conversation_id?: string;
  visitor_id: string;
}

// Simple embedding function matching the generate-embedding function
function generateSimpleEmbedding(text: string): number[] {
  const normalizedText = text.toLowerCase().trim();
  const embedding = new Array(384).fill(0);
  
  const ngrams: string[] = [];
  
  for (let i = 0; i < normalizedText.length; i++) {
    ngrams.push(normalizedText[i]);
  }
  for (let i = 0; i < normalizedText.length - 1; i++) {
    ngrams.push(normalizedText.slice(i, i + 2));
  }
  for (let i = 0; i < normalizedText.length - 2; i++) {
    ngrams.push(normalizedText.slice(i, i + 3));
  }
  
  const words = normalizedText.split(/\s+/).filter(w => w.length > 0);
  for (const word of words) {
    ngrams.push(`w_${word}`);
    if (word.length > 3) {
      ngrams.push(`p_${word.slice(0, 3)}`);
      ngrams.push(`s_${word.slice(-3)}`);
    }
  }
  
  for (const ngram of ngrams) {
    let hash1 = 0;
    let hash2 = 0;
    for (let i = 0; i < ngram.length; i++) {
      hash1 = (hash1 * 31 + ngram.charCodeAt(i)) >>> 0;
      hash2 = (hash2 * 37 + ngram.charCodeAt(i)) >>> 0;
    }
    
    embedding[hash1 % 384] += 1;
    embedding[hash2 % 384] += 0.5;
    embedding[(hash1 + hash2) % 384] += 0.25;
  }
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }
  
  return embedding;
}

// Fallback keyword matching for chunks without embeddings
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "to", "of", "in", "for", "on", "with",
    "at", "by", "from", "as", "into", "through", "during", "before", "after",
    "above", "below", "between", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "just", "and", "but", "if",
    "or", "because", "until", "while", "about", "against", "this", "that",
    "these", "those", "what", "which", "who", "whom", "i", "you", "he", "she",
    "it", "we", "they", "me", "him", "her", "us", "them", "my", "your", "his",
    "its", "our", "their", "am", "please", "thanks", "thank", "hi", "hello",
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

function scoreChunk(chunkContent: string, keywords: string[]): number {
  const chunkWords = new Set(chunkContent.toLowerCase().split(/\s+/));
  let score = 0;
  for (const keyword of keywords) {
    if (chunkWords.has(keyword)) score += 1;
    for (const word of chunkWords) {
      if (word.includes(keyword) || keyword.includes(word)) score += 0.5;
    }
  }
  return score;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { chatbot_id, message, conversation_id, visitor_id }: ChatRequest = await req.json();

    if (!chatbot_id || !message || !visitor_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Chat request for chatbot: ${chatbot_id}, message: "${message.substring(0, 50)}..."`);

    // Get chatbot settings
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
      console.error("Chatbot not found:", chatbotError);
      return new Response(
        JSON.stringify({ error: "Chatbot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!chatbot.is_active) {
      return new Response(
        JSON.stringify({ error: "Chatbot is disabled" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create conversation
    let currentConversationId = conversation_id;
    
    if (!currentConversationId) {
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          chatbot_id,
          visitor_id,
          page_url: req.headers.get("referer") || null,
          user_agent: req.headers.get("user-agent") || null,
        })
        .select()
        .single();

      if (convError) {
        console.error("Error creating conversation:", convError);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      currentConversationId = newConversation.id;
    }

    // Save user message
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Generate embedding for user message for semantic search
    const queryEmbedding = generateSimpleEmbedding(message);
    console.log("Generated query embedding for semantic search");

    // Try semantic search first using the match_chunks function
    let relevantContext = "";
    let usedSemanticSearch = false;
    
    try {
      const { data: semanticChunks, error: semanticError } = await supabase.rpc("match_chunks", {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_chatbot_id: chatbot_id,
        match_threshold: 0.3,
        match_count: 5,
      });

      if (!semanticError && semanticChunks && semanticChunks.length > 0) {
        usedSemanticSearch = true;
        console.log(`Semantic search found ${semanticChunks.length} relevant chunks`);
        
        relevantContext = "\n\n### Relevant Knowledge Base Information:\n\n";
        for (const chunk of semanticChunks) {
          const source = chunk.source_url || chunk.source_type || "document";
          relevantContext += `[Source: ${source}, Relevance: ${(chunk.similarity * 100).toFixed(0)}%]\n${chunk.content}\n\n---\n\n`;
        }
      } else if (semanticError) {
        console.log("Semantic search error, falling back to keyword search:", semanticError.message);
      }
    } catch (err) {
      console.log("Semantic search failed, using keyword fallback:", err);
    }

    // Fallback to keyword search if semantic search didn't find results
    if (!usedSemanticSearch) {
      const keywords = extractKeywords(message);
      console.log(`Falling back to keyword search with: ${keywords.join(", ")}`);

      const { data: chunks } = await supabase
        .from("chatbot_chunks")
        .select("content, metadata, source_type")
        .eq("chatbot_id", chatbot_id)
        .limit(100);

      if (chunks && chunks.length > 0 && keywords.length > 0) {
        const scoredChunks = chunks
          .map(chunk => ({ ...chunk, score: scoreChunk(chunk.content, keywords) }))
          .filter(chunk => chunk.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        if (scoredChunks.length > 0) {
          console.log(`Keyword search found ${scoredChunks.length} relevant chunks`);
          relevantContext = "\n\n### Relevant Knowledge Base Information:\n\n";
          for (const chunk of scoredChunks) {
            const source = chunk.metadata?.file_name || chunk.source_type || "document";
            relevantContext += `[Source: ${source}]\n${chunk.content}\n\n---\n\n`;
          }
        }
      }
    }

    // Also get crawled website content as fallback/additional context
    const { data: crawledPages } = await supabase
      .from("crawled_pages")
      .select("url, title, content")
      .eq("chatbot_id", chatbot_id)
      .limit(3);

    let websiteContext = "";
    if (crawledPages && crawledPages.length > 0) {
      // Extract keywords for scoring crawled pages
      const pageKeywords = extractKeywords(message);
      
      // Score crawled pages too
      const scoredPages = crawledPages
        .map(page => ({
          ...page,
          score: scoreChunk(page.content, pageKeywords),
        }))
        .filter(page => page.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      if (scoredPages.length > 0) {
        websiteContext = "\n\n### Website Information:\n\n";
        for (const page of scoredPages) {
          websiteContext += `[${page.title || page.url}]\n${page.content.substring(0, 1500)}\n\n---\n\n`;
        }
      }
    }

    // Combine contexts
    const combinedContext = relevantContext + websiteContext;
    const hasContext = combinedContext.trim().length > 0;

    // Build system prompt based on chatbot settings
    const toneDescriptions: Record<string, string> = {
      professional: "formal, business-focused, and professional",
      friendly: "warm, conversational, and approachable",
      sales: "persuasive, enthusiastic, and action-oriented",
    };

    const goalInstructions: Record<string, string> = {
      lead_generation: "Your primary goal is to capture visitor contact information (email, phone). Naturally guide conversations toward asking for their email or phone number to follow up.",
      sales: "Your primary goal is to convert visitors into customers. Highlight product benefits, address objections, and encourage purchases or demos.",
      support: "Your primary goal is to provide helpful customer support. Answer questions accurately and solve problems efficiently.",
    };

    const systemPrompt = `You are an AI assistant chatbot for ${chatbot.name}. 
You are embedded on the website: ${chatbot.website_url}

Personality: Be ${toneDescriptions[chatbot.tone] || "friendly and helpful"}.

${goalInstructions[chatbot.goal] || "Help visitors with their questions."}

${hasContext ? `Use the following knowledge base information to answer questions accurately. If the information doesn't contain the answer, you can provide general assistance but mention that you may not have complete information about that specific topic.` : ""}

Keep responses concise (2-3 sentences max unless more detail is needed). Be helpful and engaging.
${combinedContext}`;

    console.log(`System prompt length: ${systemPrompt.length} chars, has context: ${hasContext}`);

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...(history || []).map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";

    console.log(`AI response: "${assistantMessage.substring(0, 100)}..."`);

    // Save assistant message
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "assistant",
      content: assistantMessage,
    });

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversation_id: currentConversationId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});