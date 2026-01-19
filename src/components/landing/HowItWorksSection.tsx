import { motion } from "framer-motion";
import { Link, Globe2, Wand2, Code2, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Link,
    title: "Paste Your URL",
    description: "Enter your website URL and we'll automatically crawl and analyze your content.",
  },
  {
    number: "02",
    icon: Wand2,
    title: "AI Training",
    description: "Our AI learns from your content to provide accurate, on-brand responses to visitors.",
  },
  {
    number: "03",
    icon: Code2,
    title: "Get Embed Code",
    description: "Copy a simple JavaScript snippet—just one line of code to add to your site.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Go Live",
    description: "Your chatbot is live! Start engaging visitors and capturing leads automatically.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 gradient-hero relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
            Launch Your Chatbot in{" "}
            <span className="text-gradient">4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No coding required. No complex setup. Get your AI chatbot up and running in under 5 minutes.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Card */}
                <div className="bg-card rounded-2xl border border-border p-6 relative z-10 h-full hover:border-primary/30 hover:shadow-card transition-all duration-300">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-6 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-sm font-bold">
                    {step.number}
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-20">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
