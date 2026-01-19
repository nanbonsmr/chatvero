import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Plus, 
  BarChart3, 
  Users, 
  MessageCircle,
  Settings,
  LogOut,
  ExternalLink,
  Copy,
  MoreVertical,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for demonstration
const mockChatbots = [
  {
    id: "1",
    name: "Main Website Bot",
    url: "https://example.com",
    status: "active",
    totalChats: 1247,
    leadsCaptures: 89,
    conversionRate: 7.1,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Support Bot",
    url: "https://help.example.com",
    status: "active",
    totalChats: 523,
    leadsCaptures: 34,
    conversionRate: 6.5,
    createdAt: "2024-02-01",
  },
];

const Dashboard = () => {
  const [chatbots] = useState(mockChatbots);
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const copyEmbedCode = (botId: string) => {
    const code = `<script src="https://embedai.dev/widget.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  const stats = [
    { label: "Total Chatbots", value: chatbots.length, icon: MessageSquare, change: "+2 this month" },
    { label: "Total Chats", value: "1,770", icon: MessageCircle, change: "+12.5% vs last month" },
    { label: "Leads Captured", value: "123", icon: Users, change: "+23% vs last month" },
    { label: "Avg. Conversion", value: "6.8%", icon: TrendingUp, change: "+0.5% vs last month" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">EmbedAI</span>
        </div>

        <nav className="space-y-2">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Chatbots
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Users className="w-5 h-5" />
            Leads
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="mb-4 px-4 py-2 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Manage your chatbots and track performance</p>
          </div>
          <Link to="/create-chatbot">
            <Button variant="hero">
              <Plus className="w-5 h-5" />
              Create Chatbot
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-xs text-green-500 mt-2">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Chatbots List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="font-display text-xl font-semibold">Your Chatbots</h2>
          </div>

          {chatbots.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No chatbots yet</h3>
              <p className="text-muted-foreground mb-6">Create your first AI chatbot to get started</p>
              <Link to="/create-chatbot">
                <Button variant="hero">
                  <Plus className="w-5 h-5" />
                  Create Chatbot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {chatbots.map((bot) => (
                <motion.div
                  key={bot.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Bot Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{bot.name}</h3>
                          <a
                            href={bot.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                          >
                            {bot.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="font-semibold">{bot.totalChats.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Chats</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold">{bot.leadsCaptures}</p>
                        <p className="text-xs text-muted-foreground">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-500">{bot.conversionRate}%</p>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyEmbedCode(bot.id)}
                      >
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                          <DropdownMenuItem>View Analytics</DropdownMenuItem>
                          <DropdownMenuItem>Chat History</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
