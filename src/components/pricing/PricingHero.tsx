import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PricingHeroProps {
  isYearly: boolean;
  onToggle: (value: boolean) => void;
}

export const PricingHero = ({ isYearly, onToggle }: PricingHeroProps) => {
  return (
    <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <motion.div 
        className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.1, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10"
          >
            Pricing
          </motion.span>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Simple pricing that{" "}
            <span className="text-gradient">grows with your business</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Turn every website visitor into a qualified lead. Choose the plan that fits your needs and start converting today.
          </p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-4 p-2 rounded-full bg-secondary/50 backdrop-blur-sm border border-border/50"
          >
            <Label 
              htmlFor="billing-toggle" 
              className={`text-sm font-medium cursor-pointer px-3 py-1.5 rounded-full transition-all duration-300 ${
                !isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => onToggle(false)}
            >
              Monthly
            </Label>
            <Switch 
              id="billing-toggle" 
              checked={isYearly} 
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-primary"
            />
            <div className="flex items-center gap-2">
              <Label 
                htmlFor="billing-toggle" 
                className={`text-sm font-medium cursor-pointer px-3 py-1.5 rounded-full transition-all duration-300 ${
                  isYearly ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => onToggle(true)}
              >
                Yearly
              </Label>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/10">
                Save 20%
              </Badge>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
