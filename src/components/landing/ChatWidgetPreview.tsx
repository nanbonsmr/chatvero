import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { useState, useEffect } from "react";

export const ChatWidgetPreview = () => {
  const [activeMessage, setActiveMessage] = useState(0);
  
  const messages = [
    { role: "bot", text: "Hi there! 👋 How can I help you today?" },
    { role: "user", text: "What pricing plans do you offer?" },
    { role: "bot", text: "We offer three plans: Starter ($29/mo), Pro ($79/mo), and Enterprise (custom). All include unlimited chats!" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev < messages.length ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto perspective-1000">
      {/* Glow effects */}
      <motion.div 
        className="absolute -inset-10 rounded-[40px] opacity-60 blur-3xl"
        style={{
          background: "conic-gradient(from 180deg, hsl(234 89% 58% / 0.2), hsl(260 80% 55% / 0.15), hsl(290 70% 50% / 0.1), hsl(234 89% 58% / 0.2))",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Chat Widget */}
      <motion.div
        className="relative bg-card rounded-3xl shadow-2xl shadow-black/10 border border-border/50 overflow-hidden backdrop-blur-xl"
        animate={{ 
          y: [0, -8, 0],
          rotateX: [0, 1, 0],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary" />
          <motion.div 
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <div className="relative p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative w-11 h-11 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
              >
                <Bot className="w-6 h-6 text-primary-foreground" />
                <motion.div 
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <div>
                <h4 className="font-semibold text-primary-foreground text-sm">EmbedAI Assistant</h4>
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    className="w-1.5 h-1.5 rounded-full bg-green-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <p className="text-xs text-primary-foreground/70">Always online</p>
                </div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-primary-foreground" />
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 h-72 overflow-y-auto bg-gradient-to-b from-background to-secondary/30">
          <AnimatePresence>
            {messages.slice(0, activeMessage).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-lg"
                      : "bg-card border border-border/50 text-foreground rounded-bl-lg"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </motion.div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {activeMessage >= messages.length && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-lg px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60"
                      animate={{ 
                        y: [0, -6, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity, 
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-secondary/50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-primary/30 focus:bg-background transition-all duration-300 placeholder:text-muted-foreground/60"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl gradient-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
        className="absolute -bottom-6 -right-6 px-4 py-2.5 rounded-full bg-card shadow-xl border border-border/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-2.5 h-2.5 rounded-full bg-green-500"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
        className="absolute -top-4 -left-4 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm"
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-600">AI Powered</span>
        </div>
      </motion.div>
    </div>
  );
};
