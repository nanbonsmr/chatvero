import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "13",
    description: "Perfect for small websites and personal projects",
    features: [
      "2 Chatbots",
      "1,000 messages/month",
      "Basic customization",
      "Email lead capture",
      "7-day chat history",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Growth",
    price: "33",
    description: "Best for growing businesses and teams",
    features: [
      "5 Chatbots",
      "10,000 messages/month",
      "Full customization",
      "Lead capture + CRM integration",
      "30-day chat history",
      "Analytics dashboard",
      "Priority support",
      "Custom branding",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Business",
    price: "63",
    description: "For teams, agencies, and scaling companies",
    features: [
      "Unlimited Chatbots",
      "Unlimited messages",
      "White-label solution",
      "Advanced integrations",
      "Unlimited history",
      "Dedicated account manager",
      "SLA guarantee",
      "Custom AI training",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
];

export const PricingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <section id="pricing" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Floating elements */}
      <motion.div 
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(234 89% 58% / 0.2) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/5 border border-primary/10"
          >
            Pricing
          </motion.span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
            Simple, Transparent{" "}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
            Start free, upgrade when you're ready. All plans include a 14-day free trial.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
              }}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
              className="relative group"
            >
              {/* Glow effect for popular plan */}
              {plan.popular && (
                <motion.div 
                  className="absolute -inset-px rounded-3xl gradient-primary opacity-20 blur-xl"
                  animate={{ 
                    opacity: hoveredPlan === plan.name ? 0.4 : 0.2,
                  }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className={`relative h-full rounded-xl sm:rounded-2xl border backdrop-blur-sm p-5 sm:p-8 transition-all duration-500 ${
                  plan.popular
                    ? "border-primary/50 bg-card shadow-xl shadow-primary/10"
                    : "border-border/50 bg-card/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                }`}
              >
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

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="font-display font-bold text-2xl mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== "Custom" && (
                      <span className="text-2xl font-medium text-muted-foreground">$</span>
                    )}
                    <motion.span 
                      className="text-5xl font-display font-bold"
                      key={plan.price}
                    >
                      {plan.price}
                    </motion.span>
                    {plan.price !== "Custom" && (
                      <span className="text-muted-foreground ml-1">/month</span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={feature} 
                      className="flex items-center gap-2 sm:gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ delay: 0.3 + featureIndex * 0.05 }}
                    >
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular 
                          ? "gradient-primary" 
                          : "bg-primary/10"
                      }`}>
                        <Check className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className={`w-full h-10 sm:h-12 font-medium text-sm sm:text-base ${
                        plan.popular
                          ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
                          : "bg-secondary hover:bg-secondary/80"
                      } transition-all duration-300`}
                      size="lg"
                    >
                      {plan.popular && <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />}
                      {plan.cta}
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
