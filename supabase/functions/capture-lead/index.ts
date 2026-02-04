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
  company_name?: string;
  linkedin_url?: string;
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

    const { chatbot_id, conversation_id, email, phone, name, company_name, linkedin_url, custom_data }: LeadRequest = await req.json();

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

    // Create lead with enrichment fields
    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        chatbot_id,
        conversation_id: conversation_id || null,
        email: email || null,
        phone: phone || null,
        name: name || null,
        company_name: company_name || null,
        linkedin_url: linkedin_url || null,
        custom_data: custom_data || {},
        enrichment_status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trigger enrichment asynchronously (don't wait for it to return to user)
    const FULLENRICH_API_KEY = Deno.env.get("FULLENRICH_API_KEY");
    if (FULLENRICH_API_KEY && (email || linkedin_url || (name && company_name))) {
      console.log(`Triggering enrichment for lead ${lead.id}...`);
      
      // We'll perform the enrichment logic here
      // For a robust implementation, this could be a separate background task
      // but for simplicity in this edge function, we'll continue
      
      try {
        let enrichmentData = null;
        
        // Example FullEnrich API call (Single Enrichment)
        // Note: Real API might differ, adjusting based on search results
        const response = await fetch("https://app.fullenrich.com/api/v1/contact/enrich/bulk", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FULLENRICH_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: `Enrichment for ${lead.id}`,
            datas: [{
              firstname: name?.split(' ')[0] || '',
              lastname: name?.split(' ').slice(1).join(' ') || '',
              email: email || undefined,
              company_name: company_name || undefined,
              linkedin_url: linkedin_url || undefined,
              enrich_fields: ["contact.emails", "contact.phones", "company.details"]
            }]
          })
        });

        if (response.ok) {
          const result = await response.json();
          enrichmentData = result;
          
          await supabase
            .from("leads")
            .update({
              enriched_data: enrichmentData,
              enrichment_status: 'completed',
              // Update core fields if found better data
              email: email || result.data?.[0]?.email || lead.email,
              phone: phone || result.data?.[0]?.phone || lead.phone,
            })
            .eq("id", lead.id);
            
          console.log(`Enrichment completed for lead ${lead.id}`);
        } else {
          console.error("FullEnrich API error:", await response.text());
          await supabase
            .from("leads")
            .update({ enrichment_status: 'failed' })
            .eq("id", lead.id);
        }
      } catch (enrichError) {
        console.error("Enrichment process error:", enrichError);
        await supabase
          .from("leads")
          .update({ enrichment_status: 'failed' })
          .eq("id", lead.id);
      }
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
