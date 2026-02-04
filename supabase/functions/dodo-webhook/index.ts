import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp",
};

/**
 * Verify Dodo Payments webhook signature.
 * Dodo sends three headers:
 *   webhook-id, webhook-timestamp, webhook-signature
 * The signed message is: `${id}.${timestamp}.${body}`
 * `webhook-signature` is comma-separated values like `v1,<base64-sig>`.
 */
async function verifyDodoSignature(
  id: string,
  timestamp: string,
  body: string,
  signatureHeader: string,
  secret: string
): Promise<boolean> {
  // Tolerance: reject if timestamp older than 5 minutes
  const nowSeconds = Math.floor(Date.now() / 1000);
  const tsNum = parseInt(timestamp, 10);
  if (Number.isNaN(tsNum) || Math.abs(nowSeconds - tsNum) > 300) {
    console.error("Webhook timestamp out of tolerance");
    return false;
  }

  // Construct signed payload
  const signedPayload = `${id}.${timestamp}.${body}`;

  // Extract the base64 signature (format: "v1,<base64>")
  const parts = signatureHeader.split(",");
  if (parts.length < 2) {
    console.error("Invalid signature header format");
    return false;
  }
  const sigBase64 = parts[1];

  // Decode secret (Dodo secrets are typically base64-encoded: "whsec_xxxxx")
  let keyData: Uint8Array;
  if (secret.startsWith("whsec_")) {
    keyData = decodeBase64(secret.slice("whsec_".length));
  } else {
    keyData = new TextEncoder().encode(secret);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    keyData.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const expectedSigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const expectedSig = btoa(String.fromCharCode(...new Uint8Array(expectedSigBuffer)));

  // Constant-time compare is ideal; for simplicity we compare strings
  return expectedSig === sigBase64;
}

if (import.meta.main) {
  Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // Read Dodo webhook headers
      const webhookId = req.headers.get("webhook-id");
      const webhookTimestamp = req.headers.get("webhook-timestamp");
      const webhookSignature = req.headers.get("webhook-signature");

      // Allow legacy x-dodo-signature fallback
      const legacySignature = req.headers.get("x-dodo-signature");

      const body = await req.text();

      const webhookSecret = Deno.env.get("DODO_WEBHOOK_SECRET");
      if (!webhookSecret) {
        console.error("DODO_WEBHOOK_SECRET not configured");
        return new Response(
          JSON.stringify({ error: "Server configuration error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let verified = false;

      // Prefer standard Dodo headers if present
      if (webhookId && webhookTimestamp && webhookSignature) {
        verified = await verifyDodoSignature(
          webhookId,
          webhookTimestamp,
          body,
          webhookSignature,
          webhookSecret
        );
      } else if (legacySignature) {
        // Simple HMAC-SHA256 hex comparison for legacy/custom setups
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(webhookSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const sigBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
        const hexSig = [...new Uint8Array(sigBuf)].map(b => b.toString(16).padStart(2, "0")).join("");
        verified = hexSig === legacySignature;
      }

      if (!verified) {
        console.error("Invalid or missing webhook signature");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const event = JSON.parse(body);
      console.log("Received Dodo event:", event.type);

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Dodo uses "payment.succeeded" (not "payment.completed") per their docs
      if (event.type === "payment.succeeded" || event.type === "payment.completed") {
        const data = event.data ?? event.payload ?? {};
        // Dodo can put transaction ID in different places
        const transactionId = data.payment_id ?? data.transaction_id ?? data.checkout_session_id ?? event.id;
        const metadata = data.metadata ?? {};

        console.log("Activating subscription for transaction:", transactionId);

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            started_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .eq("dodo_transaction_id", transactionId);

        if (updateError) {
          console.error("Error updating subscription:", updateError);
          // Don't throw — still return 200 so Dodo doesn't retry indefinitely
        } else {
          console.log(`Subscription activated: user=${metadata.user_id}, plan=${metadata.plan}`);
        }
      } else if (event.type === "payment.failed") {
        const data = event.data ?? event.payload ?? {};
        const transactionId = data.payment_id ?? data.transaction_id ?? data.checkout_session_id ?? event.id;

        console.log("Marking subscription as failed:", transactionId);

        await supabase
          .from("subscriptions")
          .update({ status: "failed" })
          .eq("dodo_transaction_id", transactionId);
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Webhook error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
}
