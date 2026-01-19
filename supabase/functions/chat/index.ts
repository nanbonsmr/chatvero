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

    // Get chatbot settings
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", chatbot_id)
      .single();

    if (chatbotError || !chatbot) {
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

Keep responses concise (2-3 sentences max unless more detail is needed). Be helpful and engaging.`;

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
      console.error("AI Gateway error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content || "I apologize, I couldn't process that request.";

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
