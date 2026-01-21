import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link2, Wand2, Code2, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link2,
    title: "Paste Your URL",
    description: "Enter your website URL and we'll automatically crawl and analyze your content.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Training",
    description: "Our AI learns from your content to provide accurate, on-brand responses to visitors.",
    color: "from-purple-500 to-pink-500",
  },
  {
    number: "03",
    icon: Code2,
    title: "Get Embed Code",
    description: "Copy a simple JavaScript snippet—just one line of code to add to your site.",
    color: "from-orange-500 to-yellow-500",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Go Live",
    description: "Your chatbot is live! Start engaging visitors and capturing leads automatically.",
    color: "from-green-500 to-emerald-500",
  },
];

export const HowItWorksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(260 80% 55% / 0.15) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
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
            How It Works
          </motion.span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
            Launch Your Chatbot in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
            No coding required. No complex setup. Get your AI chatbot up and running in under 5 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div ref={ref} className="relative max-w-5xl mx-auto">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-32 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20">
            <motion.div 
              className="h-full gradient-primary"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="relative group"
              >
                {/* Card */}
                <motion.div 
                  className="relative bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/50 p-5 sm:p-6 h-full hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                  whileHover={{ y: -8 }}
                >
                  {/* Number Badge */}
                  <motion.div 
                    className={`absolute -top-3 sm:-top-4 left-4 sm:left-6 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-gradient-to-r ${step.color} text-white text-xs sm:text-sm font-bold shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {step.number}
                  </motion.div>
                  
                  <div className="mt-4 sm:mt-6">
                    {/* Icon */}
                    <motion.div 
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${step.color} bg-opacity-10 flex items-center justify-center mb-4 sm:mb-5 relative`}
                      style={{ 
                        background: `linear-gradient(135deg, hsl(var(--secondary)) 0%, hsl(var(--secondary)) 100%)` 
                      }}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </motion.div>
                    
                    <h3 className="font-display font-semibold text-lg sm:text-xl mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>

                {/* Arrow for desktop - positioned between cards */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden lg:flex absolute top-28 -right-4 z-20 w-8 h-8 rounded-full gradient-primary items-center justify-center shadow-lg shadow-primary/25"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.8 + index * 0.2, type: "spring" }}
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
