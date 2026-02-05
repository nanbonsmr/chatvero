import DashboardLayout from "@/components/DashboardLayout";
import { UsageStats } from "@/components/dashboard/UsageStats";
import { usePlanLimits, PLAN_LIMITS } from "@/hooks/usePlanLimits";
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
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Plan Features</h3>
            <p className="text-sm text-muted-foreground">Features available on your plan</p>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : planData ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((feature) => {
                  const isAvailable = planData.limits.features[feature.key as keyof typeof planData.limits.features];
                  return (
                    <div
                      key={feature.key}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isAvailable ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-transparent"
                      }`}
                    >
                      {isAvailable ? (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className={`text-sm ${isAvailable ? "" : "text-muted-foreground"}`}>
                        {feature.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="rounded-xl border border-border bg-card">
          <div className="p-5 border-b border-border">
            <h3 className="font-semibold">Plan Comparison</h3>
            <p className="text-sm text-muted-foreground">See how plans compare</p>
          </div>

          {/* Mobile: Card Layout */}
          <div className="block sm:hidden p-4 space-y-3">
            {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
              <div
                key={key}
                className={`p-4 rounded-lg ${
                  planData?.plan === key
                    ? "bg-primary/5 border border-primary/20"
                    : "bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{plan.name}</span>
                  {planData?.plan === key && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Current</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Chatbots</p>
                    <p className="font-medium">{plan.chatbots === Infinity ? "∞" : plan.chatbots}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Messages</p>
                    <p className="font-medium">{plan.messagesPerMonth === Infinity ? "∞" : plan.messagesPerMonth.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Plan</th>
                  <th className="text-center p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Chatbots</th>
                  <th className="text-center p-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">Messages</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
                  <tr
                    key={key}
                    className={`border-b border-border/50 ${planData?.plan === key ? "bg-primary/5" : ""}`}
                  >
                    <td className="p-4 font-medium">
                      {plan.name}
                      {planData?.plan === key && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Current</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {plan.chatbots === Infinity ? "Unlimited" : plan.chatbots}
                    </td>
                    <td className="text-center p-4">
                      {plan.messagesPerMonth === Infinity ? "Unlimited" : plan.messagesPerMonth.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardUsagePage;
