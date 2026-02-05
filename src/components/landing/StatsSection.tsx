 import { motion, useInView } from "framer-motion";
 import { useRef, useState, useEffect } from "react";
 
 const stats = [
   { value: 2500, suffix: "+", label: "Active Chatbots", description: "Deployed worldwide" },
   { value: 15, suffix: "M+", label: "Messages Sent", description: "Conversations powered" },
   { value: 98, suffix: "%", label: "Satisfaction Rate", description: "From our customers" },
   { value: 40, suffix: "%", label: "More Leads", description: "Average increase" },
 ];
 
 function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
   const [count, setCount] = useState(0);
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   useEffect(() => {
     if (!isInView) return;
     
     const duration = 2000;
     const steps = 60;
     const increment = value / steps;
     let current = 0;
     
     const timer = setInterval(() => {
       current += increment;
       if (current >= value) {
         setCount(value);
         clearInterval(timer);
       } else {
         setCount(Math.floor(current));
       }
     }, duration / steps);
     
     return () => clearInterval(timer);
   }, [isInView, value]);
 
   return (
     <span ref={ref} className="tabular-nums">
       {count.toLocaleString()}{suffix}
     </span>
   );
 }
 
 export const StatsSection = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   return (
     <section className="py-16 sm:py-20 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/30" />
       
       <div className="container mx-auto px-4 sm:px-6 relative" ref={ref}>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
           {stats.map((stat, index) => (
             <motion.div
               key={stat.label}
               initial={{ opacity: 0, y: 30 }}
               animate={isInView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="text-center"
             >
               <motion.div
                 initial={{ scale: 0.5 }}
                 animate={isInView ? { scale: 1 } : {}}
                 transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: "spring" }}
                 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-2"
               >
                 <AnimatedCounter value={stat.value} suffix={stat.suffix} />
               </motion.div>
               <p className="font-semibold text-foreground text-sm sm:text-base">{stat.label}</p>
               <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.description}</p>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };