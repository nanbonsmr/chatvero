import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useChatbots } from "@/hooks/useChatbots";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  BarChart3,
  MessageCircle,
  Settings,
  Database,
  Plus,
  ChevronDown,
  LogOut,
  Bot,
  Menu,
  FileText,
} from "lucide-react";
import chatveroLogo from "@/assets/chatvero-logo.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { title: "Overview", path: "", icon: LayoutDashboard },
  { title: "Conversations", path: "/conversations", icon: MessageCircle },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Knowledge Base", path: "/knowledge", icon: Database },
  { title: "Documents", path: "/documents", icon: FileText },
  { title: "Settings", path: "/settings", icon: Settings },
];

function SidebarContents() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { data: chatbots = [], isLoading } = useChatbots();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  // Get current chatbot from URL
  const pathParts = location.pathname.split("/");
  const chatbotIndex = pathParts.indexOf("chatbot");
  const currentChatbotId = chatbotIndex !== -1 ? pathParts[chatbotIndex + 1] : null;
  const currentChatbot = chatbots.find(b => b.id === currentChatbotId);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (!currentChatbotId) return false;
    const basePath = `/chatbot/${currentChatbotId}`;
    if (path === "") return location.pathname === basePath || location.pathname === `${basePath}/`;
    return location.pathname.startsWith(`${basePath}${path}`);
  };

  return (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={chatveroLogo} alt="Chatvero" className="w-12 h-12 object-contain" />
          {!collapsed && (
            <span className="font-display font-bold text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Chatvero
            </span>
          )}
        </Link>
      </div>

      <SidebarContent className="flex-1">
        {/* Chatbot Selector */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-between bg-secondary/50 border-border/50 hover:bg-secondary ${collapsed ? "px-2" : ""}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                  {!collapsed && (
                    <span className="truncate">
                      {currentChatbot?.name || "Select Chatbot"}
                    </span>
                  )}
                </div>
                {!collapsed && <ChevronDown className="w-4 h-4 flex-shrink-0 opacity-50" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {isLoading ? (
                <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
              ) : chatbots.length === 0 ? (
                <DropdownMenuItem disabled>No chatbots yet</DropdownMenuItem>
              ) : (
                chatbots.map((bot) => (
                  <DropdownMenuItem
                    key={bot.id}
                    onClick={() => navigate(`/chatbot/${bot.id}`)}
                    className={currentChatbotId === bot.id ? "bg-primary/10" : ""}
                  >
                    <Bot className="w-4 h-4 mr-2" />
                    {bot.name}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/create-chatbot")}>
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        {currentChatbotId && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.path)}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link to={`/chatbot/${currentChatbotId}${item.path}`}>
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Quick Links */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Quick Links
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/dashboard"}
                  tooltip={collapsed ? "All Chatbots" : undefined}
                >
                  <Link to="/dashboard">
                    <MessageSquare className="w-4 h-4" />
                    {!collapsed && <span>All Chatbots</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/leads"}
                  tooltip={collapsed ? "All Leads" : undefined}
                >
                  <Link to="/leads">
                    <Users className="w-4 h-4" />
                    {!collapsed && <span>All Leads</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/analytics"}
                  tooltip={collapsed ? "Global Analytics" : undefined}
                >
                  <Link to="/analytics">
                    <BarChart3 className="w-4 h-4" />
                    {!collapsed && <span>Global Analytics</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Menu */}
      <div className="p-3 border-t border-border/50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 ${collapsed ? "px-2" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 text-left truncate">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border/50 bg-card/50 backdrop-blur-xl">
          <SidebarContents />
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="h-14 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center px-4 sticky top-0 z-10">
            <SidebarTrigger className="mr-4">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
