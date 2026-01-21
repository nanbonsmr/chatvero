import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTopicAnalytics } from "@/hooks/useTopicAnalytics";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
  Target,
  Database,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ChatbotAnalytics = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState<string>("30");

  const { data: analytics, isLoading } = useAnalytics(parseInt(timeRange), chatbotId);
  const { data: topicAnalytics, isLoading: topicsLoading } = useTopicAnalytics(parseInt(timeRange), chatbotId);

  const stats = [
    {
      label: "Conversations",
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
      label: "Messages",
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

  const contextStats = [
    {
      label: "Context Hit Rate",
      value: `${topicAnalytics?.totals.overallContextHitRate || 0}%`,
      description: "Responses using knowledge base",
      icon: Target,
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      label: "Avg Sources Used",
      value: topicAnalytics?.totals.avgSourcesPerMessage || 0,
      description: "Per response",
      icon: Database,
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  const chartData = analytics?.dailyStats.map((stat) => ({
    ...stat,
    dateLabel: format(new Date(stat.date), "MMM d"),
  })) || [];

  const topicChartData = topicAnalytics?.topicStats.slice(0, 6) || [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track chatbot performance and topic insights</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
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

        {isLoading || topicsLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <p className="text-3xl font-display font-bold mb-1">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI Performance Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid sm:grid-cols-2 gap-6"
            >
              {contextStats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-display font-bold">
                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                      </p>
                      <p className="text-muted-foreground text-sm">{stat.label}</p>
                      <p className="text-xs text-muted-foreground/70">{stat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Conversations Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Conversations</h2>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorConv)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Leads Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border/50 bg-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="font-display text-lg font-semibold">Leads Captured</h2>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
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
                      <Bar dataKey="leads" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Topic Analytics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Topic Analysis</h2>
                  <p className="text-sm text-muted-foreground">What users are asking about</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Topic Distribution Pie Chart */}
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    Topic Distribution
                  </h3>
                  {topicChartData.length > 0 ? (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={topicChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="messageCount"
                            nameKey="label"
                          >
                            {topicChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "12px",
                            }}
                            formatter={(value: number, name: string) => [
                              `${value} messages`,
                              name,
                            ]}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => (
                              <span className="text-xs text-foreground">{value}</span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      <p>No topic data available yet</p>
                    </div>
                  )}
                </div>

                {/* Topic Performance List */}
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    Topic Performance
                  </h3>
                  {topicChartData.length > 0 ? (
                    <div className="space-y-4">
                      {topicChartData.map((topic) => (
                        <div key={topic.intent} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: topic.color }}
                              />
                              <span className="text-sm font-medium">{topic.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {topic.messageCount} messages
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Context Hit Rate</span>
                                <span>{topic.contextHitRate}%</span>
                              </div>
                              <Progress 
                                value={topic.contextHitRate} 
                                className="h-1.5"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {topic.avgSourcesUsed} sources avg
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                      <p>Start chatting to see topic performance</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Knowledge Base Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold">Knowledge Base Performance</h2>
                  <p className="text-sm text-muted-foreground">How well the AI uses your content</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-3xl font-display font-bold text-emerald-500">
                    {topicAnalytics?.totals.totalWithContext || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Responses with Context</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-3xl font-display font-bold text-amber-500">
                    {topicAnalytics?.totals.totalWithoutContext || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Responses without Context</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <div className="text-3xl font-display font-bold text-blue-500">
                    {topicAnalytics?.totals.overallContextHitRate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Overall Hit Rate</p>
                </div>
              </div>

              {topicAnalytics?.totals.overallContextHitRate !== undefined && 
               topicAnalytics.totals.overallContextHitRate < 50 && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    💡 <strong>Tip:</strong> Your context hit rate is below 50%. Consider adding more documents or crawling additional pages to improve response accuracy.
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatbotAnalytics;
