import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations, useConversationMessages } from "@/hooks/useConversations";
import { useChatbots } from "@/hooks/useChatbots";
import {
  MessageSquare,
  ArrowLeft,
  Search,
  User,
  Bot,
  Clock,
  Globe,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";

const Conversations = () => {
  const [selectedChatbot, setSelectedChatbot] = useState<string>("all");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chatbots = [] } = useChatbots();
  const { data: conversations = [], isLoading } = useConversations(
    selectedChatbot === "all" ? undefined : selectedChatbot
  );
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(selectedConversation);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.visitor_id.toLowerCase().includes(query) ||
      conv.last_message?.toLowerCase().includes(query) ||
      conv.page_url?.toLowerCase().includes(query)
    );
  });

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">View chat history across your chatbots</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All chatbots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chatbots</SelectItem>
              {chatbots.map((bot) => (
                <SelectItem key={bot.id} value={bot.id}>
                  {bot.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[400px,1fr] gap-6">
          {/* Conversations List */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">
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
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="divide-y divide-border">
                  {filteredConversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                        selectedConversation === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[180px]">
                              {conv.visitor_id.substring(0, 12)}...
                            </p>
                            <p className="text-xs text-muted-foreground">{conv.chatbot_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true })}
                          </p>
                          <p className="text-xs text-muted-foreground">{conv.message_count} msgs</p>
                        </div>
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate">{conv.last_message}</p>
                      )}
                    </motion.button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Message View */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedConversation && selectedConv ? (
                <motion.div
                  key={selectedConversation}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{selectedConv.chatbot_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(selectedConv.started_at), "MMM d, yyyy h:mm a")}
                          </span>
                          {selectedConv.page_url && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Globe className="w-3 h-3" />
                              {selectedConv.page_url}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4 h-[500px]">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-3 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                msg.role === "assistant"
                                  ? "bg-primary/10"
                                  : "bg-secondary"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <Bot className="w-4 h-4 text-primary" />
                              ) : (
                                <User className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div
                              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                                msg.role === "assistant"
                                  ? "bg-secondary rounded-tl-md"
                                  : "bg-primary text-primary-foreground rounded-tr-md"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
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
                  className="h-[600px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">Select a conversation</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
