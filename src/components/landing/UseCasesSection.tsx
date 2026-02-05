 import { motion, useInView } from "framer-motion";
 import { useRef } from "react";
 import { 
   ShoppingCart, 
   Building2, 
   GraduationCap, 
   Stethoscope,
   Plane,
   Briefcase
 } from "lucide-react";
 
 const useCases = [
   {
     icon: ShoppingCart,
     industry: "E-commerce",
     title: "Boost Sales & Support",
     description: "Answer product questions, recommend items, and handle order inquiries 24/7. Reduce cart abandonment with proactive chat.",
     stats: "↑ 35% conversion rate",
     gradient: "from-orange-500 to-amber-500",
   },
   {
     icon: Building2,
     industry: "SaaS",
     title: "Scale Customer Success",
     description: "Onboard users faster with instant answers. Handle tier-1 support while your team focuses on complex issues.",
     stats: "↓ 60% support tickets",
     gradient: "from-blue-500 to-indigo-600",
   },
   {
     icon: Briefcase,
     industry: "Agencies",
     title: "Qualify Leads Automatically",
     description: "Capture visitor info, understand their needs, and schedule meetings—all through natural conversation.",
     stats: "3x more qualified leads",
     gradient: "from-violet-500 to-purple-600",
   },
   {
     icon: GraduationCap,
     industry: "Education",
     title: "Student Support 24/7",
     description: "Answer admissions questions, course details, and campus info instantly. Free up staff for complex inquiries.",
     stats: "↑ 45% inquiry response",
     gradient: "from-green-500 to-emerald-500",
   },
   {
     icon: Stethoscope,
     industry: "Healthcare",
     title: "Patient Engagement",
     description: "Handle appointment scheduling, answer common health questions, and provide clinic information around the clock.",
     stats: "↓ 40% call volume",
     gradient: "from-red-500 to-rose-500",
   },
   {
     icon: Plane,
     industry: "Travel",
     title: "Travel Assistance",
     description: "Help visitors find the perfect trip, answer booking questions, and provide destination info instantly.",
     stats: "↑ 50% booking starts",
     gradient: "from-cyan-500 to-teal-500",
   },
 ];
 
 export const UseCasesSection = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   return (
     <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden bg-secondary/30">
       {/* Background pattern */}
       <div 
         className="absolute inset-0 opacity-[0.015]"
         style={{
           backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
           backgroundSize: "40px 40px",
         }}
       />
       
       <div className="container mx-auto px-4 sm:px-6 relative" ref={ref}>
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6 }}
           className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
         >
           <motion.span 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={isInView ? { opacity: 1, scale: 1 } : {}}
             className="inline-block text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider mb-3 sm:mb-4 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/5 border border-primary/10"
           >
             Use Cases
           </motion.span>
           <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
             Built for{" "}
             <span className="text-gradient">Every Industry</span>
           </h2>
           <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
             From startups to enterprises, Chatvero adapts to your business needs and industry requirements.
           </p>
         </motion.div>
 
         {/* Use Cases Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
           {useCases.map((useCase, index) => (
             <motion.div
               key={useCase.industry}
               initial={{ opacity: 0, y: 30 }}
               animate={isInView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.5, delay: index * 0.08 }}
               whileHover={{ y: -5, transition: { duration: 0.2 } }}
               className="group"
             >
               <div className="h-full p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                 {/* Header */}
                 <div className="flex items-start justify-between mb-4">
                   <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                     <useCase.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                   </div>
                   <span className="text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                     {useCase.industry}
                   </span>
                 </div>
                 
                 <h3 className="font-display font-semibold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors">
                   {useCase.title}
                 </h3>
                 <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4">
                   {useCase.description}
                 </p>
                 
                 {/* Stats */}
                 <div className={`inline-flex items-center text-xs sm:text-sm font-semibold bg-gradient-to-r ${useCase.gradient} bg-clip-text text-transparent`}>
                   {useCase.stats}
                 </div>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };