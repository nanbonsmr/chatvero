import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeads } from "@/hooks/useLeads";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Search,
  Download,
  Mail,
  Phone,
  User,
  Loader2,
  Users,
} from "lucide-react";

const ChatbotLeads = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allLeads = [], isLoading } = useLeads();
  
  // Filter leads for this chatbot
  const leads = useMemo(() => {
    return allLeads.filter(lead => lead.chatbot_id === chatbotId);
  }, [allLeads, chatbotId]);

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.email?.toLowerCase().includes(query) ||
      lead.name?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query)
    );
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Captured At"];
    const rows = filteredLeads.map((lead) => [
      lead.name || "",
      lead.email || "",
      lead.phone || "",
      format(new Date(lead.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${chatbotId}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Leads</h1>
            <p className="text-muted-foreground">Captured contact information</p>
          </div>
          <Button onClick={exportToCSV} disabled={filteredLeads.length === 0}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No leads yet</h3>
              <p className="text-muted-foreground">
                Leads will appear here when visitors share their contact info
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Captured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                          <User className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="font-medium">{lead.name || "—"}</span>
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
                    <TableCell className="text-muted-foreground">
                      {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotLeads;
