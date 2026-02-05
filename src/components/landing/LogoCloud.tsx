 import { motion, useInView } from "framer-motion";
 import { useRef } from "react";
 
 const logos = [
   { name: "Stripe", gradient: "from-violet-500 to-purple-600" },
   { name: "Shopify", gradient: "from-green-500 to-emerald-600" },
   { name: "HubSpot", gradient: "from-orange-500 to-red-500" },
   { name: "Salesforce", gradient: "from-blue-400 to-blue-600" },
   { name: "Intercom", gradient: "from-blue-500 to-indigo-600" },
   { name: "Zendesk", gradient: "from-green-400 to-teal-500" },
 ];
 
 export const LogoCloud = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-50px" });
 
   return (
     <section className="py-12 sm:py-16 relative overflow-hidden border-y border-border/50">
       <div className="container mx-auto px-4 sm:px-6" ref={ref}>
         <motion.p
           initial={{ opacity: 0, y: 10 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.5 }}
           className="text-center text-xs sm:text-sm text-muted-foreground mb-8"
         >
           Works seamlessly with the tools you already use
         </motion.p>
         
         <div className="flex items-center justify-center flex-wrap gap-x-8 sm:gap-x-12 lg:gap-x-16 gap-y-4">
           {logos.map((logo, index) => (
             <motion.div
               key={logo.name}
               initial={{ opacity: 0, y: 20 }}
               animate={isInView ? { opacity: 1, y: 0 } : {}}
               transition={{ duration: 0.4, delay: index * 0.1 }}
               whileHover={{ scale: 1.05 }}
               className="group cursor-default"
             >
               <div className={`font-display font-bold text-lg sm:text-xl lg:text-2xl text-muted-foreground/40 hover:text-transparent hover:bg-gradient-to-r hover:${logo.gradient} hover:bg-clip-text transition-all duration-300`}>
                 {logo.name}
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 };