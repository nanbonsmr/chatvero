 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 // Extract lead info from social message
 function extractLeadInfo(text: string, senderId: string, platform: string): {
   email?: string;
   phone?: string;
   name?: string;
 } {
   const info: { email?: string; phone?: string; name?: string } = {};
   
   // Email extraction
   const emailMatch = text.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i);
   if (emailMatch) info.email = emailMatch[1].toLowerCase();
   
   // Phone extraction (international formats)
   const phonePatterns = [
     /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/,
     /\b\+[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{2,4}\b/,
   ];
   for (const pattern of phonePatterns) {
     const match = text.match(pattern);
     if (match) {
       info.phone = match[0].replace(/[^\d+]/g, '');
       break;
     }
   }
   
   // Name extraction
   const namePatterns = [
     /\b(?:my name is|i am|i'm|this is|call me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/gi,
   ];
   for (const pattern of namePatterns) {
     const match = text.match(pattern);
     if (match && match[1]) {
       info.name = match[1].trim();
       break;
     }
   }
   
   return info;
 }
 
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
             platform: platform,
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
 
       // Parse the JSON response from chat function
       const responseText = await chatResponse.text();
       console.log("Chat response text:", responseText.substring(0, 300));
       
       let aiMessage = "";
       
       try {
         const data = JSON.parse(responseText);
         aiMessage = data.message || "";
         console.log("Parsed AI message from JSON:", aiMessage.substring(0, 100));
       } catch (e) {
         console.error("Failed to parse chat response as JSON:", e);
         // Fallback: try to extract message if it's in different format
         const messageMatch = responseText.match(/"message"\s*:\s*"([^"]*)"/);
         if (messageMatch) {
           aiMessage = messageMatch[1];
         }
       }
 
       if (!aiMessage) {
         aiMessage = "Sorry, I couldn't process your message. Please try again.";
       }
 
       // Send reply based on platform
      await sendPlatformReply(platform!, channel, messageData.senderId, aiMessage);
 
       // Extract and capture lead info from the message
       const leadInfo = extractLeadInfo(messageData.text, messageData.senderId, platform!);
       const hasLeadInfo = leadInfo.email || leadInfo.phone || leadInfo.name;
       
       if (hasLeadInfo) {
         console.log("Lead detected from social:", JSON.stringify(leadInfo));
         
         // Check if lead already exists for this chatbot (by email or by visitor_id)
         let existingLead = null;
         
         if (leadInfo.email) {
           const { data } = await supabase
             .from("leads")
             .select("id")
             .eq("chatbot_id", channel.chatbot_id)
             .eq("email", leadInfo.email)
             .maybeSingle();
           existingLead = data;
         }
         
         if (!existingLead) {
           // Create new lead
           const { error: leadError } = await supabase.from("leads").insert({
             chatbot_id: channel.chatbot_id,
             conversation_id: conversation.id,
             email: leadInfo.email,
             phone: leadInfo.phone,
             name: leadInfo.name,
             custom_data: {
               source: platform,
               sender_id: messageData.senderId,
             },
           });
           
           if (leadError) {
             console.error("Failed to capture lead:", leadError);
           } else {
             console.log("Lead captured successfully from", platform);
             
             // Mark conversation as having a lead
             await supabase
               .from("conversations")
               .update({ has_lead: true })
               .eq("id", conversation.id);
           }
         } else {
           console.log("Lead already exists, skipping duplicate");
         }
       }
 
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