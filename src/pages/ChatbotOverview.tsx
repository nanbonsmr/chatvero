import { useParams, Link, useNavigate } from "react-router-dom";
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
  User,
  MessageSquare,
  Settings,
  Database,
  BarChart3,
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
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold">{chatbot.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                chatbot.is_active 
                  ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {chatbot.is_active ? "Live" : "Inactive"}
              </span>
            </div>
            <a
              href={chatbot.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              {chatbot.website_url}
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCrawl} disabled={isCrawling}>
              {isCrawling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              Crawl
            </Button>
            <Button size="sm" onClick={copyEmbedCode}>
              <Copy className="w-4 h-4" />
              Embed
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <stat.icon className="w-4 h-4 text-foreground/70" />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </p>
                <span className="text-xs text-green-600 dark:text-green-400">{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Activity</h2>
              <span className="text-xs text-muted-foreground">Last 7 days</span>
            </div>
            <div className="h-[240px]">
              {analyticsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
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
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium">Recent Chats</h2>
              <Link to={`/chatbot/${id}/conversations`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View All
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            
            {recentConversations.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => navigate(`/chatbot/${id}/conversations`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{conv.visitor_id.substring(0, 8)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true }).replace(' ago', '').replace('about ', '')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message || "No messages"} · {conv.message_count} msgs
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          <Link to={`/chatbot/${id}/settings`} className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Settings</p>
            <p className="text-xs text-muted-foreground">Customize</p>
          </Link>
          <Link to={`/chatbot/${id}/knowledge`} className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
            <Database className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Knowledge</p>
            <p className="text-xs text-muted-foreground">Pages</p>
          </Link>
          <Link to={`/chatbot/${id}/leads`} className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
            <Users className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Leads</p>
            <p className="text-xs text-muted-foreground">Contacts</p>
          </Link>
          <Link to={`/chatbot/${id}/analytics`} className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors">
            <BarChart3 className="w-5 h-5 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">Analytics</p>
            <p className="text-xs text-muted-foreground">Performance</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotOverview;
