import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  MessageSquare, 
  Brain, 
  Palette, 
  BarChart3, 
  Users, 
  Zap,
  Globe,
  Shield,
  Sparkles,
  Clock,
  Target,
  Puzzle
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Smart Conversations",
    description: "AI-powered chat that understands context and provides relevant, helpful responses to your visitors 24/7.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Training",
    description: "Train your widget on your website content, documents, and FAQs for accurate, brand-specific answers.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Palette,
    title: "Full Customization",
    description: "Match your brand perfectly with custom colors, logos, welcome messages, and widget positioning.",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Users,
    title: "Lead Capture",
    description: "Automatically collect visitor information and qualify leads with smart conversation flows.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track conversations, popular topics, conversion rates, and visitor engagement in real-time.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Go live in under 5 minutes with our simple embed code. No coding required.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Engage visitors in their preferred language with automatic language detection and translation.",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your data is protected with end-to-end encryption, GDPR compliance, and SOC 2 certification.",
    gradient: "from-slate-500 to-zinc-500",
  },
  {
    icon: Puzzle,
    title: "Integrations",
    description: "Connect with your existing tools — CRM, Slack, Zapier, and thousands more via webhooks.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Never miss a lead. Your AI assistant is always online, ready to help visitors anytime.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Target,
    title: "Lead Qualification",
    description: "Score and qualify leads automatically based on conversation context and engagement signals.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "Smart Suggestions",
    description: "AI-powered response suggestions help visitors find answers faster with predictive prompts.",
    gradient: "from-amber-500 to-yellow-500",
  },
];

const Features = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(234 89% 58% / 0.03), transparent 40%)`,
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />

      <Navbar />
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 sm:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-4 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10"
              >
                Features
              </motion.span>
              
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Everything you need to{" "}
                <span className="text-gradient">convert visitors</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Powerful features designed to help you engage visitors, capture leads, and grow your business automatically.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 sm:py-20 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group relative"
                  >
                    <div className="h-full p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-xl mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          <div className="container mx-auto px-4 sm:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Ready to get started?
              </h2>
              <p className="text-lg text-muted-foreground mb-10">
                Join thousands of businesses using Chatvero to engage visitors and grow their customer base.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="xl" className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="xl" variant="outline" className="border-2">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
