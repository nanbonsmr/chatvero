import { motion } from "framer-motion";
import { MessageSquare, Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlanLimits, PLAN_LIMITS } from "@/hooks/usePlanLimits";
import { Link } from "react-router-dom";

export const UsageStats = () => {
  const { data: planData, isLoading } = usePlanLimits();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-6"
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </motion.div>
    );
  }

  if (!planData) return null;

  const { plan, limits, usage, chatbotUsagePercent, messageUsagePercent } = planData;
  const planInfo = PLAN_LIMITS[plan];

  const formatLimit = (value: number) => {
    if (value === Infinity) return "Unlimited";
    return value.toLocaleString();
  };

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return "text-red-500";
    if (percent >= 75) return "text-amber-500";
    return "text-green-500";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500";
    if (percent >= 75) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-base sm:text-lg">Usage & Limits</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {planInfo.name} Plan
            </p>
          </div>
          {plan !== "business" && (
            <Link to="/dashboard/pricing">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Chatbots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">Chatbots</span>
            </div>
            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${getUsageColor(chatbotUsagePercent)}`}>
              {usage.chatbotsUsed} / {formatLimit(limits.chatbots)}
            </span>
          </div>
          {limits.chatbots !== Infinity && (
            <div className="relative">
              <Progress value={chatbotUsagePercent} className="h-1.5 sm:h-2" />
              <div
                className={`absolute inset-0 h-1.5 sm:h-2 rounded-full ${getProgressColor(chatbotUsagePercent)}`}
                style={{ width: `${chatbotUsagePercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">Messages this month</span>
            </div>
            <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${getUsageColor(messageUsagePercent)}`}>
              {usage.messagesThisMonth.toLocaleString()} / {formatLimit(limits.messagesPerMonth)}
            </span>
          </div>
          {limits.messagesPerMonth !== Infinity && (
            <div className="relative">
              <Progress value={messageUsagePercent} className="h-1.5 sm:h-2" />
              <div
                className={`absolute inset-0 h-1.5 sm:h-2 rounded-full ${getProgressColor(messageUsagePercent)}`}
                style={{ width: `${messageUsagePercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Warning if near limit */}
        {(chatbotUsagePercent >= 90 || messageUsagePercent >= 90) && plan !== "business" && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive">
              You're approaching your plan limits. Consider upgrading for more capacity.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
