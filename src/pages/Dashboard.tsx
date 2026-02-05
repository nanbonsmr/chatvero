import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useChatbots, useDeleteChatbot } from "@/hooks/useChatbots";
import DashboardLayout from "@/components/DashboardLayout";
import { SubscriptionCard } from "@/components/dashboard/SubscriptionCard";
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
  Plus,
  Users,
  MessageCircle,
  ExternalLink,
  MoreVertical,
  Loader2,
  Trash2,
  ArrowRight,
  Bot,
  Activity,
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

  const totalChats = chatbots.reduce((sum, bot) => sum + bot.total_chats, 0);
  const totalLeads = chatbots.reduce((sum, bot) => sum + bot.leads_captured, 0);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage and monitor your chatbots
            </p>
          </div>
          <Link to="/create-chatbot">
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{chatbots.length}</p>
              <p className="text-xs text-muted-foreground">Chatbots</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-foreground/70" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalChats.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Conversations</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Users className="w-5 h-5 text-foreground/70" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalLeads.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Leads</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <SubscriptionCard />
        </div>

        {/* Chatbots Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Chatbots</h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : chatbots.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Bot className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No chatbots yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Create your first chatbot to start engaging visitors and capturing leads.
              </p>
              <Link to="/create-chatbot">
                <Button>
                  <Plus className="w-4 h-4" />
                  Create Your First Chatbot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chatbots.map((bot) => (
                <div
                  key={bot.id}
                  className="group rounded-xl border border-border bg-card hover:shadow-sm transition-all duration-200"
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium truncate">{bot.name}</h3>
                          <span className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                            bot.is_active 
                              ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                              : "bg-secondary text-muted-foreground"
                          }`}>
                            {bot.is_active ? "Live" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4 truncate transition-colors"
                    >
                      <span className="truncate">{bot.website_url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </a>

                    {/* Stats */}
                    <div className="flex items-center gap-4 py-3 border-y border-border/50 mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{bot.total_chats}</span>
                        <span className="text-xs text-muted-foreground">chats</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{bot.leads_captured}</span>
                        <span className="text-xs text-muted-foreground">leads</span>
                      </div>
                      <div className="ml-auto">
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">{bot.conversion_rate}%</span>
                      </div>
                    </div>

                    {/* Action */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group/btn"
                      onClick={() => navigate(`/chatbot/${bot.id}`)}
                    >
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;