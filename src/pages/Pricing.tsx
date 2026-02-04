import { useState, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PricingTiers } from "@/components/pricing/PricingTiers";
import { FeatureComparison } from "@/components/pricing/FeatureComparison";
import { CustomPlanSection } from "@/components/pricing/CustomPlanSection";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { PricingCTA } from "@/components/pricing/PricingCTA";

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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
      {/* Subtle animated gradient that follows mouse */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(234 89% 58% / 0.03), transparent 40%)`,
        }}
      />
      
      {/* Noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.015]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      
      <Navbar />
      <main className="relative z-10">
        <PricingHero isYearly={isYearly} onToggle={setIsYearly} />
        <PricingTiers isYearly={isYearly} />
        <FeatureComparison />
        <CustomPlanSection />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
