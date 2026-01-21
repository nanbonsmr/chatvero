import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Save, 
  Loader2, 
  MessageSquare,
  Palette,
  Globe,
  Sparkles,
  Database,
  ChevronRight,
  Code,
  Copy,
  Check,
  ExternalLink,
  Bell,
  Target,
} from "lucide-react";

const tones = [
  { value: "professional", label: "Professional", description: "Formal and business-focused" },
  { value: "friendly", label: "Friendly", description: "Warm and conversational" },
  { value: "sales", label: "Sales-focused", description: "Persuasive and action-oriented" },
];

const goals = [
  { value: "lead_generation", label: "Lead Generation", description: "Capture visitor contact info", icon: "📧" },
  { value: "sales", label: "Sales", description: "Convert visitors to customers", icon: "💰" },
  { value: "support", label: "Support", description: "Help and answer questions", icon: "🎧" },
];

const colorPresets = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#1f2937", label: "Dark" },
];

const ChatbotSettings = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/widget?bot=${id}"></script>`;

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const [chatbot, setChatbot] = useState<{
    name: string;
    website_url: string;
    welcome_message: string;
    follow_up_message: string;
    primary_color: string;
    tone: string;
    goal: string;
    is_active: boolean;
    auto_show_welcome: boolean;
    welcome_delay_seconds: number;
  } | null>(null);

  useEffect(() => {
    const fetchChatbot = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("chatbots")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Chatbot not found",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setChatbot({
        name: data.name,
        website_url: data.website_url,
        welcome_message: data.welcome_message || "",
        follow_up_message: data.follow_up_message || "",
        primary_color: data.primary_color || "#6366f1",
        tone: data.tone,
        goal: data.goal,
        is_active: data.is_active ?? true,
        auto_show_welcome: data.auto_show_welcome ?? true,
        welcome_delay_seconds: data.welcome_delay_seconds ?? 2,
      });
      setIsLoading(false);
    };

    fetchChatbot();
  }, [id, navigate, toast]);

  const handleSave = async () => {
    if (!id || !chatbot) return;
    
    setIsSaving(true);
    
    const { error } = await supabase
      .from("chatbots")
      .update({
        name: chatbot.name,
        welcome_message: chatbot.welcome_message,
        follow_up_message: chatbot.follow_up_message,
        primary_color: chatbot.primary_color,
        tone: chatbot.tone,
        goal: chatbot.goal,
        is_active: chatbot.is_active,
        auto_show_welcome: chatbot.auto_show_welcome,
        welcome_delay_seconds: chatbot.welcome_delay_seconds,
      })
      .eq("id", id);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Saved!",
      description: "Chatbot settings have been updated",
    });
  };

  // Get goal-specific placeholder messages
  const getWelcomePlaceholder = () => {
    switch (chatbot?.goal) {
      case "lead_generation":
        return "Hi there! 👋 I'd love to help you today. What brings you here?";
      case "sales":
        return "Welcome! 🎉 I'm here to help you find exactly what you need. How can I assist?";
      case "support":
        return "Hello! 👋 I'm here to help with any questions. What can I do for you?";
      default:
        return "Hi! How can I help you today?";
    }
  };

  const getFollowUpPlaceholder = () => {
    switch (chatbot?.goal) {
      case "lead_generation":
        return "Feel free to ask me anything! I can also connect you with our team if you'd like personalized assistance.";
      case "sales":
        return "I can tell you about our products, pricing, or help you get started with a demo!";
      case "support":
        return "I have access to our knowledge base and can help troubleshoot any issues you're facing.";
      default:
        return "Let me know what you need help with!";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!chatbot) return null;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">{chatbot.website_url}</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-primary to-primary/80">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="space-y-8">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${chatbot.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                  <Sparkles className={`w-6 h-6 ${chatbot.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <h2 className="font-semibold">Chatbot Status</h2>
                  <p className="text-sm text-muted-foreground">
                    {chatbot.is_active ? "Active and responding to visitors" : "Disabled - not responding"}
                  </p>
                </div>
              </div>
              <Switch
                checked={chatbot.is_active}
                onCheckedChange={(checked) => setChatbot({ ...chatbot, is_active: checked })}
              />
            </div>
          </motion.div>

          {/* Embed Code */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Embed Code</h2>
                <p className="text-sm text-muted-foreground">Add this to your website</p>
              </div>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 font-mono text-sm break-all mb-4">
              {embedCode}
            </div>

            <div className="flex gap-3">
              <Button onClick={copyEmbedCode} variant="outline" className="flex-1">
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
              <Link to={`/chatbot/${id}/test`} className="flex-1">
                <Button variant="default" className="w-full bg-gradient-to-r from-primary to-primary/80">
                  <ExternalLink className="w-4 h-4" />
                  Test Widget
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Paste this code before the closing &lt;/body&gt; tag on your website
            </p>
          </motion.div>

          {/* Knowledge Base Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Link
              to={`/chatbot/${id}/knowledge`}
              className="flex items-center justify-between bg-card rounded-2xl border border-border p-6 hover:bg-secondary/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Knowledge Base</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage crawled pages and website content
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          </motion.div>

          {/* Welcome Behavior */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Welcome Behavior</h2>
                <p className="text-sm text-muted-foreground">How the chatbot greets visitors</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Auto-show toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-show Welcome Message</Label>
                  <p className="text-sm text-muted-foreground">
                    Show a preview bubble when visitors land on your site
                  </p>
                </div>
                <Switch
                  checked={chatbot.auto_show_welcome}
                  onCheckedChange={(checked) => setChatbot({ ...chatbot, auto_show_welcome: checked })}
                />
              </div>

              {/* Delay slider */}
              {chatbot.auto_show_welcome && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Delay before showing</Label>
                    <span className="text-sm font-medium">{chatbot.welcome_delay_seconds}s</span>
                  </div>
                  <Slider
                    value={[chatbot.welcome_delay_seconds]}
                    onValueChange={([value]) => setChatbot({ ...chatbot, welcome_delay_seconds: value })}
                    min={0}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to wait before showing the welcome preview
                  </p>
                </div>
              )}

              {/* Welcome message */}
              <div>
                <Label htmlFor="welcome">Welcome Message</Label>
                <Textarea
                  id="welcome"
                  value={chatbot.welcome_message}
                  onChange={(e) => setChatbot({ ...chatbot, welcome_message: e.target.value })}
                  placeholder={getWelcomePlaceholder()}
                  className="mt-1.5 min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  First message shown when chat opens. Leave empty to use goal-based default.
                </p>
              </div>

              {/* Follow-up message */}
              <div>
                <Label htmlFor="followup">Follow-up Message (optional)</Label>
                <Textarea
                  id="followup"
                  value={chatbot.follow_up_message}
                  onChange={(e) => setChatbot({ ...chatbot, follow_up_message: e.target.value })}
                  placeholder={getFollowUpPlaceholder()}
                  className="mt-1.5 min-h-[60px]"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Sent 1 second after welcome message to guide the conversation
                </p>
              </div>
            </div>
          </motion.div>

          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Basic Information</h2>
            </div>

            <div>
              <Label htmlFor="name">Chatbot Name</Label>
              <Input
                id="name"
                value={chatbot.name}
                onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                placeholder="My Chatbot"
                className="mt-1.5"
              />
            </div>
          </motion.div>

          {/* Goal Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-semibold">Primary Goal</h2>
                <p className="text-sm text-muted-foreground">This strongly influences how the AI responds</p>
              </div>
            </div>

            <div className="grid gap-3">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setChatbot({ ...chatbot, goal: goal.value })}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    chatbot.goal === goal.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">{goal.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{goal.label}</div>
                    <div className="text-sm text-muted-foreground">{goal.description}</div>
                  </div>
                  {chatbot.goal === goal.value && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-muted/50">
              <p className="text-sm text-muted-foreground">
                {chatbot.goal === "lead_generation" && (
                  <>💡 <strong>Lead Generation:</strong> AI will naturally guide conversations toward capturing emails and contact info.</>
                )}
                {chatbot.goal === "sales" && (
                  <>💡 <strong>Sales:</strong> AI will highlight benefits, handle objections, and encourage purchases or demos.</>
                )}
                {chatbot.goal === "support" && (
                  <>💡 <strong>Support:</strong> AI will focus on solving problems quickly and accurately.</>
                )}
              </p>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Appearance</h2>
            </div>

            <div>
              <Label>Primary Color</Label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-2">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setChatbot({ ...chatbot, primary_color: color.value })}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      chatbot.primary_color === color.value 
                        ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Label htmlFor="custom-color" className="text-sm">Custom:</Label>
                <Input
                  id="custom-color"
                  type="color"
                  value={chatbot.primary_color}
                  onChange={(e) => setChatbot({ ...chatbot, primary_color: e.target.value })}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={chatbot.primary_color}
                  onChange={(e) => setChatbot({ ...chatbot, primary_color: e.target.value })}
                  placeholder="#6366f1"
                  className="w-28 font-mono text-sm"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-secondary/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-3">Preview</p>
              <div className="flex items-end gap-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: chatbot.primary_color }}
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div 
                  className="px-4 py-2 rounded-2xl rounded-bl-md text-white text-sm max-w-[200px]"
                  style={{ backgroundColor: chatbot.primary_color }}
                >
                  {chatbot.welcome_message || getWelcomePlaceholder()}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Behavior */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold">Conversation Tone</h2>
            </div>

            <Select
              value={chatbot.tone}
              onValueChange={(value) => setChatbot({ ...chatbot, tone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    <div>
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-xs text-muted-foreground">{tone.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotSettings;
