import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations, useConversationMessages } from "@/hooks/useConversations";
import DashboardLayout from "@/components/DashboardLayout";
import {
  MessageSquare,
  Search,
  User,
  Bot,
  Clock,
  Globe,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatbotConversations = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: conversations = [], isLoading } = useConversations(chatbotId);
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(selectedConversation);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.visitor_id.toLowerCase().includes(query) ||
      conv.last_message?.toLowerCase().includes(query)
    );
  });

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Limit messages to recent 50
  const recentMessages = messages.slice(-50);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 h-[calc(100vh-3.5rem)] flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-xl sm:text-2xl font-bold">Conversations</h1>
          <p className="text-muted-foreground text-sm">View chat history</p>
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Main Content - Stack on mobile, side-by-side on desktop */}
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[380px,1fr] gap-4 lg:gap-6">
          {/* Conversations List - Hidden on mobile when conversation selected */}
          <div className={`rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col ${
            selectedConversation ? "hidden lg:flex" : "flex"
          }`}>
            <div className="p-3 sm:p-4 border-b border-border/50">
              <h2 className="font-semibold text-sm sm:text-base">
                {filteredConversations.length} Conversation{filteredConversations.length !== 1 ? "s" : ""}
              </h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="divide-y divide-border/50">
                  {filteredConversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-3 sm:p-4 text-left hover:bg-secondary/50 transition-colors ${
                        selectedConversation === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px]">
                              {conv.visitor_id.substring(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true })}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">{conv.message_count} msgs</p>
                        </div>
                      </div>
                      {conv.last_message && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{conv.last_message}</p>
                      )}
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Message View - Full screen on mobile when selected */}
          <div className={`rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col ${
            selectedConversation ? "flex flex-1" : "hidden lg:flex"
          }`}>
            <AnimatePresence mode="wait">
              {selectedConversation && selectedConv ? (
                <motion.div
                  key={selectedConversation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Header */}
                  <div className="p-3 sm:p-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">Conversation</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(selectedConv.started_at), "MMM d, h:mm a")}
                          </span>
                          {selectedConv.page_url && (
                            <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]">
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{selectedConv.page_url}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedConversation(null)}
                        className="flex-shrink-0 lg:hidden"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-3 sm:p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full min-h-[200px]">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {recentMessages.length < messages.length && (
                          <p className="text-xs text-center text-muted-foreground py-2">
                            Showing last {recentMessages.length} of {messages.length} messages
                          </p>
                        )}
                        {recentMessages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2 sm:gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                          >
                            <div
                              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                msg.role === "assistant"
                                  ? "bg-gradient-to-br from-primary/20 to-primary/5"
                                  : "bg-secondary"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              ) : (
                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div
                              className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 rounded-2xl ${
                                msg.role === "assistant"
                                  ? "bg-secondary rounded-tl-md"
                                  : "bg-primary text-primary-foreground rounded-tr-md"
                              }`}
                            >
                              <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p
                                className={`text-[10px] sm:text-xs mt-1 ${
                                  msg.role === "assistant"
                                    ? "text-muted-foreground"
                                    : "text-primary-foreground/70"
                                }`}
                              >
                                {format(new Date(msg.created_at), "h:mm a")}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center min-h-[300px] sm:min-h-[400px]"
                >
                  <div className="text-center px-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1 text-sm sm:text-base">Select a conversation</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Choose a conversation to view messages
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotConversations;
