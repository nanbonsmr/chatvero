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

interface RetrievedContext {
  content: string;
  source: string;
  sourceType: "document" | "website" | "chunk";
  relevanceScore: number;
  metadata?: Record<string, unknown>;
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

// Enhanced keyword extraction with stemming-like behavior
function extractKeywords(text: string): { keywords: string[]; phrases: string[] } {
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
    "want", "need", "tell", "know", "like", "get", "give", "take", "make",
  ]);

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, " ");
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  
  // Extract individual keywords
  const keywords = words.filter(word => !stopWords.has(word));
  
  // Extract meaningful phrases (2-3 word combinations)
  const phrases: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    if (i < words.length - 2 && !stopWords.has(words[i]) && !stopWords.has(words[i + 2])) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return { keywords: [...new Set(keywords)], phrases: [...new Set(phrases)] };
}

// Advanced scoring for chunks with multiple factors
function scoreChunk(
  chunkContent: string, 
  keywords: string[], 
  phrases: string[],
  queryLength: number
): number {
  const lowerContent = chunkContent.toLowerCase();
  const contentWords = new Set(lowerContent.split(/\s+/));
  
  let score = 0;
  
  // Exact phrase matches (highest weight)
  for (const phrase of phrases) {
    if (lowerContent.includes(phrase)) {
      score += 5;
    }
  }
  
  // Keyword matches
  for (const keyword of keywords) {
    if (contentWords.has(keyword)) {
      score += 2;
    } else {
      // Partial match (word contains keyword or vice versa)
      for (const word of contentWords) {
        if (word.includes(keyword) || keyword.includes(word)) {
          score += 0.5;
        }
      }
    }
  }
  
  // Boost for keyword density
  const keywordCount = keywords.filter(k => contentWords.has(k)).length;
  const density = keywordCount / Math.max(keywords.length, 1);
  score += density * 3;
  
  // Boost for content that's appropriately sized (not too short)
  if (chunkContent.length > 200) {
    score += 1;
  }
  
  return score;
}

// Detect question intent
function detectIntent(message: string): string {
  const lower = message.toLowerCase();
  
  if (lower.match(/\b(price|pricing|cost|how much|subscription|plan)\b/)) {
    return "pricing";
  }
  if (lower.match(/\b(feature|can you|does it|support|capability|able to)\b/)) {
    return "features";
  }
  if (lower.match(/\b(how to|how do|guide|tutorial|step|setup|install|configure)\b/)) {
    return "how-to";
  }
  if (lower.match(/\b(contact|email|phone|reach|support|help)\b/)) {
    return "contact";
  }
  if (lower.match(/\b(who|about|company|team|founded)\b/)) {
    return "about";
  }
  if (lower.match(/\b(problem|issue|error|not working|broken|fix|trouble)\b/)) {
    return "troubleshooting";
  }
  
  return "general";
}

