import { motion } from "framer-motion";
import { MessageSquare, Send, X } from "lucide-react";

export const ChatWidgetPreview = () => {
  const messages = [
    { role: "bot", text: "Hi there! 👋 How can I help you today?" },
    { role: "user", text: "What pricing plans do you offer?" },
    { role: "bot", text: "We offer three plans: Starter ($29/mo), Pro ($79/mo), and Enterprise (custom). All include unlimited chats!" },
  ];

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Glow effect */}
      <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20 scale-110" />
      
      {/* Chat Widget */}
      <motion.div
        className="relative bg-card rounded-2xl shadow-elevated border border-border overflow-hidden"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Header */}
        <div className="gradient-primary p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-primary-foreground">EmbedAI Assistant</h4>
              <p className="text-xs text-primary-foreground/70">Online • Typically replies instantly</p>
            </div>
          </div>
          <button className="p-1 hover:bg-primary-foreground/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 h-72 overflow-y-auto bg-background">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.5 + 0.5 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex justify-start"
          >
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <button className="p-3 rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="absolute -bottom-4 -right-4 px-4 py-2 rounded-full bg-card shadow-card border border-border"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Live Preview</span>
        </div>
      </motion.div>
    </div>
  );
};
