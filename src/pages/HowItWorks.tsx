import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Code, 
  Paintbrush, 
  Brain, 
  Rocket,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Code,
    title: "Install in Seconds",
    description: "Copy and paste a single line of code into your website. Works with any platform — WordPress, Shopify, Webflow, or custom sites.",
    details: [
      "No coding skills required",
      "Works on any website",
      "One-line embed code",
      "Plugins for popular platforms",
    ],
  },
  {
    number: "02",
    icon: Paintbrush,
    title: "Customize Your Widget",
    description: "Match your brand perfectly. Choose colors, add your logo, set welcome messages, and position the widget exactly where you want it.",
    details: [
      "Brand color matching",
      "Custom logo upload",
      "Personalized welcome messages",
      "Flexible positioning options",
    ],
  },
  {
    number: "03",
    icon: Brain,
    title: "Train Your AI",
    description: "Feed your website content, FAQs, and documents to the AI. It learns your business and answers questions accurately.",
    details: [
      "Automatic website crawling",
      "Document upload support",
      "Custom Q&A training",
      "Continuous learning",
    ],
  },
  {
    number: "04",
    icon: Rocket,
    title: "Go Live & Grow",
    description: "Launch your AI assistant and start converting visitors into leads and customers 24/7. Track performance with built-in analytics.",
    details: [
      "Real-time analytics",
      "Lead capture automation",
      "Performance insights",
      "Continuous optimization",
    ],
  },
];

const HowItWorks = () => {
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
                How It Works
              </motion.span>
              
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                From install to leads{" "}
                <span className="text-gradient">in minutes</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
                Get your AI-powered chat widget up and running in just 4 simple steps. No technical skills required.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 sm:py-20 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <div ref={ref} className="max-w-5xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: index * 0.15 }}
                    className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-16 mb-16 lg:mb-24 last:mb-0`}
                  >
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-5xl sm:text-6xl font-display font-bold text-primary/20">{step.number}</span>
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-2xl sm:text-3xl mb-4">{step.title}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed mb-6">{step.description}</p>
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-muted-foreground">{detail}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Visual */}
                    <div className="flex-1">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 sm:p-12 h-full flex items-center justify-center"
                      >
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5" />
                        <Icon className="w-24 h-24 sm:w-32 sm:h-32 text-primary/20" />
                      </motion.div>
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
                Set up your AI chat widget in minutes and start converting visitors into customers today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="xl" className="gradient-primary text-primary-foreground shadow-lg shadow-primary/25 group">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="xl" variant="outline" className="border-2">
                    Explore Features
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

export default HowItWorks;
