import { motion } from "framer-motion";
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
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "AI-powered responses in milliseconds. Your visitors get instant answers 24/7, even while you sleep.",
  },
  {
    icon: Users,
    title: "Lead Capture",
    description: "Collect emails and phone numbers naturally through conversation. Qualify leads automatically.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track conversations, conversion rates, and lead quality. Make data-driven decisions.",
  },
  {
    icon: Code,
    title: "Easy Embed",
    description: "One line of code. Copy-paste the snippet and your chatbot goes live instantly on any website.",
  },
  {
    icon: Palette,
    title: "Fully Customizable",
    description: "Match your brand colors, customize messages, and set the perfect tone for your audience.",
  },
  {
    icon: MessageCircle,
    title: "Smart Conversations",
    description: "Natural language understanding with context awareness. Your chatbot gets smarter over time.",
  },
  {
    icon: Target,
    title: "Conversion Focused",
    description: "Built for sales. Proactive messages, CTAs, and qualification flows that convert visitors to customers.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Features</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Everything You Need to{" "}
            <span className="text-gradient">Convert Visitors</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you engage visitors, capture leads, and grow your business on autopilot.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
