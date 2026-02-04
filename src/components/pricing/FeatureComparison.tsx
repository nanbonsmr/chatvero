import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = [
  {
    category: "Widgets & Usage",
    items: [
      { name: "Active widgets", starter: "1", growth: "5", business: "Unlimited" },
      { name: "Monthly conversations", starter: "500", growth: "5,000", business: "Unlimited" },
      { name: "AI training sources", starter: "Basic", growth: "Advanced", business: "Custom" },
    ],
  },
  {
    category: "Customization",
    items: [
      { name: "Widget customization", starter: "Standard", growth: "Full", business: "Full" },
      { name: "Remove branding", starter: false, growth: true, business: true },
      { name: "White-label experience", starter: false, growth: false, business: true },
      { name: "Custom domain", starter: false, growth: false, business: true },
    ],
  },
  {
    category: "Lead Capture",
    items: [
      { name: "Lead capture forms", starter: true, growth: true, business: true },
      { name: "Lead qualification flows", starter: false, growth: true, business: true },
      { name: "Lead enrichment", starter: false, growth: true, business: true },
      { name: "CRM integrations", starter: false, growth: "Basic", business: "Advanced" },
    ],
  },
  {
    category: "Analytics & Insights",
    items: [
      { name: "Basic analytics", starter: true, growth: true, business: true },
      { name: "Performance dashboard", starter: false, growth: true, business: true },
      { name: "Conversation insights", starter: false, growth: true, business: true },
      { name: "Custom reports", starter: false, growth: false, business: true },
    ],
  },
  {
    category: "Integrations",
    items: [
      { name: "Email notifications", starter: true, growth: true, business: true },
      { name: "Zapier integration", starter: false, growth: true, business: true },
      { name: "Webhook support", starter: false, growth: true, business: true },
      { name: "API access", starter: false, growth: false, business: true },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Community support", starter: true, growth: true, business: true },
      { name: "Email support", starter: false, growth: true, business: true },
      { name: "Priority support", starter: false, growth: true, business: true },
      { name: "Dedicated account manager", starter: false, growth: false, business: true },
      { name: "Phone support", starter: false, growth: false, business: true },
    ],
  },
];

const renderValue = (value: boolean | string) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="w-5 h-5 text-primary" />
    ) : (
      <Minus className="w-5 h-5 text-muted-foreground/50" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
};

export const FeatureComparison = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Compare <span className="text-gradient">all features</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A detailed breakdown of what's included in each plan
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-[40%] py-6 text-base font-semibold">Features</TableHead>
                    <TableHead className="text-center py-6 text-base font-semibold">Starter</TableHead>
                    <TableHead className="text-center py-6 text-base font-semibold bg-primary/5 border-x border-primary/10">
                      <div className="flex items-center justify-center gap-2">
                        Growth
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Popular
                        </span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center py-6 text-base font-semibold">Business</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((category, categoryIndex) => (
                    <>
                      <TableRow 
                        key={category.category} 
                        className="border-border/50 bg-secondary/30 hover:bg-secondary/40"
                      >
                        <TableCell 
                          colSpan={4} 
                          className="py-3 font-semibold text-sm uppercase tracking-wider text-muted-foreground"
                        >
                          {category.category}
                        </TableCell>
                      </TableRow>
                      {category.items.map((item, itemIndex) => (
                        <motion.tr
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ delay: 0.3 + (categoryIndex * 0.1) + (itemIndex * 0.03) }}
                          className="border-border/50 hover:bg-secondary/20 transition-colors"
                        >
                          <TableCell className="py-4 text-sm">{item.name}</TableCell>
                          <TableCell className="text-center py-4">
                            <div className="flex items-center justify-center">
                              {renderValue(item.starter)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-4 bg-primary/5 border-x border-primary/10">
                            <div className="flex items-center justify-center">
                              {renderValue(item.growth)}
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <div className="flex items-center justify-center">
                              {renderValue(item.business)}
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
