 import { motion, useInView } from "framer-motion";
 import { useRef } from "react";
 import { MessageCircle, Globe, Smartphone, Share2 } from "lucide-react";
 
 const integrations = [
   {
     name: "Website Widget",
     icon: Globe,
     description: "Embed on any website with one line of code",
     color: "from-blue-500 to-indigo-600",
     status: "Popular",
   },
   {
     name: "Telegram",
     icon: () => <span className="text-2xl">✈️</span>,
     description: "Auto-reply to Telegram messages 24/7",
     color: "from-sky-400 to-blue-500",
     status: "Easy Setup",
   },
   {
     name: "WhatsApp",
     icon: () => <span className="text-2xl">💬</span>,
     description: "Connect your WhatsApp Business account",
     color: "from-green-400 to-emerald-500",
     status: "Business",
   },
   {
     name: "Facebook",
     icon: () => <span className="text-2xl">📘</span>,
     description: "Handle Messenger conversations automatically",
     color: "from-blue-500 to-blue-600",
     status: null,
   },
   {
     name: "Instagram",
     icon: () => <span className="text-2xl">📸</span>,
     description: "Respond to Instagram DMs instantly",
     color: "from-pink-500 to-purple-600",
     status: null,
   },
   {
     name: "API Access",
     icon: Share2,
     description: "Build custom integrations with our REST API",
     color: "from-violet-500 to-purple-600",
     status: "Coming Soon",
   },
 ];
 
 export const IntegrationsSection = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   return (
     <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
       
       {/* Floating accent */}
       <motion.div 
         className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full opacity-20"
         style={{
           background: "radial-gradient(circle, hsl(186 100% 42% / 0.15) 0%, transparent 70%)",
         }}
         animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
         transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
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
             Integrations
           </motion.span>
           <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
             Deploy Everywhere,{" "}
             <span className="text-gradient">Manage Once</span>
           </h2>
           <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
             Connect your AI chatbot to all major platforms. One dashboard to manage conversations across channels.
           </p>
         </motion.div>
 
         {/* Integrations Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
           {integrations.map((integration, index) => {
             const Icon = integration.icon;
             return (
               <motion.div
                 key={integration.name}
                 initial={{ opacity: 0, y: 30 }}
                 animate={isInView ? { opacity: 1, y: 0 } : {}}
                 transition={{ duration: 0.5, delay: index * 0.08 }}
                 whileHover={{ y: -5, transition: { duration: 0.2 } }}
                 className="group relative"
               >
                 <div className="relative h-full p-5 sm:p-6 rounded-xl sm:rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                   {/* Status badge */}
                   {integration.status && (
                     <span className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                       integration.status === "Coming Soon" 
                         ? "bg-muted text-muted-foreground" 
                         : integration.status === "Easy Setup"
                         ? "bg-green-500/10 text-green-600 border border-green-200"
                         : "bg-primary/10 text-primary border border-primary/20"
                     }`}>
                       {integration.status}
                     </span>
                   )}
                   
                   {/* Icon */}
                   <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                     {typeof Icon === 'function' && Icon.name ? (
                       <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                     ) : (
                       <Icon />
                     )}
                   </div>
                   
                   <h3 className="font-display font-semibold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors">
                     {integration.name}
                   </h3>
                   <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                     {integration.description}
                   </p>
                 </div>
               </motion.div>
             );
           })}
         </div>
       </div>
     </section>
   );
 };