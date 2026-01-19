import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useChatbots, useDeleteChatbot } from "@/hooks/useChatbots";
import DashboardLayout from "@/components/DashboardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Plus,
  Users,
  MessageCircle,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  Loader2,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: chatbots = [], isLoading } = useChatbots();
  const deleteChatbot = useDeleteChatbot();

  const handleDelete = async (botId: string) => {
    try {
      await deleteChatbot.mutateAsync(botId);
      toast({
        title: "Deleted",
        description: "Chatbot has been deleted",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete chatbot",
        variant: "destructive",
      });
    }
  };

  // Calculate totals
  const totalChats = chatbots.reduce((sum, bot) => sum + bot.total_chats, 0);
  const totalLeads = chatbots.reduce((sum, bot) => sum + bot.leads_captured, 0);
  const avgConversion = chatbots.length > 0
    ? chatbots.reduce((sum, bot) => sum + bot.conversion_rate, 0) / chatbots.length
    : 0;

  const stats = [
    { 
      label: "Total Chatbots", 
      value: chatbots.length, 
      icon: MessageSquare,
      gradient: "from-violet-500 to-purple-500",
    },
    { 
      label: "Total Conversations", 
      value: totalChats, 
      icon: MessageCircle,
      gradient: "from-blue-500 to-cyan-500",
    },
    { 
      label: "Leads Captured", 
      value: totalLeads, 
      icon: Users,
      gradient: "from-green-500 to-emerald-500",
    },
    { 
      label: "Avg. Conversion", 
      value: `${avgConversion.toFixed(1)}%`, 
      icon: TrendingUp,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of all your chatbots
            </p>
          </div>
          <Link to="/create-chatbot">
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-display font-bold mb-1">
                  {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                </p>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chatbots Grid */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-4">Your Chatbots</h2>
          
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading chatbots...</p>
            </div>
          ) : chatbots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Create your first chatbot</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Build an AI-powered chatbot trained on your website content to engage visitors and capture leads.
              </p>
              <Link to="/create-chatbot">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80">
                  <Plus className="w-5 h-5" />
                  Create Chatbot
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((bot, index) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
                  
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{bot.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            bot.is_active 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {bot.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/chatbot/${bot.id}/settings`)}>
                            Settings
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete chatbot?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{bot.name}" and all its data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(bot.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* URL */}
                    <a
                      href={bot.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6 truncate"
                    >
                      {bot.website_url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-lg font-semibold">{bot.total_chats}</p>
                        <p className="text-xs text-muted-foreground">Chats</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-lg font-semibold">{bot.leads_captured}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <p className="text-lg font-semibold text-green-500">{bot.conversion_rate}%</p>
                        <p className="text-xs text-muted-foreground">Conv.</p>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant="outline"
                      className="w-full group/btn"
                      onClick={() => navigate(`/chatbot/${bot.id}`)}
                    >
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
