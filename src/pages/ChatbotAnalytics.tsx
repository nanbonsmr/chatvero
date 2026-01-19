import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  MessageCircle,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";

const ChatbotAnalytics = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState<string>("30");

  const { data: analytics, isLoading } = useAnalytics(parseInt(timeRange), chatbotId);

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

  const chartData = analytics?.dailyStats.map((stat) => ({
    ...stat,
    dateLabel: format(new Date(stat.date), "MMM d"),
  })) || [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track chatbot performance</p>
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

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats */}
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

            {/* Charts */}
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatbotAnalytics;
