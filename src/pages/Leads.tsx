import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageSquare,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Search,
  Download,
  Calendar,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useChatbots } from "@/hooks/useChatbots";
import { format } from "date-fns";

const Leads = () => {
  const [search, setSearch] = useState("");
  const [chatbotFilter, setChatbotFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { toast } = useToast();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { data: chatbots = [] } = useChatbots();
  
  const { data: leads = [], isLoading } = useLeads({
    search,
    chatbotId: chatbotFilter === "all" ? undefined : chatbotFilter,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const exportToCSV = () => {
    if (leads.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no leads matching your filters.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Name", "Email", "Phone", "Chatbot", "Captured At"];
    const rows = leads.map((lead) => [
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      lead.chatbot_name || "",
      format(new Date(lead.created_at), "yyyy-MM-dd HH:mm:ss"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: `Exported ${leads.length} leads to CSV.`,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setChatbotFilter("all");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
        <Link to="/dashboard" className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">EmbedAI</span>
        </Link>

        <nav className="space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-secondary transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Chatbots
          </Link>
          <Link
            to="/leads"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium"
          >
            <Users className="w-5 h-5" />
            Leads
          </Link>
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
            <h1 className="font-display text-3xl font-bold mb-1">Leads</h1>
            <p className="text-muted-foreground">
              Manage and export your captured leads
            </p>
          </div>
          <Button variant="hero" onClick={exportToCSV}>
            <Download className="w-5 h-5" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Chatbot Filter */}
            <Select value={chatbotFilter} onValueChange={setChatbotFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Chatbots" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chatbots</SelectItem>
                {chatbots.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id}>
                    {bot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Start Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
                placeholder="Start date"
              />
            </div>

            {/* End Date */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
                placeholder="End date"
              />
            </div>
          </div>

          {(search || chatbotFilter !== "all" || startDate || endDate) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {leads.length} lead{leads.length !== 1 ? "s" : ""} found
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Leads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground mt-4">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No leads yet</h3>
              <p className="text-muted-foreground">
                Leads will appear here when visitors share their contact info
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Chatbot</TableHead>
                    <TableHead>Captured</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium">
                            {lead.name || "Anonymous"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.phone ? (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-2 text-primary hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm">
                          <MessageSquare className="w-3 h-3" />
                          {lead.chatbot_name}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(lead.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Leads;
