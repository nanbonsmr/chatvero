import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface LeadRequest {
  chatbot_id: string;
  conversation_id?: string;
  email?: string;
  phone?: string;
  name?: string;
  custom_data?: Record<string, unknown>;
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

    const { chatbot_id, conversation_id, email, phone, name, custom_data }: LeadRequest = await req.json();

    if (!chatbot_id) {
      return new Response(
        JSON.stringify({ error: "Missing chatbot_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: "Either email or phone is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify chatbot exists
    const { data: chatbot } = await supabase
      .from("chatbots")
      .select("id")
      .eq("id", chatbot_id)
      .single();

    if (!chatbot) {
      return new Response(
        JSON.stringify({ error: "Chatbot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create lead
    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        chatbot_id,
        conversation_id: conversation_id || null,
        email: email || null,
        phone: phone || null,
        name: name || null,
        custom_data: custom_data || {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lead:", error);
      return new Response(
        JSON.stringify({ error: "Failed to capture lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, lead_id: lead.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Lead capture error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
