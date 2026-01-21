import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Globe, 
  Zap, 
  Users, 
  BarChart3, 
  Code, 
  Palette,
  MessageCircle,
  Target
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Website Crawling",
    description: "Automatically scan and index your entire website to train your AI chatbot with your unique content.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "AI-powered responses in milliseconds. Your visitors get instant answers 24/7, even while you sleep.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Lead Capture",
    description: "Collect emails and phone numbers naturally through conversation. Qualify leads automatically.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track conversations, conversion rates, and lead quality. Make data-driven decisions.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Code,
    title: "Easy Embed",
    description: "One line of code. Copy-paste the snippet and your chatbot goes live instantly on any website.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Palette,
    title: "Fully Customizable",
    description: "Match your brand colors, customize messages, and set the perfect tone for your audience.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: MessageCircle,
    title: "Smart Conversations",
    description: "Natural language understanding with context awareness. Your chatbot gets smarter over time.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Target,
    title: "Conversion Focused",
    description: "Built for sales. Proactive messages, CTAs, and qualification flows that convert visitors to customers.",
    gradient: "from-orange-500 to-red-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Floating accent */}
      <motion.div 
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(234 89% 58% / 0.1) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
            Features
          </motion.span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
            Everything You Need to{" "}
            <span className="text-gradient">Convert Visitors</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
            Powerful features designed to help you engage visitors, capture leads, and grow your business on autopilot.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                y: -8, 
                transition: { duration: 0.3, ease: "easeOut" } 
              }}
              className="group relative"
            >
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                {/* Icon */}
                <motion.div 
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                >
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  <div className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                </motion.div>
                
                <h3 className="font-display font-semibold text-base sm:text-lg mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
