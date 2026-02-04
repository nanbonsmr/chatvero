import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as jose from "https://deno.land/x/jose@v5.3.0/index.ts";

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
          headers: corsHeaders,
        });
      }

      const token = authHeader.replace("Bearer ", "");
      const jwtSecret = Deno.env.get("SUPABASE_JWT_SECRET")!;
      const secret = new TextEncoder().encode(jwtSecret);

      let claims: any;
      try {
        const verified = await jose.jwtVerify(token, secret);
        claims = verified.payload;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const userId = claims.sub;
      const { plan } = await req.json();

      if (!plan || !["starter", "growth", "business"].includes(plan)) {
        return new Response(JSON.stringify({ error: "Invalid plan" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

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
            customer_email: claims.email,
            metadata: {
              user_id: userId,
              plan: plan,
            },
            success_url: `${new URL(req.url).origin}/dashboard?payment=success`,
            cancel_url: `${new URL(req.url).origin}/pricing?payment=cancelled`,
          }),
        }
      );

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.text();
        throw new Error(`Dodo API error: ${error}`);
      }

      const checkoutData = await checkoutResponse.json();

      // Store pending subscription in database
      const { error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan: plan,
          status: "pending",
          dodo_transaction_id: checkoutData.transaction_id,
        });

      if (insertError) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({
          checkout_url: checkoutData.checkout_url,
          transaction_id: checkoutData.transaction_id,
        }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  });
}
