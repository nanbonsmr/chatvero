import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period. We don't believe in locking you in — if Chatvero isn't working for you, you're free to go.",
  },
  {
    question: "How fast can I install the widget on my website?",
    answer: "Most users are up and running in under 5 minutes. Simply copy our embed code and paste it into your website's HTML. We also have plugins for popular platforms like WordPress, Shopify, Webflow, and more.",
  },
  {
    question: "Does Chatvero work on any website?",
    answer: "Yes! Chatvero works on any website that allows custom JavaScript. This includes WordPress, Shopify, Webflow, Squarespace, Wix, custom-built sites, and more. If you can add a script tag, you can use Chatvero.",
  },
  {
    question: "Is visitor data secure and private?",
    answer: "Absolutely. We take data security seriously. All data is encrypted in transit and at rest. We're GDPR compliant and never sell or share your visitor data with third parties. You can also configure data retention policies to match your requirements.",
  },
  {
    question: "Can I remove the Chatvero branding?",
    answer: "Yes, branding removal is available on the Growth plan and above. Business plan users also get full white-label capabilities, including custom domains and complete brand customization.",
  },
  {
    question: "What happens if I exceed my conversation limit?",
    answer: "Don't worry — we won't cut off your widget mid-conversation. If you're approaching your limit, we'll notify you so you can upgrade your plan. We're here to help you grow, not hold you back.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day free trial on all plans so you can fully test Chatvero before committing. If you're not satisfied within the first 30 days of a paid subscription, contact our support team and we'll work with you to find a solution.",
  },
  {
    question: "Can I switch plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll get immediate access to new features. When downgrading, changes take effect at the start of your next billing cycle.",
  },
];

export const PricingFAQ = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-transparent to-secondary/20" />
      
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10"
          >
            FAQ
          </motion.span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about our pricing and plans
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="border border-border/50 rounded-xl px-6 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors duration-300 overflow-hidden"
                >
                  <AccordionTrigger className="text-left font-medium py-5 hover:no-underline [&[data-state=open]]:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};
