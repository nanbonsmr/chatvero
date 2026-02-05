import { MessageSquare, Zap, ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePlanLimits, PLAN_LIMITS } from "@/hooks/usePlanLimits";
import { Link } from "react-router-dom";

export const UsageStats = () => {
  const { data: planData, isLoading } = usePlanLimits();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
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
    if (percent >= 90) return "text-destructive";
    if (percent >= 75) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return "bg-destructive";
    if (percent >= 75) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Usage & Limits</h3>
            <p className="text-sm text-muted-foreground">{planInfo.name} Plan</p>
          </div>
          {plan !== "business" && (
            <Link to="/dashboard/pricing">
              <Button variant="outline" size="sm">
                Upgrade
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-5 space-y-5">
        {/* Chatbots */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Chatbots</span>
            </div>
            <span className={`text-sm font-medium ${getUsageColor(chatbotUsagePercent)}`}>
              {usage.chatbotsUsed} / {formatLimit(limits.chatbots)}
            </span>
          </div>
          {limits.chatbots !== Infinity && (
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor(chatbotUsagePercent)}`}
                style={{ width: `${Math.min(chatbotUsagePercent, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Zap className="w-4 h-4 text-foreground/70" />
              </div>
              <span className="text-sm font-medium">Messages this month</span>
            </div>
            <span className={`text-sm font-medium ${getUsageColor(messageUsagePercent)}`}>
              {usage.messagesThisMonth.toLocaleString()} / {formatLimit(limits.messagesPerMonth)}
            </span>
          </div>
          {limits.messagesPerMonth !== Infinity && (
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${getProgressColor(messageUsagePercent)}`}
                style={{ width: `${Math.min(messageUsagePercent, 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Warning if near limit */}
        {(chatbotUsagePercent >= 90 || messageUsagePercent >= 90) && plan !== "business" && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">
              You're approaching your plan limits. Consider upgrading for more capacity.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
