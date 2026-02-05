 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Switch } from "@/components/ui/switch";
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
 } from "lucide-react";
 
 interface PlatformConfig {
   id: Platform;
   name: string;
   icon: string;
   color: string;
   bgColor: string;
   description: string;
   fields: { key: string; label: string; placeholder: string; type?: string }[];
   docsUrl: string;
 }
 
 const platforms: PlatformConfig[] = [
   {
     id: "facebook",
     name: "Facebook Messenger",
     icon: "📘",
     color: "text-blue-600",
     bgColor: "bg-blue-500/10",
     description: "Reply to messages from your Facebook Page",
     fields: [
       { key: "page_access_token", label: "Page Access Token", placeholder: "EAA..." },
       { key: "verify_token", label: "Verify Token", placeholder: "Your custom verify token" },
     ],
     docsUrl: "https://developers.facebook.com/docs/messenger-platform/getting-started",
   },
   {
     id: "whatsapp",
     name: "WhatsApp Business",
     icon: "💬",
     color: "text-green-600",
     bgColor: "bg-green-500/10",
     description: "Connect to WhatsApp Business API",
     fields: [
       { key: "phone_number_id", label: "Phone Number ID", placeholder: "1234567890" },
       { key: "access_token", label: "Access Token", placeholder: "Your WhatsApp access token" },
     ],
     docsUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
   },
   {
     id: "instagram",
     name: "Instagram DMs",
     icon: "📸",
     color: "text-pink-600",
     bgColor: "bg-pink-500/10",
     description: "Reply to Instagram Direct Messages",
     fields: [
       { key: "access_token", label: "Instagram Access Token", placeholder: "IGQ..." },
       { key: "instagram_account_id", label: "Instagram Account ID", placeholder: "17841..." },
     ],
     docsUrl: "https://developers.facebook.com/docs/instagram-api/guides/messaging",
   },
   {
     id: "telegram",
     name: "Telegram Bot",
     icon: "✈️",
     color: "text-sky-600",
     bgColor: "bg-sky-500/10",
     description: "Create a Telegram bot that replies automatically",
     fields: [
       { key: "bot_token", label: "Bot Token", placeholder: "123456:ABC-DEF..." },
     ],
     docsUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
   },
 ];
 
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
 
   const getChannelForPlatform = (platformId: Platform): ChatbotChannel | undefined => {
     return channels?.find((c) => c.platform === platformId);
   };
 
   const webhookUrl = `https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/social-webhook`;
 
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
             Connect platforms to let your chatbot reply on social media
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
                   <h3 className="font-semibold text-sm sm:text-base">{platform.name}</h3>
                   <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                     {platform.description}
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
                           Connected {new Date(channel.connected_at).toLocaleDateString()}
                         </p>
                       )}
                     </div>
                   ) : (
                     <Button
                       size="sm"
                       variant="outline"
                       className="mt-3 h-8 text-xs sm:text-sm"
                       onClick={() => {
                         setSelectedPlatform(platform);
                         setCredentials({});
                       }}
                     >
                       Connect
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
           }
         }}
       >
         <DialogContent className="max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <span className="text-2xl">{selectedPlatform?.icon}</span>
               Connect {selectedPlatform?.name}
             </DialogTitle>
             <DialogDescription>
               Enter your API credentials to connect this platform
             </DialogDescription>
           </DialogHeader>
 
           <div className="space-y-4 py-4">
             {selectedPlatform?.fields.map((field) => (
               <div key={field.key}>
                 <Label htmlFor={field.key}>{field.label}</Label>
                 <Input
                   id={field.key}
                   type={field.type || "text"}
                   placeholder={field.placeholder}
                   value={credentials[field.key] || ""}
                   onChange={(e) =>
                     setCredentials({ ...credentials, [field.key]: e.target.value })
                   }
                   className="mt-1.5 font-mono text-sm"
                 />
               </div>
             ))}
 
             <div className="p-3 rounded-lg bg-muted/50 space-y-2">
               <p className="text-xs font-medium">Webhook URL</p>
               <p className="text-xs text-muted-foreground break-all font-mono">
                 {webhookUrl}?platform={selectedPlatform?.id}&token=[auto-generated]
               </p>
               <p className="text-xs text-muted-foreground">
                 Use this URL in your {selectedPlatform?.name} webhook settings
               </p>
             </div>
 
             <a
               href={selectedPlatform?.docsUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="flex items-center gap-1.5 text-xs text-primary hover:underline"
             >
               <ExternalLink className="w-3.5 h-3.5" />
               View setup documentation
             </a>
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
               disabled={isConnecting}
               className="flex-1 bg-gradient-to-r from-primary to-primary/80"
             >
               {isConnecting ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 "Connect"
               )}
             </Button>
           </div>
         </DialogContent>
       </Dialog>
 
       {/* Info Box */}
       <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
         <h4 className="font-medium text-sm mb-2">How it works</h4>
         <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
           <li>Connect your social media account using API credentials</li>
           <li>Configure the webhook URL in your platform's developer settings</li>
           <li>Your chatbot will automatically reply to incoming messages</li>
           <li>All conversations are logged in your dashboard</li>
         </ol>
       </div>
     </div>
   );
 };