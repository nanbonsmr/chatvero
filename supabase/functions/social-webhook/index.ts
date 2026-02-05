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
 
   const url = new URL(req.url);
   const platform = url.searchParams.get("platform");
   const token = url.searchParams.get("token");
 
   // Verification for Facebook/Instagram webhook setup
   if (req.method === "GET") {
     const mode = url.searchParams.get("hub.mode");
     const verifyToken = url.searchParams.get("hub.verify_token");
     const challenge = url.searchParams.get("hub.challenge");
 
     if (mode === "subscribe" && verifyToken && challenge) {
       // Verify the token matches what's stored for this channel
       const supabase = createClient(
         Deno.env.get("SUPABASE_URL")!,
         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
       );
 
       const { data: channel } = await supabase
         .from("chatbot_channels")
         .select("credentials")
         .eq("webhook_token", token)
         .maybeSingle();
 
       if (channel?.credentials?.verify_token === verifyToken) {
         console.log("Webhook verification successful");
         return new Response(challenge, { status: 200 });
       }
 
       return new Response("Verification failed", { status: 403 });
     }
 
     return new Response("OK", { status: 200 });
   }
 
   // Handle incoming messages
   if (req.method === "POST") {
     try {
       const supabase = createClient(
         Deno.env.get("SUPABASE_URL")!,
         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
       );
 
       // Find the channel by webhook token
       const { data: channel, error: channelError } = await supabase
         .from("chatbot_channels")
         .select("*, chatbots(*)")
         .eq("webhook_token", token)
         .eq("platform", platform)
         .eq("is_active", true)
         .maybeSingle();
 
       if (channelError || !channel) {
         console.error("Channel not found or inactive:", channelError);
         return new Response(JSON.stringify({ error: "Channel not found" }), {
           status: 404,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       const body = await req.json();
       console.log(`Received ${platform} webhook:`, JSON.stringify(body, null, 2));
 
       // Process based on platform
       let messageData: { senderId: string; text: string; messageId: string } | null = null;
 
       switch (platform) {
         case "facebook":
         case "instagram":
           messageData = parseFacebookMessage(body);
           break;
         case "whatsapp":
           messageData = parseWhatsAppMessage(body);
           break;
         case "telegram":
           messageData = parseTelegramMessage(body);
           break;
       }
 
       if (!messageData) {
         console.log("No processable message found in webhook");
         return new Response(JSON.stringify({ status: "no_message" }), {
           status: 200,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
 
       // Get or create conversation
       const visitorId = `${platform}_${messageData.senderId}`;
       let { data: conversation } = await supabase
         .from("conversations")
         .select("id")
         .eq("chatbot_id", channel.chatbot_id)
         .eq("visitor_id", visitorId)
         .is("ended_at", null)
         .maybeSingle();
 
       if (!conversation) {
         const { data: newConv, error: convError } = await supabase
           .from("conversations")
           .insert({
             chatbot_id: channel.chatbot_id,
             visitor_id: visitorId,
             page_url: `${platform}://direct`,
             category: "social_media",
           })
           .select("id")
           .single();
 
         if (convError) throw convError;
         conversation = newConv;
       }
 
       // Store user message
       await supabase.from("messages").insert({
         conversation_id: conversation.id,
         role: "user",
         content: messageData.text,
         intent: "social_message",
       });
 
       // Call the chat function to get AI response
       const chatResponse = await fetch(
         `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
           },
           body: JSON.stringify({
             chatbot_id: channel.chatbot_id,
             conversation_id: conversation.id,
             message: messageData.text,
             visitor_id: visitorId,
           }),
         }
       );
 
       if (!chatResponse.ok) {
         const errorText = await chatResponse.text();
         console.error("Chat function error:", errorText);
         throw new Error(`Chat function failed: ${errorText}`);
       }
 
       // Parse the streamed response
       const responseText = await chatResponse.text();
       const lines = responseText.split("\n").filter((line) => line.startsWith("data: "));
       let aiMessage = "";
 
       for (const line of lines) {
         try {
           const data = JSON.parse(line.replace("data: ", ""));
           if (data.content) {
             aiMessage += data.content;
           }
         } catch (e) {
           // Skip parsing errors
         }
       }
 
       if (!aiMessage) {
         aiMessage = "Sorry, I couldn't process your message. Please try again.";
       }
 
       // Send reply based on platform
      await sendPlatformReply(platform!, channel, messageData.senderId, aiMessage);
 
       // Update conversation message count
       await supabase.rpc("update_conversation_analytics", {
         p_chatbot_id: channel.chatbot_id,
         p_intent: "social_message",
         p_has_context: true,
       });
 
       return new Response(
         JSON.stringify({ status: "success", message: "Reply sent" }),
         {
           status: 200,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     } catch (error) {
       console.error("Webhook processing error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
       return new Response(
        JSON.stringify({ error: errorMessage }),
         {
           status: 500,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         }
       );
     }
   }
 
   return new Response("Method not allowed", { status: 405 });
 });
 
 // Parse Facebook/Instagram messages
 function parseFacebookMessage(
   body: any
 ): { senderId: string; text: string; messageId: string } | null {
   try {
     const entry = body.entry?.[0];
     const messaging = entry?.messaging?.[0] || entry?.standby?.[0];
 
     if (!messaging?.message?.text) return null;
 
     return {
       senderId: messaging.sender.id,
       text: messaging.message.text,
       messageId: messaging.message.mid,
     };
   } catch {
     return null;
   }
 }
 
 // Parse WhatsApp messages
 function parseWhatsAppMessage(
   body: any
 ): { senderId: string; text: string; messageId: string } | null {
   try {
     const entry = body.entry?.[0];
     const changes = entry?.changes?.[0];
     const message = changes?.value?.messages?.[0];
 
     if (!message?.text?.body) return null;
 
     return {
       senderId: message.from,
       text: message.text.body,
       messageId: message.id,
     };
   } catch {
     return null;
   }
 }
 
 // Parse Telegram messages
 function parseTelegramMessage(
   body: any
 ): { senderId: string; text: string; messageId: string } | null {
   try {
     const message = body.message;
     if (!message?.text) return null;
 
     return {
       senderId: message.from.id.toString(),
       text: message.text,
       messageId: message.message_id.toString(),
     };
   } catch {
     return null;
   }
 }
 
 // Send reply to the appropriate platform
 async function sendPlatformReply(
   platform: string,
   channel: any,
   recipientId: string,
   message: string
 ) {
   const credentials = channel.credentials;
 
   switch (platform) {
     case "facebook":
     case "instagram": {
       const accessToken = credentials.page_access_token || credentials.access_token;
       const url =
         platform === "facebook"
           ? `https://graph.facebook.com/v18.0/me/messages?access_token=${accessToken}`
           : `https://graph.facebook.com/v18.0/${credentials.instagram_account_id}/messages?access_token=${accessToken}`;
 
       await fetch(url, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           recipient: { id: recipientId },
           message: { text: message },
         }),
       });
       break;
     }
 
     case "whatsapp": {
       await fetch(
         `https://graph.facebook.com/v18.0/${credentials.phone_number_id}/messages`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${credentials.access_token}`,
           },
           body: JSON.stringify({
             messaging_product: "whatsapp",
             to: recipientId,
             type: "text",
             text: { body: message },
           }),
         }
       );
       break;
     }
 
     case "telegram": {
       await fetch(
         `https://api.telegram.org/bot${credentials.bot_token}/sendMessage`,
         {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             chat_id: recipientId,
             text: message,
           }),
         }
       );
       break;
     }
   }
 }