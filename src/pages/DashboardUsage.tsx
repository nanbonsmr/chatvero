import DashboardLayout from "@/components/DashboardLayout";
import { UsageStats } from "@/components/dashboard/UsageStats";
import { usePlanLimits, PLAN_LIMITS } from "@/hooks/usePlanLimits";
import { motion } from "framer-motion";
import { Check, X, Loader2 } from "lucide-react";

const DashboardUsagePage = () => {
  const { data: planData, isLoading } = usePlanLimits();

  const features = [
    { key: "basicAnalytics", label: "Basic Analytics" },
    { key: "advancedAnalytics", label: "Advanced Analytics" },
    { key: "customBranding", label: "Custom Branding" },
    { key: "leadCapture", label: "Lead Capture Forms" },
    { key: "crmIntegrations", label: "CRM Integrations" },
    { key: "whiteLabel", label: "White-Label Solution" },
    { key: "apiAccess", label: "API Access" },
    { key: "prioritySupport", label: "Priority Support" },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">Usage & Limits</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monitor your plan usage and available features
          </p>
        </div>

        {/* Usage Stats */}
        <UsageStats />

        {/* Plan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border/50">
            <h3 className="font-display font-semibold text-base sm:text-lg">Plan Features</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Features available on your current plan
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : planData ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((feature) => {
                  const isAvailable = planData.limits.features[feature.key as keyof typeof planData.limits.features];
                  return (
                    <div
                      key={feature.key}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        isAvailable ? "bg-primary/5" : "bg-muted/50"
                      }`}
                    >
                      {isAvailable ? (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`text-sm ${isAvailable ? "text-foreground" : "text-muted-foreground"}`}>
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Plan Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border/50">
            <h3 className="font-display font-semibold text-base sm:text-lg">Plan Limits Comparison</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              See how different plans compare
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Chatbots</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Messages/Month</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
                  <tr
                    key={key}
                    className={`border-b border-border/30 ${
                      planData?.plan === key ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4 font-medium">
                      {plan.name}
                      {planData?.plan === key && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          Current
                        </span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {plan.chatbots === Infinity ? "Unlimited" : plan.chatbots}
                    </td>
                    <td className="text-center p-4">
                      {plan.messagesPerMonth === Infinity
                        ? "Unlimited"
                        : plan.messagesPerMonth.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardUsagePage;
