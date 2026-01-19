import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { ChatWidgetPreview } from "./ChatWidgetPreview";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero pt-24 pb-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Chatbots in Minutes</span>
            </motion.div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Turn Your Website Into a{" "}
              <span className="text-gradient">Lead-Converting</span>{" "}
              Chatbot
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Paste your URL, and we'll create an AI chatbot trained on your content. 
              Engage visitors 24/7, capture leads, and boost conversions—no coding required.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-semibold">2,000+ businesses</p>
                <p className="text-sm text-muted-foreground">already using EmbedAI</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Widget Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <ChatWidgetPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
