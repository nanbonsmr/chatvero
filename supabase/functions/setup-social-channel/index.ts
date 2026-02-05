 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 Deno.serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { platform, channel_id, credentials, webhook_token } = await req.json();
 
     if (!platform || !credentials || !webhook_token) {
       return new Response(
         JSON.stringify({ error: "Missing required fields" }),
         { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
       );
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const webhookUrl = `${supabaseUrl}/functions/v1/social-webhook?platform=${platform}&token=${webhook_token}`;
     
     let result: { success: boolean; message: string; webhook_url: string; bot_name?: string; instructions?: string[] };
 
     switch (platform) {
       case "telegram":
         result = await setupTelegram(credentials, webhookUrl, channel_id);
         break;
       case "facebook":
         result = await setupFacebook(credentials, webhookUrl);
         break;
       case "instagram":
         result = await setupInstagram(credentials, webhookUrl);
         break;
       case "whatsapp":
         result = await setupWhatsApp(credentials, webhookUrl);
         break;
       default:
         return new Response(
           JSON.stringify({ error: "Unknown platform" }),
           { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
         );
     }
 
     // Update channel with bot name if available
     if (result.success && result.bot_name && channel_id) {
       const supabase = createClient(
         supabaseUrl,
         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
       );
       await supabase
         .from("chatbot_channels")
         .update({ page_name: result.bot_name })
         .eq("id", channel_id);
     }
 
     return new Response(
       JSON.stringify(result),
       { status: result.success ? 200 : 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   } catch (error) {
     console.error("Setup error:", error);
     return new Response(
       JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
     );
   }
 });
 
 async function setupTelegram(
   credentials: { bot_token: string },
   webhookUrl: string,
   channelId?: string
 ) {
   const { bot_token } = credentials;
 
   // Register webhook with Telegram
   const response = await fetch(`https://api.telegram.org/bot${bot_token}/setWebhook`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message"] }),
   });
 
   const result = await response.json();
   console.log("Telegram setWebhook:", result);
 
   if (!result.ok) {
     return {
       success: false,
       message: `Telegram error: ${result.description}`,
       webhook_url: webhookUrl,
     };
   }
 
   // Get bot info
   const botResponse = await fetch(`https://api.telegram.org/bot${bot_token}/getMe`);
   const botInfo = await botResponse.json();
   const botName = botInfo.ok ? `@${botInfo.result.username}` : undefined;
 
   return {
     success: true,
     message: "Telegram bot connected! Webhook registered automatically.",
     webhook_url: webhookUrl,
     bot_name: botName,
   };
 }
 
 async function setupFacebook(
   credentials: { page_access_token: string; verify_token: string },
   webhookUrl: string
 ) {
   const { page_access_token } = credentials;
 
   // Verify the token works by getting page info
   try {
     const response = await fetch(
       `https://graph.facebook.com/v18.0/me?access_token=${page_access_token}`
     );
     const data = await response.json();
 
     if (data.error) {
       return {
         success: false,
         message: `Invalid token: ${data.error.message}`,
         webhook_url: webhookUrl,
       };
     }
 
     const pageName = data.name || "Facebook Page";
 
     return {
       success: true,
       message: `Connected to "${pageName}"! Now set up the webhook in Facebook.`,
       webhook_url: webhookUrl,
       bot_name: pageName,
       instructions: [
         "Go to Facebook Developers → Your App → Messenger → Settings",
         "Under 'Webhooks', click 'Add Callback URL'",
         `Paste this URL: ${webhookUrl}`,
         "Enter your Verify Token (the secret word you chose)",
         "Subscribe to 'messages' and 'messaging_postbacks' events",
       ],
     };
   } catch (error) {
     return {
       success: false,
       message: "Failed to verify Facebook token",
       webhook_url: webhookUrl,
     };
   }
 }
 
 async function setupInstagram(
   credentials: { access_token: string; instagram_account_id: string },
   webhookUrl: string
 ) {
   const { access_token, instagram_account_id } = credentials;
 
   // Verify credentials by getting account info
   try {
     const response = await fetch(
       `https://graph.facebook.com/v18.0/${instagram_account_id}?fields=username,name&access_token=${access_token}`
     );
     const data = await response.json();
 
     if (data.error) {
       return {
         success: false,
         message: `Invalid credentials: ${data.error.message}`,
         webhook_url: webhookUrl,
       };
     }
 
     const accountName = data.username ? `@${data.username}` : data.name || "Instagram Account";
 
     return {
       success: true,
       message: `Connected to "${accountName}"! Now set up the webhook.`,
       webhook_url: webhookUrl,
       bot_name: accountName,
       instructions: [
         "Go to Facebook Developers → Your App → Instagram → Settings",
         "Under 'Webhooks', add a subscription",
         `Paste this URL: ${webhookUrl}`,
         "Subscribe to 'messages' events",
       ],
     };
   } catch (error) {
     return {
       success: false,
       message: "Failed to verify Instagram credentials",
       webhook_url: webhookUrl,
     };
   }
 }
 
 async function setupWhatsApp(
   credentials: { phone_number_id: string; access_token: string },
   webhookUrl: string
 ) {
   const { phone_number_id, access_token } = credentials;
 
   // Verify credentials by getting phone number info
   try {
     const response = await fetch(
       `https://graph.facebook.com/v18.0/${phone_number_id}?access_token=${access_token}`
     );
     const data = await response.json();
 
     if (data.error) {
       return {
         success: false,
         message: `Invalid credentials: ${data.error.message}`,
         webhook_url: webhookUrl,
       };
     }
 
     const displayPhone = data.display_phone_number || phone_number_id;
 
     return {
       success: true,
       message: `Connected to ${displayPhone}! Now set up the webhook.`,
       webhook_url: webhookUrl,
       bot_name: displayPhone,
       instructions: [
         "Go to Meta Business Suite → WhatsApp → Configuration",
         "Under 'Webhook', click 'Edit'",
         `Paste this URL: ${webhookUrl}`,
         "Generate a verify token and enter it",
         "Subscribe to 'messages' webhook field",
       ],
     };
   } catch (error) {
     return {
       success: false,
       message: "Failed to verify WhatsApp credentials",
       webhook_url: webhookUrl,
     };
   }
 }