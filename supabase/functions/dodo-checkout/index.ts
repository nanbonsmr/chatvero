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

      const rawApiKey = Deno.env.get("DODO_API_KEY");
      if (!rawApiKey) {
        throw new Error("DODO_API_KEY not configured");
      }

      // Normalize API key: users sometimes paste `Bearer xxx`.
      const apiKey = rawApiKey.trim().toLowerCase().startsWith("bearer ")
        ? rawApiKey.trim().slice("bearer ".length).trim()
        : rawApiKey.trim();

      // Determine the redirect base URL
      const origin = req.headers.get("origin") || "https://embedbot.lovable.app";

      // Use test or live endpoint based on environment.
      // IMPORTANT: default to live unless DODO_ENV explicitly opts into test.
      // This prevents accidental 401s when a live key is used against test endpoints.
      const dodoEnv = (Deno.env.get("DODO_ENV") ?? "").trim().toLowerCase();
      const inferredMode: "live" | "test" =
        ["test", "test_mode", "sandbox", "0", "false"].includes(dodoEnv)
          ? "test"
          : ["live", "live_mode", "prod", "production", "1", "true"].includes(dodoEnv)
            ? "live"
            : apiKey.toLowerCase().includes("test")
              ? "test"
              : "live";

      const dodoBaseUrl = inferredMode === "live"
        ? "https://live.dodopayments.com"
        : "https://test.dodopayments.com";

      // Create checkout session with Dodo
      // Matches docs: https://docs.dodopayments.com/api-reference/checkout-sessions/create
      const requestBody = {
        product_cart: [
          {
            product_id: planMap[plan],
            quantity: 1,
          },
        ],
        customer: {
          email: user.email,
        },
        return_url: `${origin}/dashboard?payment=success`,
        metadata: {
          user_id: user.id,
          plan,
        },
      };

      console.log("Dodo request URL:", `${dodoBaseUrl}/checkouts`);
      console.log("Dodo mode:", inferredMode);
      console.log("Dodo env present:", Boolean(Deno.env.get("DODO_ENV")));
      console.log("Dodo request body:", JSON.stringify(requestBody));
      console.log("Product ID being used:", planMap[plan]);

      const checkoutResponse = await fetch(
        `${dodoBaseUrl}/checkouts`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Dodo response status:", checkoutResponse.status);
      
      const responseText = await checkoutResponse.text();
      console.log("Dodo response body:", responseText);

      if (!checkoutResponse.ok) {
        throw new Error(
          `Dodo API error (${checkoutResponse.status}): ${responseText || "<empty response>"}`
        );
      }

      const checkoutData = JSON.parse(responseText);

      // Store pending subscription in database
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: user.id,
          plan: plan,
          status: "pending",
          dodo_transaction_id: checkoutData.session_id,
        });

      if (insertError) {
        console.error("Insert error:", insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          checkout_url: checkoutData.checkout_url,
          session_id: checkoutData.session_id,
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
