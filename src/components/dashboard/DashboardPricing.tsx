import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 13,
    yearlyPrice: 130,
    planKey: "starter" as const,
    features: [
      "2 Chatbots",
      "1,000 messages/month",
      "Basic analytics",
      "Email support",
      "Website widget",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Growth",
    monthlyPrice: 33,
    yearlyPrice: 330,
    planKey: "growth" as const,
    features: [
      "5 Chatbots",
      "10,000 messages/month",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Lead capture forms",
      "CRM integrations",
    ],
    popular: true,
    gradient: "from-primary to-accent",
  },
  {
    name: "Business",
    monthlyPrice: 63,
    yearlyPrice: 630,
    planKey: "business" as const,
    features: [
      "Unlimited Chatbots",
      "Unlimited messages",
      "White-label solution",
      "Dedicated support",
      "API access",
      "Custom integrations",
      "Team collaboration",
      "SLA guarantee",
    ],
    gradient: "from-purple-500 to-pink-500",
  },
];

interface DashboardPricingProps {
  currentPlan?: string;
}

export const DashboardPricing = ({ currentPlan }: DashboardPricingProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { createCheckoutSession, loading } = useDodoCheckout();

  const handleSelectPlan = async (plan: typeof plans[0]) => {
    setLoadingPlan(plan.planKey);
    await createCheckoutSession(plan.planKey);
    setLoadingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-semibold">Upgrade Your Plan</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose the plan that fits your needs</p>
        </div>
        
        {/* Billing toggle */}
        <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2">
          <span className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
              Save 17%
            </span>
          )}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.planKey;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isLoadingThis = loading && loadingPlan === plan.planKey;

          return (
            <div
              key={plan.name}
              className={`relative rounded-xl border bg-card overflow-hidden ${
                plan.popular ? "border-primary" : "border-border"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary py-1 text-center">
                  <span className="text-xs font-medium text-primary-foreground inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`p-5 ${plan.popular ? "pt-10" : ""}`}>
                {/* Plan header */}
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${price}</span>
                    <span className="text-muted-foreground text-sm">/{isYearly ? "yr" : "mo"}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || loading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isLoadingThis ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    "Choose Plan"
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
