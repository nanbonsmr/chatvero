import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Plus, 
  BarChart3, 
  Users, 
  MessageCircle,
  Settings,
  LogOut,
  ExternalLink,
  Copy,
  MoreVertical,
  TrendingUp,
  Loader2,
  Trash2,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useChatbots, useDeleteChatbot } from "@/hooks/useChatbots";
import { useCrawlWebsite } from "@/hooks/useCrawlWebsite";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Dashboard = () => {
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: chatbots = [], isLoading } = useChatbots();
  const deleteChatbot = useDeleteChatbot();
  const { crawl, isLoading: isCrawling } = useCrawlWebsite();
  const [crawlingBotId, setCrawlingBotId] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const copyEmbedCode = (botId: string) => {
    const code = `<script src="https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/widget?bot=${botId}"></script>`;
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const handleDelete = async (botId: string) => {
    try {
      await deleteChatbot.mutateAsync(botId);
      toast({
        title: "Deleted",
        description: "Chatbot has been deleted",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  const handleCrawl = async (botId: string, websiteUrl: string) => {
    setCrawlingBotId(botId);
    toast({
      title: "Crawling website...",
      description: "This may take a minute. We'll notify you when complete.",
    });

    const result = await crawl(botId, websiteUrl, 15);
    setCrawlingBotId(null);

    if (result) {
      toast({
        title: "Crawl complete!",
        description: `Saved ${result.pages_saved} pages. Your chatbot now has website context.`,
      });
    } else {
      toast({
        title: "Crawl failed",
        description: "Could not crawl the website. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate totals from real data
  const totalChats = chatbots.reduce((sum, bot) => sum + bot.total_chats, 0);
  const totalLeads = chatbots.reduce((sum, bot) => sum + bot.leads_captured, 0);
  const avgConversion = chatbots.length > 0 
    ? chatbots.reduce((sum, bot) => sum + bot.conversion_rate, 0) / chatbots.length 
    : 0;

  const stats = [
    { label: "Total Chatbots", value: chatbots.length, icon: MessageSquare },
    { label: "Total Chats", value: totalChats.toLocaleString(), icon: MessageCircle },
    { label: "Leads Captured", value: totalLeads.toLocaleString(), icon: Users },
    { label: "Avg. Conversion", value: `${avgConversion.toFixed(1)}%`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">EmbedAI</span>
        </div>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Chatbots
          </Link>
          <Link
            to="/leads"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Users className="w-5 h-5" />
            Leads
          </Link>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="mb-4 px-4 py-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Manage your chatbots and track performance</p>
          </div>
          <Link to="/create-chatbot">
            <Button variant="hero">
              <Plus className="w-5 h-5" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chatbots List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-semibold">Your Chatbots</h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No chatbots yet</h3>
              <p className="text-muted-foreground mb-6">Create your first AI chatbot to get started</p>
              <Link to="/create-chatbot">
                <Button variant="hero">
                  <Plus className="w-5 h-5" />
                  Create Chatbot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chatbots.map((bot) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Bot Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{bot.name}</h3>
                          <a
                            href={bot.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            {bot.website_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold">{bot.total_chats.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Chats</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{bot.leads_captured}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-500">{bot.conversion_rate}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyEmbedCode(bot.id)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleCrawl(bot.id, bot.website_url)}
                            disabled={isCrawling}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            {crawlingBotId === bot.id ? "Crawling..." : "Crawl Website"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/chatbot/${bot.id}/settings`)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/conversations")}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat History
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete chatbot?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{bot.name}" and all its data including conversations and leads.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(bot.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
