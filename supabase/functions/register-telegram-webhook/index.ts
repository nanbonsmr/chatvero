 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 Deno.serve(async (req) => {
   // Handle CORS preflight
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { channel_id, bot_token, webhook_token } = await req.json();
 
     if (!bot_token || !webhook_token) {
       return new Response(
         JSON.stringify({ error: "Missing bot_token or webhook_token" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Build the webhook URL
     const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/social-webhook?platform=telegram&token=${webhook_token}`;
 
     console.log("Registering Telegram webhook:", webhookUrl);
 
     // Register webhook with Telegram
     const telegramResponse = await fetch(
       `https://api.telegram.org/bot${bot_token}/setWebhook`,
       {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           url: webhookUrl,
           allowed_updates: ["message"],
         }),
       }
     );
 
     const telegramResult = await telegramResponse.json();
     console.log("Telegram setWebhook response:", telegramResult);
 
     if (!telegramResult.ok) {
       return new Response(
         JSON.stringify({ 
           error: "Failed to register webhook with Telegram",
           details: telegramResult.description 
         }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     // Get bot info to store the bot username
     const botInfoResponse = await fetch(
       `https://api.telegram.org/bot${bot_token}/getMe`
     );
     const botInfo = await botInfoResponse.json();
     
     let botUsername = null;
     if (botInfo.ok && botInfo.result?.username) {
       botUsername = botInfo.result.username;
       
       // Update the channel with the bot username
       if (channel_id) {
         const supabase = createClient(
           Deno.env.get("SUPABASE_URL")!,
           Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
         );
         
         await supabase
           .from("chatbot_channels")
           .update({ page_name: `@${botUsername}` })
           .eq("id", channel_id);
       }
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         message: "Webhook registered successfully",
         bot_username: botUsername
       }),
       { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Error registering webhook:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });