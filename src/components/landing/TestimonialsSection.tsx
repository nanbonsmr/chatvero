import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    quote: "Chatvero transformed our customer support. We reduced response time by 80% and our customers love the instant answers.",
    author: "Sarah Chen",
    role: "Head of Support",
    company: "TechFlow",
    avatar: "SC",
    rating: 5,
  },
  {
    quote: "Setting up was incredibly easy. Within 30 minutes, we had a fully trained chatbot answering questions about our entire product catalog.",
    author: "Marcus Johnson",
    role: "E-commerce Director",
    company: "StyleHub",
    avatar: "MJ",
    rating: 5,
  },
  {
    quote: "The AI understands context so well. It handles complex questions about our services that we thought only humans could answer.",
    author: "Elena Rodriguez",
    role: "CEO",
    company: "ConsultPro",
    avatar: "ER",
    rating: 5,
  },
  {
    quote: "We've seen a 3x increase in qualified leads since implementing Chatvero. It captures visitor information seamlessly.",
    author: "David Park",
    role: "Marketing VP",
    company: "GrowthLabs",
    avatar: "DP",
    rating: 5,
  },
  {
    quote: "The analytics dashboard gives us incredible insights into what our customers are asking. It's shaped our entire content strategy.",
    author: "Amanda Foster",
    role: "Content Lead",
    company: "MediaWorks",
    avatar: "AF",
    rating: 5,
  },
];

const companyLogos = [
  { name: "TechFlow", initials: "TF" },
  { name: "StyleHub", initials: "SH" },
  { name: "ConsultPro", initials: "CP" },
  { name: "GrowthLabs", initials: "GL" },
  { name: "MediaWorks", initials: "MW" },
  { name: "DataSync", initials: "DS" },
  { name: "CloudBase", initials: "CB" },
  { name: "InnovateCo", initials: "IC" },
];

export const TestimonialsSection = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section ref={sectionRef} className="py-24 md:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Quote className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Customer Stories</span>
          </motion.div>
          
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
            Loved by{" "}
            <span className="text-gradient">thousands</span>
            {" "}of businesses
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
            See how companies are transforming their customer experience with AI-powered chatbots
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_80%] lg:flex-[0_0_60%] px-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: selectedIndex === index ? 1 : 0.5,
                      scale: selectedIndex === index ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-8 md:p-10 shadow-card relative group"
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Quote icon */}
                    <div className="absolute -top-3 -left-1 sm:-top-4 sm:-left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                      <Quote className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                    </div>
                    
                    {/* Rating */}
                    <div className="flex gap-0.5 sm:gap-1 mb-4 sm:mb-6 pt-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    
                    {/* Quote */}
                    <blockquote className="text-base sm:text-lg md:text-xl text-foreground mb-6 sm:mb-8 leading-relaxed relative z-10">
                      "{testimonial.quote}"
                    </blockquote>
                    
                    {/* Author */}
                    <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm sm:text-base shadow-lg shadow-primary/20">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm sm:text-base">{testimonial.author}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {testimonial.role} at <span className="text-primary">{testimonial.company}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollPrev}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-border/50 hover:bg-secondary hover:border-border transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            {/* Dots */}
            <div className="flex gap-1.5 sm:gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    selectedIndex === index 
                      ? "w-6 sm:w-8 bg-primary" 
                      : "bg-border hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={scrollNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-border/50 hover:bg-secondary hover:border-border transition-all duration-300"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 sm:mt-16 lg:mt-20"
        >
          <p className="text-center text-xs sm:text-sm text-muted-foreground mb-6 sm:mb-8">
            Trusted by innovative companies worldwide
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-10">
            {companyLogos.map((company, index) => (
              <motion.div
                key={company.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-card/50 border border-border/50 hover:border-border hover:shadow-card transition-all duration-300 cursor-default"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{company.initials}</span>
                </div>
                <span className="font-medium text-xs sm:text-sm text-muted-foreground">{company.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
