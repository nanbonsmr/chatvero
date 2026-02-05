 import { motion, useInView } from "framer-motion";
 import { useRef } from "react";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
 
 const faqs = [
   {
     question: "How does Chatvero learn about my business?",
     answer: "Simply paste your website URL and Chatvero automatically crawls your pages to understand your products, services, and FAQs. You can also upload documents or add custom knowledge to train your chatbot further.",
   },
   {
     question: "Do I need any technical skills to set this up?",
     answer: "Not at all! Chatvero is designed to be completely no-code. You can create, customize, and deploy your AI chatbot in under 5 minutes without writing a single line of code.",
   },
   {
     question: "Can I customize how the chatbot looks and responds?",
     answer: "Yes! You can fully customize your chatbot's appearance to match your brand colors, set its personality tone (professional, friendly, casual), and configure welcome messages, follow-up prompts, and lead capture forms.",
   },
   {
     question: "How do I add the chatbot to my website?",
     answer: "After creating your chatbot, you'll get a simple embed code to copy and paste into your website. It works with any platform—WordPress, Shopify, Wix, Squarespace, or custom-built sites.",
   },
   {
     question: "What happens when the chatbot can't answer a question?",
     answer: "Chatvero is designed to be honest when it doesn't know something. It can offer to collect the visitor's contact info so your team can follow up personally, turning uncertainty into a lead capture opportunity.",
   },
   {
     question: "Is there a free trial?",
     answer: "Yes! You can start with our free plan which includes up to 100 messages per month. This lets you fully test Chatvero on your website before upgrading to a paid plan.",
   },
 ];
 
 export const FAQSection = () => {
   const ref = useRef(null);
   const isInView = useInView(ref, { once: true, margin: "-100px" });
 
   return (
     <section className="py-20 sm:py-24 lg:py-32 relative overflow-hidden">
       {/* Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20" />
       
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
             FAQ
           </motion.span>
           <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-4 sm:mb-6 tracking-tight px-2">
             Frequently Asked{" "}
             <span className="text-gradient">Questions</span>
           </h2>
           <p className="text-base sm:text-lg text-muted-foreground leading-relaxed px-4 sm:px-0">
             Everything you need to know about getting started with Chatvero.
           </p>
         </motion.div>
 
         {/* FAQ Accordion */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6, delay: 0.2 }}
           className="max-w-3xl mx-auto"
         >
           <Accordion type="single" collapsible className="space-y-3">
             {faqs.map((faq, index) => (
               <motion.div
                 key={index}
                 initial={{ opacity: 0, y: 20 }}
                 animate={isInView ? { opacity: 1, y: 0 } : {}}
                 transition={{ duration: 0.4, delay: index * 0.08 }}
               >
                 <AccordionItem 
                   value={`item-${index}`} 
                   className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl px-5 sm:px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-lg transition-all"
                 >
                   <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline py-4 sm:py-5">
                     {faq.question}
                   </AccordionTrigger>
                   <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-4 sm:pb-5">
                     {faq.answer}
                   </AccordionContent>
                 </AccordionItem>
               </motion.div>
             ))}
           </Accordion>
         </motion.div>
       </div>
     </section>
   );
 };