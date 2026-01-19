import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format, formatDistanceToNow, subDays, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowUpDown,
  Tag,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "general", label: "General" },
  { value: "support", label: "Support" },
  { value: "sales", label: "Sales" },
  { value: "feedback", label: "Feedback" },
];

const TIME_FILTERS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "90days", label: "Last 90 Days" },
];

const ChatbotConversations = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { data: conversations = [], isLoading } = useConversations(chatbotId);
  const { data: messages = [], isLoading: messagesLoading } = useConversationMessages(selectedConversation);

  const filteredConversations = useMemo(() => {
    let filtered = conversations.filter((conv) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          conv.visitor_id.toLowerCase().includes(query) ||
          conv.last_message?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== "all" && conv.category !== categoryFilter) {
        return false;
      }

      if (timeFilter !== "all") {
        const convDate = new Date(conv.started_at);
        const now = new Date();
        let cutoffDate: Date;
        
        switch (timeFilter) {
          case "today":
            cutoffDate = subDays(now, 1);
            break;
          case "7days":
            cutoffDate = subDays(now, 7);
            break;
          case "30days":
            cutoffDate = subDays(now, 30);
            break;
          case "90days":
            cutoffDate = subDays(now, 90);
            break;
          default:
            cutoffDate = new Date(0);
        }
        
        if (!isAfter(convDate, cutoffDate)) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.started_at).getTime();
      const dateB = new Date(b.started_at).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [conversations, searchQuery, categoryFilter, timeFilter, sortOrder]);

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const recentMessages = messages.slice(-50);

  const handleViewConversation = (convId: string) => {
    setSelectedConversation(convId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedConversation(null);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-xl sm:text-2xl font-bold">Conversations</h1>
          <p className="text-muted-foreground text-sm">View chat history</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
            </Button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
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
            <div className="divide-y divide-border/50">
              {filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 sm:p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">
                            {conv.visitor_id.substring(0, 8)}...
                          </p>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {conv.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(conv.started_at), { addSuffix: true })}
                          </span>
                          <span>{conv.message_count} messages</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewConversation(conv.id)}
                      className="flex-shrink-0 gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Conversation Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedConv && (
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                {/* Conversation Info */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pb-3 border-b">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedConv.visitor_id.substring(0, 12)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(selectedConv.started_at), "MMM d, yyyy h:mm a")}
                  </span>
                  {selectedConv.page_url && (
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{selectedConv.page_url}</span>
                    </span>
                  )}
                  <Badge variant="secondary">{selectedConv.category}</Badge>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 pr-4 -mr-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : recentMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No messages in this conversation
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentMessages.length < messages.length && (
                        <p className="text-xs text-center text-muted-foreground py-2">
                          Showing last {recentMessages.length} of {messages.length} messages
                        </p>
                      )}
                      {recentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.role === "assistant" ? "" : "flex-row-reverse"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                              msg.role === "assistant"
                                ? "bg-gradient-to-br from-primary/20 to-primary/5"
                                : "bg-secondary"
                            }`}
                          >
                            {msg.role === "assistant" ? (
                              <Bot className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <div
                            className={`max-w-[80%] px-3 py-2 rounded-xl ${
                              msg.role === "assistant"
                                ? "bg-secondary rounded-tl-sm"
                                : "bg-primary text-primary-foreground rounded-tr-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p
                              className={`text-[10px] mt-1 ${
                                msg.role === "assistant"
                                  ? "text-muted-foreground"
                                  : "text-primary-foreground/70"
                              }`}
                            >
                              {format(new Date(msg.created_at), "h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotConversations;
