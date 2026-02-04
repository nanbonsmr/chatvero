import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 290,
    planKey: "starter" as const,
    features: [
      "1 Chatbot",
      "1,000 messages/month",
      "Basic analytics",
      "Email support",
      "Website widget",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Growth",
    monthlyPrice: 79,
    yearlyPrice: 790,
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
    monthlyPrice: 199,
    yearlyPrice: 1990,
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
      <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
        {plans.map((plan, index) => {
          const isCurrentPlan = currentPlan === plan.planKey;
          const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
          const isLoadingThis = loading && loadingPlan === plan.planKey;

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-xl border bg-card overflow-hidden ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border/50"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent py-1 text-center">
                  <span className="text-xs font-medium text-primary-foreground flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className={`p-4 lg:p-6 ${plan.popular ? "pt-10" : ""}`}>
                {/* Plan header */}
                <div className="mb-4">
                  <h3 className="font-display font-semibold text-lg">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl lg:text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground text-sm">
                      /{isYearly ? "year" : "month"}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent`} 
                        style={{ color: plan.popular ? 'hsl(var(--primary))' : undefined }} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  disabled={isCurrentPlan || loading}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isLoadingThis ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