// Extract lead info from message
function extractLeadInfo(message: string): { email?: string; linkedin?: string; company?: string; name?: string } {
  const info: any = {};
  
  // Email regex
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) info.email = emailMatch[0];
  
  // LinkedIn regex
  const linkedinMatch = message.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?/);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];
  
  // Very basic company detection (usually after "at" or "from")
  const companyMatch = message.match(/\b(at|from|with)\s+([A-Z][\w\s&]+?)(?=\s|$|\.|\,)/);
  if (companyMatch && companyMatch[2].length > 2) {
    info.company = companyMatch[2].trim();
  }

  // Basic name detection (e.g. "I'm [Name]" or "My name is [Name]")
  const nameMatch = message.match(/\b(my name is|i am|i'm)\s+([A-Z][a-z]+(\s+[A-Z][a-z]+)?)/i);
  if (nameMatch) {
    info.name = nameMatch[2].trim();
  }
  
  return info;
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
    
    const intent = detectIntent(message);
    console.log(`Detected intent: ${intent}`);

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

    // Generate embedding for semantic search
    const queryEmbedding = generateSimpleEmbedding(message);
    const { keywords, phrases } = extractKeywords(message);
    
    console.log(`Keywords: ${keywords.slice(0, 5).join(", ")}, Phrases: ${phrases.slice(0, 3).join(", ")}`);

    // Collect all context from multiple sources
    const retrievedContexts: RetrievedContext[] = [];

    // 1. Semantic search on document chunks
    try {
      const { data: semanticChunks, error: semanticError } = await supabase.rpc("match_chunks", {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_chatbot_id: chatbot_id,
        match_threshold: 0.25,
        match_count: 8,
      });

      if (!semanticError && semanticChunks && semanticChunks.length > 0) {
        console.log(`Semantic search found ${semanticChunks.length} chunks`);
        
        for (const chunk of semanticChunks) {
          retrievedContexts.push({
            content: chunk.content,
            source: chunk.metadata?.file_name || chunk.source_url || "Document",
            sourceType: chunk.source_type === "website" ? "website" : "document",
            relevanceScore: chunk.similarity,
            metadata: chunk.metadata,
          });
        }
      } else if (semanticError) {
        console.log("Semantic search error:", semanticError.message);
      }
    } catch (err) {
      console.log("Semantic search failed:", err);
    }

    // 2. Keyword search on chunks (fallback/supplement)
    if (keywords.length > 0) {
      const { data: allChunks } = await supabase
        .from("chatbot_chunks")
        .select("content, metadata, source_type, source_url")
        .eq("chatbot_id", chatbot_id)
        .limit(150);

      if (allChunks && allChunks.length > 0) {
        const scoredChunks = allChunks
          .map(chunk => ({
            ...chunk,
            score: scoreChunk(chunk.content, keywords, phrases, message.length),
          }))
          .filter(chunk => chunk.score > 2)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        for (const chunk of scoredChunks) {
          // Avoid duplicates
          const isDuplicate = retrievedContexts.some(ctx => 
            ctx.content.substring(0, 100) === chunk.content.substring(0, 100)
          );
          
          if (!isDuplicate) {
            retrievedContexts.push({
              content: chunk.content,
              source: chunk.metadata?.file_name || chunk.source_url || "Document",
              sourceType: chunk.source_type === "website" ? "website" : "document",
              relevanceScore: chunk.score / 10, // Normalize to 0-1 range
              metadata: chunk.metadata,
            });
          }
        }
        console.log(`Keyword search added ${scoredChunks.length} chunks`);
      }
    }

    // 3. Search crawled website pages
    const { data: crawledPages } = await supabase
      .from("crawled_pages")
      .select("url, title, content")
      .eq("chatbot_id", chatbot_id)
      .limit(50);

    if (crawledPages && crawledPages.length > 0) {
      const scoredPages = crawledPages
        .map(page => ({
          ...page,
          score: scoreChunk(page.content, keywords, phrases, message.length),
        }))
        .filter(page => page.score > 2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      for (const page of scoredPages) {
        retrievedContexts.push({
          content: page.content.substring(0, 2000),
          source: page.title || page.url,
          sourceType: "website",
          relevanceScore: page.score / 10,
        });
      }
      console.log(`Website search added ${scoredPages.length} pages`);
    }

    // Sort all contexts by relevance and deduplicate
    const sortedContexts = retrievedContexts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    // Build rich context for the AI
    let contextSection = "";
    const sources: string[] = [];
    
    if (sortedContexts.length > 0) {
      contextSection = "\n\n## Knowledge Base Context\n\n";
      contextSection += "Use the following information to answer the user's question accurately. ";
      contextSection += "Prioritize information from documents and website content. ";
      contextSection += "If information conflicts, prefer more specific details over general ones.\n\n";
      
      for (const ctx of sortedContexts) {
        const sourceLabel = ctx.sourceType === "website" ? "🌐 Website" : "📄 Document";
        const confidenceLabel = ctx.relevanceScore > 0.5 ? "HIGH" : ctx.relevanceScore > 0.3 ? "MEDIUM" : "LOW";
        
        contextSection += `### ${sourceLabel}: ${ctx.source} [Relevance: ${confidenceLabel}]\n`;
        contextSection += `${ctx.content}\n\n---\n\n`;
        
        if (!sources.includes(ctx.source)) {
          sources.push(ctx.source);
        }
      }
    }

    const hasContext = sortedContexts.length > 0;
    console.log(`Total context items: ${sortedContexts.length}, Sources: ${sources.length}`);

    // Build advanced system prompt with strong goal-driven behavior
    const toneDescriptions: Record<string, string> = {
      professional: "formal, business-focused, and professional. Use clear language and maintain a respectful tone. Avoid slang or overly casual expressions.",
      friendly: "warm, conversational, and approachable. Use a personable tone with occasional emojis. Be helpful while maintaining a casual but professional demeanor.",
      sales: "persuasive, enthusiastic, and action-oriented. Use exciting language, highlight benefits, and create urgency. Be confident and motivating.",
    };

    const goalInstructions: Record<string, string> = {
      lead_generation: `🎯 YOUR PRIMARY MISSION: Capture visitor contact information (Email, Name, Company Name, or LinkedIn URL).

**CRITICAL BEHAVIORS:**
1. Within the first 2-3 exchanges, naturally offer something valuable in exchange for contact info:
   - "I'd love to send you more details - what's the best email and company name to reach you?"
   - "I can look up some specific insights for your business. What's your company name or LinkedIn profile?"
   - "Want me to have someone follow up with you personally? Just need your name and company!"
   - "I can set up a personalized demo for you - what's your email or LinkedIn URL?"

2. When answering questions, always tie back to a CTA:
   - After explaining features: "Want to see how this works for your specific company? Share your LinkedIn profile and I'll prepare some examples."
   - After pricing info: "I can have our team send a custom proposal to your company - what's your work email?"

3. If the visitor seems interested, gently ask for contact info before they leave:
   - "Before you go, can I get your LinkedIn URL so we can stay in touch?"

4. Track what they're interested in and use it as leverage:
   - "Since you're interested in [topic], I can have our specialist reach out to your team - just need your company name!"

**DO NOT**: Be pushy or ask for contact info more than twice if declined. Respect their decision.`,

      sales: `🎯 YOUR PRIMARY MISSION: Convert visitors into customers or get them to take action (demo, trial, purchase).

**CRITICAL BEHAVIORS:**
1. Always highlight VALUE and BENEFITS over features:
   - Instead of "We have X feature" → "You'll save 10 hours a week with X"
   - Use phrases like "imagine...", "what if you could...", "other customers love..."

2. Create urgency naturally:
   - "We're currently offering a special deal..."
   - "Most customers start with a free trial to see the difference..."
   - "The sooner you start, the sooner you'll see results"

3. Overcome objections proactively:
   - Price concerns: Emphasize ROI and value
   - Timing concerns: Highlight ease of getting started
   - Trust concerns: Use testimonials and case studies from knowledge base

4. Always end with a clear CTA:
   - "Ready to get started? I can help you right now!"
   - "Want me to walk you through how to sign up?"
   - "Should I connect you with our team for a personalized demo?"

5. Use social proof when available:
   - "Many of our customers in [industry] love..."
   - "This is actually our most popular option because..."

**DO NOT**: Be aggressive or make the visitor feel pressured. Build trust first.`,

      support: `🎯 YOUR PRIMARY MISSION: Solve problems quickly and leave visitors satisfied.

**CRITICAL BEHAVIORS:**
1. Acknowledge their frustration/question immediately:
   - "I understand that's frustrating - let me help you fix this."
   - "Great question! Here's what you need to know..."

2. Provide step-by-step solutions when applicable:
   - Number your steps clearly
   - Ask if they need clarification after complex explanations

3. Be proactive about related issues:
   - "This might also help prevent similar issues in the future..."
   - "While we're here, did you also want to know about..."

4. If you can't solve it, escalate gracefully:
   - "This needs a specialist's attention. Can I get your email to have someone reach out?"
   - "I want to make sure this is handled properly - let me connect you with our support team."

5. Always confirm resolution:
   - "Did that solve your issue?"
   - "Is there anything else I can help with?"

**DO NOT**: Make assumptions about the problem. Ask clarifying questions if needed.`,
    };

    const intentGuidance: Record<string, string> = {
      pricing: `The user is asking about pricing. ${chatbot.goal === "sales" ? "This is a buying signal! Be specific about value, mention any promotions, and guide toward a decision." : chatbot.goal === "lead_generation" ? "Great opportunity to offer a custom quote in exchange for contact info!" : "Provide accurate pricing info from the knowledge base."}`,
      features: `The user wants to know about features. ${chatbot.goal === "sales" ? "Focus on benefits and how features solve their problems. End with a CTA to try it out." : "Be specific and accurate about capabilities."}`,
      "how-to": "The user needs step-by-step guidance. Be clear, sequential, and thorough. Number your steps.",
      contact: `The user wants to reach someone. ${chatbot.goal === "lead_generation" ? "Perfect! Get their contact info so the team can reach out to them instead." : "Provide contact information if available."}`,
      about: "The user wants to learn about the company/product. Share relevant background information and build trust.",
      troubleshooting: "The user has a problem. Be empathetic first, then provide clear solutions. Ask clarifying questions if needed.",
      general: "Understand what the user needs and provide helpful, relevant information while keeping your primary goal in mind.",
    };

    const goalReminder: Record<string, string> = {
      lead_generation: "\n\n⚠️ REMEMBER: Your success is measured by leads captured. Look for natural opportunities to ask for contact info!",
      sales: "\n\n⚠️ REMEMBER: Your success is measured by conversions. Always guide toward action (demo, trial, purchase)!",
      support: "\n\n⚠️ REMEMBER: Your success is measured by customer satisfaction. Ensure the visitor's issue is fully resolved!",
    };

    const systemPrompt = `# AI Assistant Configuration

## Identity
You are an AI assistant for **${chatbot.name}**${chatbot.website_url ? ` (${chatbot.website_url})` : ""}.

## Communication Style
${toneDescriptions[chatbot.tone] || toneDescriptions.friendly}

## 🎯 Primary Objective (THIS IS CRITICAL)
${goalInstructions[chatbot.goal] || goalInstructions.support}

## Current User Intent
${intentGuidance[intent] || intentGuidance.general}

## Response Guidelines
1. **Be Accurate**: Only state facts from the provided knowledge base. If unsure, say so.
2. **Be Concise**: Keep responses focused (2-4 sentences unless detail is needed).
3. **Be Goal-Oriented**: Every response should subtly work toward your primary objective.
4. **Be Natural**: Don't be robotic. Match the tone and be conversational.
5. **End with Purpose**: Most responses should end with a question or CTA relevant to your goal.

${hasContext ? `## Available Knowledge
You have access to ${sortedContexts.length} relevant pieces of information from:
${sources.map(s => `- ${s}`).join("\n")}

Use this knowledge to provide accurate, helpful responses. If the user's question isn't covered, acknowledge that and offer alternatives.` : `## Knowledge Status
No specific knowledge base content was found for this query. Provide helpful general assistance while working toward your primary goal.`}
${goalReminder[chatbot.goal] || ""}
${contextSection}`;

    console.log(`System prompt length: ${systemPrompt.length} chars`);

    // Call AI with enhanced prompt
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
        max_tokens: 600,
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

    // Save assistant message with analytics data
    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role: "assistant",
      content: assistantMessage,
      intent: intent,
      has_context: hasContext,
      sources_used: sources.length,
    });

    // Lead capture detection and processing
    const leadInfo = extractLeadInfo(message);
    if (leadInfo.email || leadInfo.linkedin || leadInfo.company || leadInfo.name) {
      console.log("Potential lead info detected:", leadInfo);
      try {
        const { error: leadError } = await supabase
          .from("leads")
          .insert({
            chatbot_id,
            conversation_id: currentConversationId,
            email: leadInfo.email || null,
            name: leadInfo.name || null,
            phone: null,
            company_name: leadInfo.company || null,
            linkedin_url: leadInfo.linkedin || null,
          });

        if (leadError) {
          console.error("Lead insert error:", leadError);
        } else {
          console.log("Lead inserted successfully");
          // Update conversation to mark as having a lead
          await supabase
            .from("conversations")
            .update({ has_lead: true })
            .eq("id", currentConversationId);
            
          // Trigger enrichment by calling the capture-lead function
          fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/capture-lead`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatbot_id,
              conversation_id: currentConversationId,
              email: leadInfo.email,
              name: leadInfo.name,
              company_name: leadInfo.company,
              linkedin_url: leadInfo.linkedin,
            })
          }).catch(err => console.error("Enrichment trigger failed:", err));
        }
      } catch (err) {
        console.error("Lead capture processing failed:", err);
      }
    }

    // Update conversation with primary intent and message count
    await supabase
      .from("conversations")
      .update({ 
        primary_intent: intent,
        message_count: (history?.length || 0) + 2, // user + assistant message
      })
      .eq("id", currentConversationId);

    // Update analytics aggregates
    try {
      await supabase.rpc("update_conversation_analytics", {
        p_chatbot_id: chatbot_id,
        p_intent: intent,
        p_has_context: hasContext,
        p_sources_used: sources.length,
        p_is_lead: false,
      });
    } catch (analyticsError) {
      console.error("Failed to update analytics:", analyticsError);
      // Don't fail the request if analytics update fails
    }

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversation_id: currentConversationId,
        sources: sources.slice(0, 3),
        intent: intent,
        hasContext: hasContext,
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
