import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import { ChatWidgetPreview } from "./ChatWidgetPreview";
import { useRef } from "react";

export const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen pt-32 pb-20 overflow-hidden"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero" />
      
      {/* Floating orbs */}
      <motion.div 
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(234 89% 58% / 0.15) 0%, transparent 70%)",
        }}
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, hsl(260 80% 55% / 0.15) 0%, transparent 70%)",
        }}
        animate={{ 
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(186 100% 42% / 0.15) 0%, transparent 70%)",
        }}
        animate={{ 
          x: [0, 50, 0],
          y: [0, -40, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(234 89% 58%) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(234 89% 58%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div 
        style={{ y, opacity }}
        className="container mx-auto px-4 relative"
      >
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center min-h-[calc(100vh-10rem)]">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground/80">AI-Powered Chatbots in Minutes</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-8 tracking-tight"
            >
              Turn Your Website Into a{" "}
              <span className="relative inline-block">
                <span className="text-gradient">Lead-Converting</span>
                <motion.svg
                  viewBox="0 0 286 73"
                  fill="none"
                  className="absolute -bottom-2 left-0 w-full"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.path
                    d="M2 57.5C49 41 134 27.5 284 57.5"
                    stroke="url(#hero-underline)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  <defs>
                    <linearGradient id="hero-underline" x1="0" y1="0" x2="284" y2="0">
                      <stop stopColor="hsl(234 89% 58%)" />
                      <stop offset="0.5" stopColor="hsl(260 80% 55%)" />
                      <stop offset="1" stopColor="hsl(290 70% 50%)" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>{" "}
              Chatbot
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Paste your URL, and we'll create an AI chatbot trained on your content. 
              Engage visitors 24/7, capture leads, and boost conversions—no coding required.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto h-14 px-8 text-base gradient-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 group"
                  >
                    Start Free Trial
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
                  className="w-full sm:w-auto h-14 px-8 text-base border-border/60 hover:bg-secondary/80 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start"
            >
              <div className="flex -space-x-3">
                {[
                  "bg-gradient-to-br from-blue-400 to-blue-600",
                  "bg-gradient-to-br from-purple-400 to-purple-600",
                  "bg-gradient-to-br from-pink-400 to-pink-600",
                  "bg-gradient-to-br from-orange-400 to-orange-600",
                  "bg-gradient-to-br from-green-400 to-green-600",
                ].map((gradient, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                    className={`w-11 h-11 rounded-full ${gradient} border-[3px] border-background flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                  >
                    {String.fromCharCode(65 + i)}
                  </motion.div>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center sm:justify-start mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm font-semibold ml-1">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2,000+</span> businesses trust EmbedAI
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Widget Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:pl-8"
          >
            <ChatWidgetPreview />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
