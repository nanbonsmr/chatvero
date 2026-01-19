import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Sparkles, Zap } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary" />
      
      {/* Animated background patterns */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="relative w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-10"
          >
            <MessageSquare className="w-10 h-10 text-white" />
            <motion.div 
              className="absolute -top-2 -right-2"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </motion.div>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-8 tracking-tight"
          >
            Ready to Convert More Visitors?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join thousands of businesses using EmbedAI to engage visitors and capture leads automatically.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/signup">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-base bg-white text-primary hover:bg-white/90 font-semibold shadow-2xl shadow-black/20 group"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Your Free Trial
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 hover:text-white hover:border-white/50 transition-all duration-300"
              >
                Schedule a Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-10 border-t border-white/20"
          >
            <p className="text-sm text-white/60 mb-6">Trusted by innovative companies worldwide</p>
            <div className="flex items-center justify-center flex-wrap gap-x-12 gap-y-4">
              {["TechCorp", "StartupX", "Enterprise", "GrowthCo", "ScaleUp"].map((company, i) => (
                <motion.span 
                  key={company} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="text-white/40 font-display font-semibold text-lg hover:text-white/60 transition-colors cursor-default"
                >
                  {company}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
