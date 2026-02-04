import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building, Headphones, Users, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  {
    icon: Building,
    title: "Enterprise-grade security",
    description: "SOC 2 compliance, SSO, and custom data retention",
  },
  {
    icon: Users,
    title: "Dedicated onboarding",
    description: "Personal training and setup assistance",
  },
  {
    icon: Cog,
    title: "Custom integrations",
    description: "Tailored connections to your tech stack",
  },
  {
    icon: Headphones,
    title: "24/7 premium support",
    description: "Direct access to our engineering team",
  },
];

export const CustomPlanSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 sm:py-20 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10" />
            <div className="absolute inset-0 backdrop-blur-sm" />
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div 
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
              transition={{ duration: 5, repeat: Infinity }}
            />

            <div className="relative p-8 sm:p-12 lg:p-16 border border-border/50 rounded-3xl bg-card/50">
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Content */}
                <div>
                  <motion.span 
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.1 }}
                    className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10"
                  >
                    Enterprise
                  </motion.span>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.2 }}
                    className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4"
                  >
                    Need a custom{" "}
                    <span className="text-gradient">solution?</span>
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 }}
                    className="text-muted-foreground text-lg mb-8"
                  >
                    For large organizations with specific requirements, we offer tailored plans with dedicated support, custom integrations, and enterprise-grade security.
                  </motion.p>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-4"
                  >
                    <Button size="lg" className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25">
                      Contact Sales
                    </Button>
                    <Button size="lg" variant="outline">
                      Schedule Demo
                    </Button>
                  </motion.div>
                </div>

                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
