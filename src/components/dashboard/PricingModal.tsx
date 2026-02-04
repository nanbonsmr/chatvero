import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Zap, Building2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDodoCheckout } from "@/hooks/useDodoCheckout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
}

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    description: "Perfect for individuals",
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: [
      "1 active widget",
      "500 conversations/month",
      "Lead capture form",
      "Email notifications",
    ],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "growth",
    name: "Growth",
    icon: Sparkles,
    description: "Best for growing businesses",
    monthlyPrice: 79,
    yearlyPrice: 63,
    features: [
      "Up to 5 widgets",
      "5,000 conversations/month",
      "Remove branding",
      "Performance analytics",
    ],
    popular: true,
    gradient: "from-primary to-accent",
  },
  {
    id: "business",
    name: "Business",
    icon: Building2,
    description: "For teams and agencies",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      "Unlimited widgets",
      "Unlimited conversations",
      "White-label experience",
      "Priority support",
    ],
    gradient: "from-purple-500 to-pink-500",
  },
];

export const PricingModal = ({ open, onOpenChange, currentPlan }: PricingModalProps) => {
  const [isYearly, setIsYearly] = useState(false);
  const { createCheckoutSession, loading } = useDodoCheckout();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    await createCheckoutSession(planId as "starter" | "growth" | "business");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl sm:text-3xl font-bold">
            Choose your plan
          </DialogTitle>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 py-4">
          <Label
            htmlFor="billing-toggle"
            className={`text-sm ${!isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label
            htmlFor="billing-toggle"
            className={`text-sm ${isYearly ? "text-foreground font-medium" : "text-muted-foreground"}`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-green-500 font-medium">Save 20%</span>
          </Label>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const isCurrentPlan = currentPlan?.toLowerCase() === plan.id;
            const isProcessing = loading && selectedPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -4 }}
                className={`relative rounded-xl border p-5 transition-all ${
                  plan.popular
                    ? "border-primary/50 bg-card shadow-lg"
                    : "border-border/50 bg-card/80 hover:border-primary/30"
                } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </span>
                )}

                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <span className="absolute -top-3 right-4 inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                    Current
                  </span>
                )}

                {/* Plan Header */}
                <div className="mb-4">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 bg-gradient-to-br ${plan.gradient}`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{plan.name}</h3>
                  <p className="text-muted-foreground text-xs">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-medium text-muted-foreground">$</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={price}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="text-3xl font-display font-bold"
                      >
                        {price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-green-500 mt-1">
                      Billed yearly (${price * 12}/year)
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "gradient-primary" : "bg-primary/10"
                        }`}
                      >
                        <Check
                          className={`w-2.5 h-2.5 ${
                            plan.popular ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  size="sm"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading || isCurrentPlan}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : (
                    "Select Plan"
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </DialogContent>
    </Dialog>
  );
};
