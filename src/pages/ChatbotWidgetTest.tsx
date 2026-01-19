import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Loader2, 
  ExternalLink, 
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  Copy,
  Check,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DeviceMode = "desktop" | "tablet" | "mobile";

const deviceSizes: Record<DeviceMode, { width: string; height: string }> = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "667px" },
};

const ChatbotWidgetTest = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [chatbot, setChatbot] = useState<{ name: string; primary_color: string } | null>(null);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const widgetUrl = `https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/widget?bot=${id}`;
  const embedCode = `<script src="${widgetUrl}"></script>`;

  useEffect(() => {
    const fetchChatbot = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("chatbots")
        .select("name, primary_color")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setChatbot(data);
      }
      setIsLoading(false);
    };

    fetchChatbot();
  }, [id]);

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshPreview = () => {
    setIframeKey(prev => prev + 1);
  };

  // Create the test HTML page content
  const testPageContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Test - ${chatbot?.name || 'Chatbot'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2rem;
      color: #1e293b;
      margin-bottom: 12px;
    }
    p {
      color: #64748b;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      margin-bottom: 24px;
    }
    .card h2 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .card p {
      margin-bottom: 0;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 24px;
    }
    .feature {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
    }
    .feature h3 {
      font-size: 1rem;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .feature p {
      font-size: 0.875rem;
      color: #64748b;
    }
    .hint {
      position: fixed;
      bottom: 100px;
      right: 100px;
      background: #1e293b;
      color: white;
      padding: 12px 20px;
      border-radius: 12px;
      font-size: 0.875rem;
      animation: bounce 2s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Our Website</h1>
    <p>This is a test page to preview how your chatbot widget will look and function on your website. Click the chat bubble in the bottom-right corner to start a conversation!</p>
    
    <div class="card">
      <h2>About Our Company</h2>
      <p>We provide innovative solutions to help businesses grow. Our AI-powered chatbot is here to assist you 24/7 with any questions you might have.</p>
    </div>

    <div class="features">
      <div class="feature">
        <h3>24/7 Support</h3>
        <p>Get instant answers anytime</p>
      </div>
      <div class="feature">
        <h3>Smart AI</h3>
        <p>Trained on your content</p>
      </div>
      <div class="feature">
        <h3>Lead Capture</h3>
        <p>Never miss a potential customer</p>
      </div>
    </div>
  </div>
  
  <div class="hint">👋 Click the chat bubble →</div>
  
  <script src="${widgetUrl}"></script>
</body>
</html>
  `;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to={`/chatbot/${id}/settings`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
              </Link>
              <div className="h-6 w-px bg-border" />
              <div>
                <h1 className="font-display text-lg font-bold">Widget Preview</h1>
                <p className="text-sm text-muted-foreground">{chatbot?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Device Toggle */}
              <div className="flex items-center bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setDeviceMode("desktop")}
                  className={`p-2 rounded-md transition-colors ${
                    deviceMode === "desktop" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`p-2 rounded-md transition-colors ${
                    deviceMode === "tablet" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode("mobile")}
                  className={`p-2 rounded-md transition-colors ${
                    deviceMode === "mobile" ? "bg-background shadow-sm" : "hover:bg-background/50"
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              <Button variant="outline" size="sm" onClick={refreshPreview}>
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>

              <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-secondary/30 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full flex items-center justify-center"
          >
            <div
              className={`bg-background rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
                deviceMode === "desktop" ? "w-full h-full" : ""
              }`}
              style={deviceMode !== "desktop" ? {
                width: deviceSizes[deviceMode].width,
                height: deviceSizes[deviceMode].height,
                maxHeight: "calc(100vh - 12rem)",
              } : undefined}
            >
              {deviceMode !== "desktop" && (
                <div className="h-6 bg-muted flex items-center justify-center gap-1.5">
                  <div className="w-16 h-1 bg-muted-foreground/30 rounded-full" />
                </div>
              )}
              <iframe
                key={iframeKey}
                ref={iframeRef}
                srcDoc={testPageContent}
                className="w-full h-full border-0"
                title="Widget Preview"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </motion.div>
        </div>

        {/* Info Bar */}
        <div className="border-t border-border bg-card px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              This is a live preview of your widget. Changes in settings will reflect after refreshing.
            </p>
            <a
              href={widgetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              Open widget script
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotWidgetTest;