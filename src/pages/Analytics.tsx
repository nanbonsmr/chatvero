import { useState } from "react";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useChatbots } from "@/hooks/useChatbots";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

const COLORS = ["hsl(var(--primary))", "#8b5cf6", "#06b6d4", "#22c55e", "#f97316", "#ec4899"];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<string>("30");
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all");

  const { data: chatbots = [] } = useChatbots();
  const { data: analytics, isLoading } = useAnalytics(
    parseInt(timeRange),
    selectedChatbot === "all" ? undefined : selectedChatbot
  );

  const stats = [
    {
      label: "Total Conversations",
      value: analytics?.totals.totalConversations || 0,
      icon: MessageCircle,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      label: "Leads Captured",
      value: analytics?.totals.totalLeads || 0,
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Messages",
      value: analytics?.totals.totalMessages || 0,
      icon: Activity,
      gradient: "from-purple-500 to-violet-500",
    },
    {
      label: "Conversion Rate",
      value: `${analytics?.totals.conversionRate || 0}%`,
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const chartData = analytics?.dailyStats.map((stat) => ({
    ...stat,
    dateLabel: format(new Date(stat.date), "MMM d"),
  })) || [];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">Performance across all chatbots</p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All chatbots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All chatbots</SelectItem>
                {chatbots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <p className="text-2xl font-semibold">
                    {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Conversations Chart */}
              <div
                className="rounded-xl border border-border bg-card p-5"
              >
                <h2 className="font-medium mb-4">Conversations</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
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
                        fill="url(#colorConv)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Leads Chart */}
              <div
                className="rounded-xl border border-border bg-card p-5"
              >
                <h2 className="font-medium mb-4">Leads</h2>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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
                      <Bar dataKey="leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chatbot Breakdown */}
            {analytics?.chatbotBreakdown && analytics.chatbotBreakdown.length > 1 && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <h2 className="font-medium mb-4">By Chatbot</h2>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.chatbotBreakdown}
                          dataKey="conversations"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {analytics.chatbotBreakdown.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {analytics.chatbotBreakdown.map((bot, index) => (
                      <div key={bot.id} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs text-muted-foreground">{bot.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <h2 className="font-medium mb-4">Performance</h2>
                  <div className="space-y-3">
                    {analytics.chatbotBreakdown.map((bot, index) => {
                      const convRate = bot.conversations > 0
                        ? Math.round((bot.leads / bot.conversations) * 100)
                        : 0;
                      return (
                        <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-sm font-medium">{bot.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">{bot.conversations} chats</span>
                            <span className="text-muted-foreground">{bot.leads} leads</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {convRate}% conversion
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
