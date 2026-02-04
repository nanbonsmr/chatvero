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
  job_title?: string;
  custom_data?: Record<string, unknown>;
}

interface EnrichmentResult {
  email?: string;
  phone?: string;
  name?: string;
  company?: {
    name?: string;
    domain?: string;
    industry?: string;
    size?: string;
    linkedin_url?: string;
  };
  person?: {
    linkedin_url?: string;
    job_title?: string;
    location?: string;
  };
}

// Fast enrichment with parallel API calls and timeout
async function enrichLeadFast(
  leadData: LeadRequest,
  apiKey: string
): Promise<EnrichmentResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    // Prepare enrichment request based on available data
    const enrichmentPayload: any = {
      name: `Lead-${Date.now()}`,
      datas: [{
        firstname: leadData.name?.split(' ')[0] || '',
        lastname: leadData.name?.split(' ').slice(1).join(' ') || '',
        ...(leadData.email && { email: leadData.email }),
        ...(leadData.company_name && { company_name: leadData.company_name }),
        ...(leadData.linkedin_url && { linkedin_url: leadData.linkedin_url }),
        enrich_fields: ["contact.emails", "contact.phones", "company.details", "contact.linkedin"]
      }]
    };

    console.log(`Enriching lead with data:`, JSON.stringify(enrichmentPayload.datas[0]));

    const response = await fetch("https://app.fullenrich.com/api/v1/contact/enrich/bulk", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(enrichmentPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FullEnrich API error:", response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log("Enrichment result:", JSON.stringify(result));

    // Parse the response into our format
    const enrichedData = result.data?.[0] || result.results?.[0] || {};
    
    return {
      email: enrichedData.email || enrichedData.contact?.email,
      phone: enrichedData.phone || enrichedData.contact?.phone,
      name: enrichedData.full_name || `${enrichedData.firstname || ''} ${enrichedData.lastname || ''}`.trim(),
      company: {
        name: enrichedData.company_name || enrichedData.company?.name,
        domain: enrichedData.company?.domain,
        industry: enrichedData.company?.industry,
        size: enrichedData.company?.size || enrichedData.company?.employees,
        linkedin_url: enrichedData.company?.linkedin_url,
      },
      person: {
        linkedin_url: enrichedData.linkedin_url || enrichedData.contact?.linkedin_url,
        job_title: enrichedData.job_title || enrichedData.title,
        location: enrichedData.location || enrichedData.city,
      }
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error("Enrichment request timed out");
    } else {
      console.error("Enrichment error:", error);
    }
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { 
      chatbot_id, 
      conversation_id, 
      email, 
      phone, 
      name, 
      company_name, 
      linkedin_url,
      job_title,
      custom_data 
    }: LeadRequest = await req.json();

    if (!chatbot_id) {
      return new Response(
        JSON.stringify({ error: "Missing chatbot_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we have at least one piece of contact info
    if (!email && !phone && !linkedin_url) {
      return new Response(
        JSON.stringify({ error: "At least one contact method (email, phone, or LinkedIn) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify chatbot exists (quick check)
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

    // Check for duplicate leads (by email or linkedin_url within same chatbot)
    let existingLead: { id: string; name: string | null; phone: string | null; company_name: string | null } | null = null;
    if (email) {
      const { data } = await supabase
        .from("leads")
        .select("id, name, phone, company_name")
        .eq("chatbot_id", chatbot_id)
        .eq("email", email)
        .limit(1);
      existingLead = data?.[0] || null;
    }
    
    if (!existingLead && linkedin_url) {
      const { data } = await supabase
        .from("leads")
        .select("id, name, phone, company_name")
        .eq("chatbot_id", chatbot_id)
        .eq("linkedin_url", linkedin_url)
        .limit(1);
      existingLead = data?.[0] || null;
    }

    // If lead exists, update instead of creating new
    if (existingLead) {
      console.log(`Updating existing lead ${existingLead.id}`);
      
      const updateData: Record<string, unknown> = { enrichment_status: 'pending' };
      if (name && !existingLead.name) updateData.name = name;
      if (phone && !existingLead.phone) updateData.phone = phone;
      if (company_name && !existingLead.company_name) updateData.company_name = company_name;
      
      await supabase
        .from("leads")
        .update(updateData)
        .eq("id", existingLead.id);

      // Trigger enrichment for existing lead
      const FULLENRICH_API_KEY = Deno.env.get("FULLENRICH_API_KEY");
      if (FULLENRICH_API_KEY) {
        const enrichResult = await enrichLeadFast({ chatbot_id, email, phone, name, company_name, linkedin_url }, FULLENRICH_API_KEY);
        
        if (enrichResult) {
          await supabase
            .from("leads")
            .update({
              enriched_data: enrichResult,
              enrichment_status: 'completed',
              email: email || enrichResult.email || undefined,
              phone: phone || enrichResult.phone || undefined,
              company_name: company_name || enrichResult.company?.name || undefined,
              linkedin_url: linkedin_url || enrichResult.person?.linkedin_url || undefined,
            })
            .eq("id", existingLead.id);
        } else {
          await supabase
            .from("leads")
            .update({ enrichment_status: 'failed' })
            .eq("id", existingLead.id);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          lead_id: existingLead.id, 
          updated: true,
          processing_time_ms: Date.now() - startTime 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new lead
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
        custom_data: { 
          ...(custom_data || {}),
          job_title: job_title || null,
          captured_at: new Date().toISOString(),
        },
        enrichment_status: 'pending'
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Error creating lead:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create lead" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Lead ${lead.id} created in ${Date.now() - startTime}ms`);

    // Start enrichment in background (non-blocking response)
    const FULLENRICH_API_KEY = Deno.env.get("FULLENRICH_API_KEY");
    
    if (FULLENRICH_API_KEY && (email || linkedin_url || (name && company_name))) {
      // Use EdgeRuntime.waitUntil for true async processing
      // But since Deno doesn't support waitUntil, we do a fast enrichment
      const enrichPromise = enrichLeadFast(
        { chatbot_id, email, phone, name, company_name, linkedin_url },
        FULLENRICH_API_KEY
      ).then(async (enrichResult) => {
        if (enrichResult) {
          console.log(`Enrichment completed for lead ${lead.id}`);
          await supabase
            .from("leads")
            .update({
              enriched_data: enrichResult,
              enrichment_status: 'completed',
              email: email || enrichResult.email || undefined,
              phone: phone || enrichResult.phone || undefined,
              company_name: company_name || enrichResult.company?.name || undefined,
              linkedin_url: linkedin_url || enrichResult.person?.linkedin_url || undefined,
            })
            .eq("id", lead.id);
        } else {
          console.log(`Enrichment failed for lead ${lead.id}`);
          await supabase
            .from("leads")
            .update({ enrichment_status: 'failed' })
            .eq("id", lead.id);
        }
      }).catch(err => {
        console.error(`Enrichment error for lead ${lead.id}:`, err);
        supabase
          .from("leads")
          .update({ enrichment_status: 'failed' })
          .eq("id", lead.id);
      });

      // Wait for enrichment but with a fast timeout for response
      // This ensures the response is quick while still processing
      await Promise.race([
        enrichPromise,
        new Promise(resolve => setTimeout(resolve, 3000)) // 3s max wait
      ]);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        processing_time_ms: Date.now() - startTime
      }),
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
