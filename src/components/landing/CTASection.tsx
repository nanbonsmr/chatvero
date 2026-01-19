import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8"
          >
            <MessageSquare className="w-8 h-8 text-white" />
          </motion.div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Convert More Visitors?
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Join thousands of businesses using EmbedAI to engage visitors and capture leads automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold shadow-elevated"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Schedule a Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-white/60 mb-4">Trusted by companies worldwide</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {["TechCorp", "StartupX", "Enterprise", "GrowthCo"].map((company) => (
                <span key={company} className="text-white font-display font-semibold text-lg">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
