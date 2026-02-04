import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useChatbots } from "@/hooks/useChatbots";
import { useCrawlWebsite } from "@/hooks/useCrawlWebsite";
import { useConversations } from "@/hooks/useConversations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MessageCircle,
  Users,
  TrendingUp,
  Copy,
  Globe,
  Loader2,
  ArrowUpRight,
  Zap,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";

const ChatbotOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { data: chatbots = [] } = useChatbots();
  const chatbot = chatbots.find(b => b.id === id);
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(7, id);
  const { data: conversations = [] } = useConversations(id);
  const { crawl, isLoading: isCrawling } = useCrawlWebsite();

  const copyEmbedCode = () => {
    const code = `<script src="https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/widget?bot=${id}"></script>`;
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const handleCrawl = async () => {
    if (!chatbot) return;
    toast({
      title: "Crawling website...",
      description: "This may take a minute.",
    });
    const result = await crawl(id!, chatbot.website_url, 15);
    if (result) {
      toast({
        title: "Crawl complete!",
        description: `Saved ${result.pages_saved} pages.`,
      });
    }
  };

  const chartData = analytics?.dailyStats.map((stat) => ({
    ...stat,
    dateLabel: format(new Date(stat.date), "MMM d"),
  })) || [];

  const recentConversations = conversations.slice(0, 3);

  if (!chatbot) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <p className="text-muted-foreground">Chatbot not found</p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      label: "Conversations",
      value: chatbot.total_chats,
      change: "+12%",
      icon: MessageCircle,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Leads Captured",
      value: chatbot.leads_captured,
      change: "+8%",
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Conversion Rate",
      value: `${chatbot.conversion_rate}%`,
      change: "+2.5%",
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{chatbot.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                chatbot.is_active 
                  ? "bg-green-500/10 text-green-500" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {chatbot.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <a
              href={chatbot.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1"
            >
              {chatbot.website_url}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={handleCrawl} disabled={isCrawling}>
              {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span className="hidden sm:inline">Crawl Website</span>
              <span className="sm:hidden">Crawl</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none" onClick={copyEmbedCode}>
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy Embed Code</span>
              <span className="sm:hidden">Embed</span>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className="relative flex sm:block items-center gap-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center sm:mb-4 flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 sm:flex-none">
                  <p className="text-2xl sm:text-4xl font-display font-bold mb-0 sm:mb-1">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                    <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="font-display text-base sm:text-lg font-semibold">Activity</h2>
              <span className="text-xs sm:text-sm text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-[220px] sm:h-[280px]">
              {analyticsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis dataKey="dateLabel" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#colorConversations)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-display text-base sm:text-lg font-semibold">Recent Chats</h2>
              </div>
              <Link to={`/chatbot/${id}/conversations`}>
                <Button variant="outline" size="sm" className="gap-1 text-xs">
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            
            {recentConversations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="grid gap-2 overflow-hidden">
                {recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="group flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-border/50 overflow-hidden w-full"
                    onClick={() => navigate(`/chatbot/${id}/conversations`)}
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] sm:text-xs font-medium truncate">
                          {conv.visitor_id.substring(0, 6)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                          {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true }).replace(' ago', '').replace('about ', '')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1 mt-0.5">
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {conv.last_message 
                            ? conv.last_message.substring(0, 20) + (conv.last_message.length > 20 ? '...' : '')
                            : "No messages"
                          }
                        </p>
                        <span className="text-[9px] text-muted-foreground bg-secondary px-1 py-0.5 rounded flex-shrink-0">
                          {conv.message_count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/0 p-4 sm:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="font-display text-base sm:text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <Link to={`/chatbot/${id}/settings`}>
              <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 px-3 sm:px-4">
                <div className="text-left">
                  <p className="font-medium text-sm sm:text-base">Settings</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Customize appearance</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/knowledge`}>
              <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 px-3 sm:px-4">
                <div className="text-left">
                  <p className="font-medium text-sm sm:text-base">Knowledge</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Manage pages</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/leads`}>
              <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 px-3 sm:px-4">
                <div className="text-left">
                  <p className="font-medium text-sm sm:text-base">Leads</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">See contacts</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/analytics`}>
              <Button variant="outline" className="w-full justify-start h-auto py-3 sm:py-4 px-3 sm:px-4">
                <div className="text-left">
                  <p className="font-medium text-sm sm:text-base">Analytics</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Track performance</p>
                </div>
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotOverview;
