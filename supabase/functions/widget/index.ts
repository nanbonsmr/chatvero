import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const botId = url.searchParams.get("bot");

  if (!botId) {
    return new Response("Missing bot parameter", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get chatbot settings
  const { data: chatbot } = await supabase
    .from("chatbots")
    .select("name, welcome_message, primary_color, is_active")
    .eq("id", botId)
    .single();

  if (!chatbot || !chatbot.is_active) {
    return new Response("Chatbot not found or inactive", { status: 404 });
  }

  const config = {
    botId,
    name: chatbot.name,
    welcomeMessage: chatbot.welcome_message || "Hi! How can I help you today?",
    primaryColor: chatbot.primary_color || "#6366f1",
    apiUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1`,
  };

  const widgetScript = `
(function() {
  const CONFIG = ${JSON.stringify(config)};
  const visitorId = localStorage.getItem('embedai_visitor') || 'v_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('embedai_visitor', visitorId);
  
  let conversationId = null;
  let isOpen = false;
  let isLoading = false;

  // Styles
  const styles = document.createElement('style');
  styles.textContent = \`
    #embedai-widget * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #embedai-bubble {
      position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px;
      border-radius: 50%; background: \${CONFIG.primaryColor}; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s; z-index: 999999;
    }
    #embedai-bubble:hover { transform: scale(1.05); box-shadow: 0 6px 25px rgba(0,0,0,0.25); }
    #embedai-bubble svg { width: 28px; height: 28px; fill: white; }
    #embedai-chat {
      position: fixed; bottom: 90px; right: 20px; width: 380px; max-width: calc(100vw - 40px);
      height: 520px; max-height: calc(100vh - 120px); background: white; border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15); display: none; flex-direction: column;
      overflow: hidden; z-index: 999998;
    }
    #embedai-chat.open { display: flex; animation: embedai-slide-up 0.3s ease; }
    @keyframes embedai-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    #embedai-header {
      background: \${CONFIG.primaryColor}; color: white; padding: 16px 20px;
      display: flex; align-items: center; gap: 12px;
    }
    #embedai-header-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    #embedai-header-icon svg { width: 22px; height: 22px; fill: white; }
    #embedai-header-text h3 { margin: 0 0 2px 0; font-size: 16px; font-weight: 600; }
    #embedai-header-text p { margin: 0; font-size: 12px; opacity: 0.9; }
    #embedai-close { background: none; border: none; color: white; cursor: pointer; margin-left: auto; padding: 4px; opacity: 0.8; }
    #embedai-close:hover { opacity: 1; }
    #embedai-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .embedai-msg { max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
    .embedai-msg.bot { background: #f3f4f6; color: #1f2937; align-self: flex-start; border-bottom-left-radius: 4px; }
    .embedai-msg.user { background: \${CONFIG.primaryColor}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .embedai-typing { display: flex; gap: 4px; padding: 12px 16px; }
    .embedai-typing span { width: 8px; height: 8px; background: #9ca3af; border-radius: 50%; animation: embedai-bounce 1.4s infinite ease-in-out; }
    .embedai-typing span:nth-child(1) { animation-delay: 0s; }
    .embedai-typing span:nth-child(2) { animation-delay: 0.2s; }
    .embedai-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes embedai-bounce { 0%, 80%, 100% { transform: scale(0.8); } 40% { transform: scale(1.2); } }
    #embedai-input-area { padding: 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }
    #embedai-input {
      flex: 1; border: 1px solid #e5e7eb; border-radius: 24px; padding: 12px 18px;
      font-size: 14px; outline: none; transition: border-color 0.2s;
    }
    #embedai-input:focus { border-color: \${CONFIG.primaryColor}; }
    #embedai-send {
      width: 44px; height: 44px; border-radius: 50%; border: none;
      background: \${CONFIG.primaryColor}; color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: opacity 0.2s;
    }
    #embedai-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #embedai-send svg { width: 20px; height: 20px; fill: white; }
  \`;
  document.head.appendChild(styles);

  // Create widget
  const widget = document.createElement('div');
  widget.id = 'embedai-widget';
  widget.innerHTML = \`
    <div id="embedai-bubble">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
    </div>
    <div id="embedai-chat">
      <div id="embedai-header">
        <div id="embedai-header-icon">
          <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        </div>
        <div id="embedai-header-text">
          <h3>\${CONFIG.name}</h3>
          <p>Typically replies instantly</p>
        </div>
        <button id="embedai-close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <div id="embedai-messages"></div>
      <div id="embedai-input-area">
        <input id="embedai-input" type="text" placeholder="Type a message..." />
        <button id="embedai-send">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  \`;
  document.body.appendChild(widget);

  const bubble = document.getElementById('embedai-bubble');
  const chat = document.getElementById('embedai-chat');
  const messages = document.getElementById('embedai-messages');
  const input = document.getElementById('embedai-input');
  const sendBtn = document.getElementById('embedai-send');
  const closeBtn = document.getElementById('embedai-close');

  function addMessage(text, isBot) {
    const msg = document.createElement('div');
    msg.className = 'embedai-msg ' + (isBot ? 'bot' : 'user');
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'embedai-msg bot embedai-typing';
    typing.id = 'embedai-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const typing = document.getElementById('embedai-typing');
    if (typing) typing.remove();
  }

  function toggleChat() {
    isOpen = !isOpen;
    chat.classList.toggle('open', isOpen);
    if (isOpen && messages.children.length === 0) {
      addMessage(CONFIG.welcomeMessage, true);
    }
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    addMessage(text, false);
    input.value = '';
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch(CONFIG.apiUrl + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatbot_id: CONFIG.botId,
          message: text,
          conversation_id: conversationId,
          visitor_id: visitorId
        })
      });

      const data = await response.json();
      hideTyping();

      if (data.error) {
        addMessage('Sorry, something went wrong. Please try again.', true);
      } else {
        conversationId = data.conversation_id;
        addMessage(data.message, true);
      }
    } catch (err) {
      hideTyping();
      addMessage('Connection error. Please check your internet.', true);
    }

    isLoading = false;
    sendBtn.disabled = false;
  }

  bubble.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
})();
`;

  return new Response(widgetScript, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
    },
  });
});
