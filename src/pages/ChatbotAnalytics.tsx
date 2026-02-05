import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTopicAnalytics } from "@/hooks/useTopicAnalytics";
import { usePlatformAnalytics } from "@/hooks/usePlatformAnalytics";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2, MessageCircle, Users, TrendingUp, Activity, Target, Database } from "lucide-react";

const ChatbotAnalytics = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState<string>("30");

  const { data: analytics, isLoading } = useAnalytics(parseInt(timeRange), chatbotId);
  const { data: topicAnalytics, isLoading: topicsLoading } = useTopicAnalytics(parseInt(timeRange), chatbotId);
  const { data: platformAnalytics, isLoading: platformLoading } = usePlatformAnalytics(parseInt(timeRange), chatbotId);

  const stats = [
    { label: "Conversations", value: analytics?.totals.totalConversations || 0, icon: MessageCircle },
    { label: "Leads", value: analytics?.totals.totalLeads || 0, icon: Users },
    { label: "Messages", value: analytics?.totals.totalMessages || 0, icon: Activity },
    { label: "Conversion", value: `${analytics?.totals.conversionRate || 0}%`, icon: TrendingUp },
  ];

  const contextStats = [
    { label: "Context Hit Rate", value: `${topicAnalytics?.totals.overallContextHitRate || 0}%`, description: "Using knowledge base", icon: Target },
    { label: "Avg Sources", value: topicAnalytics?.totals.avgSourcesPerMessage || 0, description: "Per response", icon: Database },
  ];

  const chartData = analytics?.dailyStats.map((stat) => ({ ...stat, dateLabel: format(new Date(stat.date), "MMM d") })) || [];
  const topicChartData = topicAnalytics?.topicStats.slice(0, 6) || [];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground text-sm">Track performance and insights</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading || topicsLoading || platformLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-semibold">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {contextStats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-medium mb-4">Conversations</h2>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorConvBot" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="conversations" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorConvBot)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-medium mb-4">Leads</h2>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                      <Bar dataKey="leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {topicChartData.length > 0 && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-medium mb-4">Topics</h2>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topicChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="messageCount" nameKey="label">
                          {topicChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs">{value}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-5">
                  <h2 className="font-medium mb-4">Topic Performance</h2>
                  <div className="space-y-2">
                    {topicChartData.map((topic) => (
                      <div key={topic.intent} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topic.color }} />
                          <span className="text-sm">{topic.label}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{topic.messageCount} msgs · {topic.contextHitRate}% hit</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {platformAnalytics?.platformStats && platformAnalytics.platformStats.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-medium mb-4">Channel Performance</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {platformAnalytics.platformStats.map((p) => (
                    <div key={p.platform} className="p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-sm font-medium">{p.label}</span>
                      </div>
                      <p className="text-lg font-semibold">{p.conversations}</p>
                      <p className="text-xs text-muted-foreground">{p.leads} leads</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatbotAnalytics;