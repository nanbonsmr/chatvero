import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

if (import.meta.main) {
  Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create client with the user's auth header to validate the token
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      // Use getUser() to validate the token - works with ES256 signing keys
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      
      if (authError || !user) {
        console.error("Auth error:", authError);
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { plan } = await req.json();

      if (!plan || !["starter", "growth", "business"].includes(plan)) {
        return new Response(JSON.stringify({ error: "Invalid plan" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use service role client for database operations
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Map plans to Dodo product IDs
      const planMap: Record<string, string> = {
        starter: Deno.env.get("DODO_STARTER_PRODUCT_ID") || "prod_starter",
        growth: Deno.env.get("DODO_GROWTH_PRODUCT_ID") || "prod_growth",
        business: Deno.env.get("DODO_BUSINESS_PRODUCT_ID") || "prod_business",
      };

      const apiKey = Deno.env.get("DODO_API_KEY");
      if (!apiKey) {
        throw new Error("DODO_API_KEY not configured");
      }

      // Determine the redirect base URL
      const origin = req.headers.get("origin") || "https://embedbot.lovable.app";

      // Create checkout session with Dodo
      const checkoutResponse = await fetch(
        "https://api.dodopayments.com/v1/checkout",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: planMap[plan],
            customer_email: user.email,
            metadata: {
              user_id: user.id,
              plan: plan,
            },
            success_url: `${origin}/dashboard?payment=success`,
            cancel_url: `${origin}/pricing?payment=cancelled`,
          }),
        }
      );

      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text();
        console.error("Dodo API error:", errorText);
        throw new Error(`Dodo API error: ${errorText}`);
      }

      const checkoutData = await checkoutResponse.json();

      // Store pending subscription in database
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: plan,
          status: "pending",
          dodo_transaction_id: checkoutData.transaction_id,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          checkout_url: checkoutData.checkout_url,
          transaction_id: checkoutData.transaction_id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
}
