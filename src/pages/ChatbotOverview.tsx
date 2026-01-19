import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
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

  const recentConversations = conversations.slice(0, 5);

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
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold">{chatbot.name}</h1>
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
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCrawl} disabled={isCrawling}>
              {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Crawl Website
            </Button>
            <Button onClick={copyEmbedCode}>
              <Copy className="w-4 h-4" />
              Copy Embed Code
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-4xl font-display font-bold mb-1">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">{stat.label}</p>
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-semibold">Activity</h2>
              <span className="text-sm text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-[280px]">
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
            className="rounded-2xl border border-border/50 bg-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Recent Chats</h2>
              <Link to={`/chatbot/${id}/conversations`}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentConversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet
                </p>
              ) : (
                recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => navigate(`/chatbot/${id}/conversations`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">
                        {conv.visitor_id.substring(0, 12)}...
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {conv.message_count} msgs
                      </span>
                    </div>
                    {conv.last_message && (
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/0 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to={`/chatbot/${id}/settings`}>
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <p className="font-medium">Edit Settings</p>
                  <p className="text-xs text-muted-foreground">Customize appearance & behavior</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/knowledge`}>
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <p className="font-medium">Knowledge Base</p>
                  <p className="text-xs text-muted-foreground">Manage crawled pages</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/leads`}>
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <p className="font-medium">View Leads</p>
                  <p className="text-xs text-muted-foreground">See captured contacts</p>
                </div>
              </Button>
            </Link>
            <Link to={`/chatbot/${id}/analytics`}>
              <Button variant="outline" className="w-full justify-start h-auto py-4">
                <div className="text-left">
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-muted-foreground">Track performance</p>
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
