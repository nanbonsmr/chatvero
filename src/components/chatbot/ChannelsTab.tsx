 import { useState, useMemo } from "react";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { useToast } from "@/hooks/use-toast";
 import {
   useChannels,
   useConnectChannel,
   useToggleChannel,
   useDisconnectChannel,
   Platform,
   ChatbotChannel,
 } from "@/hooks/useChannels";
 import {
   Loader2,
   MessageCircle,
   Check,
   ExternalLink,
   Copy,
   Unplug,
   Settings2,
   ChevronRight,
   HelpCircle,
   Sparkles,
   AlertCircle,
 } from "lucide-react";
 
 interface PlatformConfig {
   id: Platform;
   name: string;
   icon: string;
   color: string;
   bgColor: string;
   description: string;
  difficulty: "easy" | "medium" | "advanced";
  setupTime: string;
  fields: { key: string; label: string; placeholder: string; type?: string; help: string }[];
   docsUrl: string;
  steps: string[];
 }
 
 const platforms: PlatformConfig[] = [
   {
     id: "telegram",
     name: "Telegram Bot",
     icon: "✈️",
     color: "text-sky-600",
     bgColor: "bg-sky-500/10",
    description: "Easiest to set up! Create a bot that auto-replies on Telegram",
    difficulty: "easy",
    setupTime: "2 min",
     fields: [
      { 
        key: "bot_token", 
        label: "Bot Token", 
        placeholder: "123456:ABC-DEF...", 
        help: "You'll get this from @BotFather after creating your bot"
      },
     ],
     docsUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
    steps: [
      "Open Telegram and search for @BotFather",
      "Send /newbot and follow the prompts to name your bot",
      "Copy the token that BotFather gives you",
      "Paste the token below and click Connect"
    ],
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: "💬",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    description: "Reply to WhatsApp messages automatically",
    difficulty: "medium",
    setupTime: "10 min",
    fields: [
      { 
        key: "phone_number_id", 
        label: "Phone Number ID", 
        placeholder: "1234567890",
        help: "Found in your WhatsApp Business dashboard under 'Phone Numbers'"
      },
      { 
        key: "access_token", 
        label: "Access Token", 
        placeholder: "Your WhatsApp access token",
        help: "Generate this in the Meta Business Suite API settings"
      },
    ],
    docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
    steps: [
      "Go to Meta Business Suite → WhatsApp → API Setup",
      "Create or select your WhatsApp Business Account",
      "Copy your Phone Number ID from the dashboard",
      "Generate a permanent access token",
      "Paste both values below"
    ],
  },
  {
    id: "facebook",
    name: "Facebook Messenger",
    icon: "📘",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    description: "Auto-reply to your Facebook Page messages",
    difficulty: "medium",
    setupTime: "10 min",
    fields: [
      { 
        key: "page_access_token", 
        label: "Page Access Token", 
        placeholder: "EAA...",
        help: "Get this from your Facebook Page Settings → Advanced Messaging"
      },
      { 
        key: "verify_token", 
        label: "Verify Token", 
        placeholder: "any-secret-word-you-choose",
        help: "Make up any secret word (e.g., 'mybot123'). You'll use this same word in Facebook's webhook settings"
      },
    ],
    docsUrl: "https://developers.facebook.com/docs/messenger-platform/getting-started",
    steps: [
      "Go to Facebook Developers → Create or select your app",
      "Add the 'Messenger' product to your app",
      "Generate a Page Access Token for your Facebook Page",
      "Create any verify token (a secret word you'll remember)",
      "Paste both values below, then set up the webhook in Facebook"
    ],
  },
  {
    id: "instagram",
    name: "Instagram DMs",
    icon: "📸",
    color: "text-pink-600",
    bgColor: "bg-pink-500/10",
    description: "Reply to Instagram Direct Messages",
    difficulty: "advanced",
    setupTime: "15 min",
    fields: [
      { 
        key: "access_token", 
        label: "Instagram Access Token", 
        placeholder: "IGQ...",
        help: "Requires a Facebook app with Instagram Graph API permissions"
      },
      { 
        key: "instagram_account_id", 
        label: "Instagram Account ID", 
        placeholder: "17841...",
        help: "Your Instagram Business Account ID (not your username)"
      },
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-api/guides/messaging",
    steps: [
      "Connect your Instagram to a Facebook Business Page",
      "Create a Facebook Developer app with Instagram Graph API",
      "Request 'instagram_manage_messages' permission",
      "Get your Instagram Account ID from the API",
      "Generate an access token with proper permissions"
    ],
   },
 ];

const difficultyConfig = {
  easy: { label: "Beginner Friendly", color: "bg-green-500/10 text-green-600 border-green-200" },
  medium: { label: "Intermediate", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  advanced: { label: "Advanced", color: "bg-red-500/10 text-red-600 border-red-200" },
};
 
 interface ChannelsTabProps {
   chatbotId: string;
 }
 
 export const ChannelsTab = ({ chatbotId }: ChannelsTabProps) => {
   const { toast } = useToast();
   const { data: channels, isLoading } = useChannels(chatbotId);
   const connectChannel = useConnectChannel();
   const toggleChannel = useToggleChannel();
   const disconnectChannel = useDisconnectChannel();
 
   const [selectedPlatform, setSelectedPlatform] = useState<PlatformConfig | null>(null);
   const [credentials, setCredentials] = useState<Record<string, string>>({});
   const [isConnecting, setIsConnecting] = useState(false);
   const [copiedWebhook, setCopiedWebhook] = useState<string | null>(null);
   const [currentStep, setCurrentStep] = useState(0);
   const [showWebhookHelp, setShowWebhookHelp] = useState(false);
 
   const getChannelForPlatform = (platformId: Platform): ChatbotChannel | undefined => {
     return channels?.find((c) => c.platform === platformId);
   };
 
   const webhookUrl = `https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/social-webhook`;

   // Check if all fields are filled
   const allFieldsFilled = useMemo(() => {
     if (!selectedPlatform) return false;
     return selectedPlatform.fields.every((f) => credentials[f.key]?.trim());
   }, [selectedPlatform, credentials]);
 
   const handleConnect = async () => {
     if (!selectedPlatform) return;
 
     // Validate all fields are filled
     const missingFields = selectedPlatform.fields.filter(
       (f) => !credentials[f.key]?.trim()
     );
     if (missingFields.length > 0) {
       toast({
         title: "Missing fields",
         description: `Please fill in: ${missingFields.map((f) => f.label).join(", ")}`,
         variant: "destructive",
       });
       return;
     }
 
     setIsConnecting(true);
     try {
       await connectChannel.mutateAsync({
         chatbotId,
         platform: selectedPlatform.id,
         credentials,
       });
 
       toast({
         title: "Channel connected!",
         description: `${selectedPlatform.name} is now connected to your chatbot`,
       });
       setSelectedPlatform(null);
       setCredentials({});
     } catch (error) {
       console.error("Connect error:", error);
       toast({
         title: "Connection failed",
         description: "Failed to connect channel. Please check your credentials.",
         variant: "destructive",
       });
     } finally {
       setIsConnecting(false);
     }
   };
 
   const handleToggle = async (channel: ChatbotChannel) => {
     try {
       await toggleChannel.mutateAsync({
         channelId: channel.id,
         isActive: !channel.is_active,
         chatbotId,
       });
       toast({
         title: channel.is_active ? "Channel paused" : "Channel activated",
         description: channel.is_active
           ? "Messages will not be processed"
           : "Messages will now be processed",
       });
     } catch (error) {
       toast({
         title: "Error",
         description: "Failed to update channel status",
         variant: "destructive",
       });
     }
   };
 
   const handleDisconnect = async (channel: ChatbotChannel, platform: PlatformConfig) => {
     if (!confirm(`Disconnect ${platform.name}? This will stop all message processing.`)) {
       return;
     }
 
     try {
       await disconnectChannel.mutateAsync({
         channelId: channel.id,
         chatbotId,
       });
       toast({
         title: "Channel disconnected",
         description: `${platform.name} has been removed`,
       });
     } catch (error) {
       toast({
         title: "Error",
         description: "Failed to disconnect channel",
         variant: "destructive",
       });
     }
   };
 
   const copyWebhookUrl = (channel: ChatbotChannel) => {
     const url = `${webhookUrl}?platform=${channel.platform}&token=${channel.webhook_token}`;
     navigator.clipboard.writeText(url);
     setCopiedWebhook(channel.id);
     toast({ title: "Copied!", description: "Webhook URL copied to clipboard" });
     setTimeout(() => setCopiedWebhook(null), 2000);
   };
 
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="w-6 h-6 animate-spin text-primary" />
       </div>
     );
   }
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
           <MessageCircle className="w-5 h-5 text-primary" />
         </div>
         <div>
           <h2 className="font-display text-lg font-semibold">Social Media Channels</h2>
           <p className="text-sm text-muted-foreground">
            Let your AI chatbot automatically reply on social media
           </p>
         </div>
       </div>

       {/* Quick tip */}
       <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
         <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
         <div>
           <p className="text-sm font-medium">New to social integrations?</p>
           <p className="text-xs text-muted-foreground mt-0.5">
             Start with <strong>Telegram</strong> – it's the easiest to set up and takes just 2 minutes!
           </p>
         </div>
       </div>
 
       {/* Platform Cards */}
       <div className="grid gap-4 sm:grid-cols-2">
         {platforms.map((platform, index) => {
           const channel = getChannelForPlatform(platform.id);
           const isConnected = !!channel;
 
           return (
             <motion.div
               key={platform.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
               className={`relative rounded-xl border p-4 sm:p-5 transition-all ${
                 isConnected
                   ? "border-primary/30 bg-primary/5"
                   : "border-border bg-card hover:border-primary/20"
               }`}
             >
               {/* Connected badge */}
               {isConnected && (
                 <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                   <Check className="w-3.5 h-3.5 text-white" />
                 </div>
               )}
 
               <div className="flex items-start gap-3 sm:gap-4">
                 {/* Icon */}
                 <div
                   className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${platform.bgColor} flex items-center justify-center text-xl sm:text-2xl shrink-0`}
                 >
                   {platform.icon}
                 </div>
 
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm sm:text-base">{platform.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] ${difficultyConfig[platform.difficulty].color}`}
                      >
                        {difficultyConfig[platform.difficulty].label}
                      </Badge>
                    </div>
                   <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                     {platform.description}
                   </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      ⏱️ Setup time: ~{platform.setupTime}
                    </p>
 
                   {isConnected && channel ? (
                     <div className="mt-3 space-y-3">
                       {/* Toggle & Actions */}
                       <div className="flex items-center justify-between gap-2">
                         <div className="flex items-center gap-2">
                           <Switch
                             checked={channel.is_active}
                             onCheckedChange={() => handleToggle(channel)}
                             className="scale-90"
                           />
                           <span className="text-xs text-muted-foreground">
                             {channel.is_active ? "Active" : "Paused"}
                           </span>
                         </div>
                         <div className="flex gap-1">
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => copyWebhookUrl(channel)}
                             className="h-7 w-7 p-0"
                             title="Copy webhook URL"
                           >
                             {copiedWebhook === channel.id ? (
                               <Check className="w-3.5 h-3.5 text-green-500" />
                             ) : (
                               <Copy className="w-3.5 h-3.5" />
                             )}
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => {
                               setSelectedPlatform(platform);
                               setCredentials(channel.credentials);
                                setCurrentStep(0);
                             }}
                             className="h-7 w-7 p-0"
                             title="Edit settings"
                           >
                             <Settings2 className="w-3.5 h-3.5" />
                           </Button>
                           <Button
                             size="sm"
                             variant="ghost"
                             onClick={() => handleDisconnect(channel, platform)}
                             className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                             title="Disconnect"
                           >
                             <Unplug className="w-3.5 h-3.5" />
                           </Button>
                         </div>
                       </div>
 
                       {/* Connection info */}
                       {channel.connected_at && (
                         <p className="text-xs text-muted-foreground">
                            ✅ Connected {new Date(channel.connected_at).toLocaleDateString()}
                         </p>
                       )}
                     </div>
                   ) : (
                     <Button
                       size="sm"
                        variant={platform.difficulty === "easy" ? "default" : "outline"}
                       className="mt-3 h-8 text-xs sm:text-sm"
                       onClick={() => {
                         setSelectedPlatform(platform);
                         setCredentials({});
                          setCurrentStep(0);
                       }}
                     >
                        {platform.difficulty === "easy" ? "Quick Setup" : "Connect"}
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                     </Button>
                   )}
                 </div>
               </div>
             </motion.div>
           );
         })}
       </div>
 
       {/* Connect Dialog */}
       <Dialog
         open={!!selectedPlatform}
         onOpenChange={(open) => {
           if (!open) {
             setSelectedPlatform(null);
             setCredentials({});
            setCurrentStep(0);
            setShowWebhookHelp(false);
           }
         }}
       >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <span className="text-2xl">{selectedPlatform?.icon}</span>
               Connect {selectedPlatform?.name}
             </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={selectedPlatform ? difficultyConfig[selectedPlatform.difficulty].color : ""}
              >
                {selectedPlatform && difficultyConfig[selectedPlatform.difficulty].label}
              </Badge>
              <span>~{selectedPlatform?.setupTime} setup</span>
             </DialogDescription>
           </DialogHeader>
 
           <div className="space-y-4 py-4">
            {/* Step-by-step guide */}
            <Accordion type="single" collapsible defaultValue="steps">
              <AccordionItem value="steps" className="border rounded-lg px-3">
                <AccordionTrigger className="text-sm font-medium hover:no-underline">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Step-by-step setup guide
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="space-y-2 text-sm">
                    {selectedPlatform?.steps.map((step, index) => (
                      <li 
                        key={index} 
                        className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                          currentStep === index ? "bg-primary/10" : ""
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                          currentStep > index 
                            ? "bg-green-500 text-white" 
                            : currentStep === index 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted text-muted-foreground"
                        }`}>
                          {currentStep > index ? <Check className="w-3 h-3" /> : index + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <a
                    href={selectedPlatform?.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-3"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Official documentation
                  </a>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Credential fields */}
            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium">Enter your credentials:</p>
             {selectedPlatform?.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {credentials[field.key]?.trim() && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </div>
                 <Input
                   id={field.key}
                   type={field.type || "text"}
                   placeholder={field.placeholder}
                   value={credentials[field.key] || ""}
                  onChange={(e) => {
                    setCredentials({ ...credentials, [field.key]: e.target.value });
                    // Update step based on filled fields
                    const filledCount = Object.values({ ...credentials, [field.key]: e.target.value })
                      .filter(v => v?.trim()).length;
                    setCurrentStep(Math.min(filledCount + (selectedPlatform?.steps.length || 1) - selectedPlatform!.fields.length, (selectedPlatform?.steps.length || 1) - 1));
                  }}
                  className="font-mono text-sm"
                 />
                <p className="text-xs text-muted-foreground flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                  {field.help}
                </p>
               </div>
             ))}
            </div>
 
            {/* Webhook info - collapsible for advanced users */}
            {(selectedPlatform?.id === "facebook" || selectedPlatform?.id === "instagram" || selectedPlatform?.id === "whatsapp") && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-200 space-y-2">
                <button 
                  onClick={() => setShowWebhookHelp(!showWebhookHelp)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <p className="text-xs font-medium text-amber-700">⚠️ Important: Webhook Setup Required</p>
                  <ChevronRight className={`w-4 h-4 text-amber-600 transition-transform ${showWebhookHelp ? "rotate-90" : ""}`} />
                </button>
                {showWebhookHelp && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-amber-700">
                      After connecting, you'll need to add this webhook URL to your {selectedPlatform?.name} settings:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[10px] bg-background p-2 rounded break-all">
                        {webhookUrl}?platform={selectedPlatform?.id}&token=[shown after connect]
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 shrink-0"
                        onClick={() => {
                          navigator.clipboard.writeText(`${webhookUrl}?platform=${selectedPlatform?.id}&token=YOUR_TOKEN`);
                          toast({ title: "Copied!", description: "Webhook URL copied" });
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
           </div>
 
           <div className="flex gap-3">
             <Button
               variant="outline"
               onClick={() => setSelectedPlatform(null)}
               className="flex-1"
             >
               Cancel
             </Button>
             <Button
               onClick={handleConnect}
              disabled={isConnecting || !allFieldsFilled}
               className="flex-1 bg-gradient-to-r from-primary to-primary/80"
             >
               {isConnecting ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Connect {selectedPlatform?.name}
                </>
               )}
             </Button>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Info Box */}
       <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          How it works
        </h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
            <span>Connect your social account with API credentials (we guide you through it!)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
            <span>Your chatbot automatically replies when someone messages you</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
            <span>All conversations appear in your dashboard</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-[10px] font-bold">4</span>
            <span>Toggle channels on/off anytime without losing settings</span>
          </div>
        </div>
       </div>
     </div>
   );
 };