import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      messageData
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex === signature;
  } catch {
    return false;
  }
}

if (import.meta.main) {
  Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    try {
      const signature = req.headers.get("x-dodo-signature");
      if (!signature) {
        return new Response(JSON.stringify({ error: "Missing signature" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const body = await req.text();
      const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");

      if (!webhookSecret) {
        throw new Error("DODO_WEBHOOK_SECRET not configured");
      }

      const isValid = await verifyWebhookSignature(
        body,
        signature,
        webhookSecret
      );
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: corsHeaders,
        });
      }

      const event = JSON.parse(body);
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (event.type === "payment.completed") {
        const transactionId = event.data.transaction_id;
        const metadata = event.data.metadata;

        // Update subscription status
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days
          })
          .eq("dodo_transaction_id", transactionId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          throw updateError;
        }

        console.log(
          `Subscription activated for user ${metadata?.user_id}, plan: ${metadata?.plan}`
        );
      } else if (event.type === "payment.failed") {
        const transactionId = event.data.transaction_id;

        // Update subscription status
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "failed",
          })
          .eq("dodo_transaction_id", transactionId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
        }

        console.log(`Payment failed for transaction ${transactionId}`);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (error: unknown) {
      console.error("Webhook error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  });
}
