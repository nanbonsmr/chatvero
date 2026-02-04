import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PricingTiersProps {
  isYearly: boolean;
}

const plans = [
  {
    name: "Starter",
    icon: Zap,
    description: "Perfect for individuals trying the product",
    monthlyPrice: 13,
    yearlyPrice: 10,
    features: [
      "2 active widgets",
      "Basic widget setup",
      "1,000 messages/month",
      "Standard customization",
      "Lead capture form",
      "Email notifications",
      "Community support",
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    name: "Growth",
    icon: Sparkles,
    description: "Best for growing businesses and teams",
    monthlyPrice: 33,
    yearlyPrice: 26,
    features: [
      "Up to 5 widgets",
      "Advanced AI training",
      "10,000 messages/month",
      "Lead qualification flows",
      "Remove Chatvero branding",
      "Performance analytics",
      "Zapier & webhook integrations",
      "Priority email support",
    ],
    cta: "Start Free Trial",
    popular: true,
    gradient: "from-primary/20 to-accent/20",
  },
  {
    name: "Business",
    icon: Building2,
    description: "For teams, agencies, and scaling companies",
    monthlyPrice: 63,
    yearlyPrice: 50,
    features: [
      "Unlimited widgets",
      "Unlimited conversations",
      "Full white-label experience",
      "Team access (up to 10 seats)",
      "Advanced CRM integrations",
      "Custom AI training",
      "Dedicated account manager",
      "Priority phone support",
    ],
    cta: "Start Free Trial",
    popular: false,
    gradient: "from-purple-500/10 to-pink-500/10",
  },
];

export const PricingTiers = ({ isYearly }: PricingTiersProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-8 sm:py-12 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative group"
              >
                {/* Glow effect for popular plan */}
                {plan.popular && (
                  <motion.div 
                    className="absolute -inset-0.5 rounded-3xl gradient-primary opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500"
                    animate={{ 
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                )}
                
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={`relative h-full rounded-2xl sm:rounded-3xl border backdrop-blur-sm p-6 sm:p-8 transition-all duration-500 ${
                    plan.popular
                      ? "border-primary/50 bg-card shadow-2xl shadow-primary/10"
                      : "border-border/50 bg-card/80 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
                  }`}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${plan.gradient} opacity-50`} />
                  
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                    >
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full gradient-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </span>
                    </motion.div>
                  )}

                  <div className="relative">
                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        plan.popular ? "gradient-primary" : "bg-primary/10"
                      }`}>
                        <Icon className={`w-6 h-6 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-medium text-muted-foreground">$</span>
                        <motion.span 
                          key={price}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-5xl font-display font-bold"
                        >
                          {price}
                        </motion.span>
                        <span className="text-muted-foreground ml-1">/month</span>
                      </div>
                      {isYearly && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-green-600 dark:text-green-400 mt-1"
                        >
                          Billed yearly (${price * 12}/year)
                        </motion.p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <motion.li 
                          key={feature} 
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{ delay: 0.4 + featureIndex * 0.05 }}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.popular 
                              ? "gradient-primary" 
                              : "bg-primary/10"
                          }`}>
                            <Check className={`w-3 h-3 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA - Always redirect to login */}
                    <Link to="/login">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          className={`w-full h-12 font-medium ${
                            plan.popular
                              ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                              : "bg-secondary hover:bg-secondary/80"
                          } transition-all duration-300`}
                          size="lg"
                        >
                          {plan.cta}
                        </Button>
                      </motion.div>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
