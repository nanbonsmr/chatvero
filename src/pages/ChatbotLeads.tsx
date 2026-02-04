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
  Eye,
  Linkedin,
  Building2,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lead } from "@/hooks/useLeads";

const ChatbotLeads = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-xl sm:text-2xl font-bold">Leads</h1>
            <p className="text-muted-foreground text-sm">Captured contact information</p>
          </div>
          <Button size="sm" onClick={exportToCSV} disabled={filteredLeads.length === 0} className="w-full sm:w-auto">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl sm:rounded-2xl border border-border/50 bg-card overflow-hidden"
        >
          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
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
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                   <TableHead>Captured</TableHead>
                   <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{lead.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{lead.company_name || "—"}</span>
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
                      <Badge variant={
                        lead.enrichment_status === 'completed' ? 'default' : 
                        lead.enrichment_status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {lead.enrichment_status || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                       {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>

        <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                {selectedLead?.name || "Lead Details"}
              </DialogTitle>
              <DialogDescription>
                Detailed information captured and enriched for this lead
              </DialogDescription>
            </DialogHeader>

            {selectedLead && (
              <div className="space-y-6 py-4">
                {/* Core Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Email</span>
                        <span className="font-medium">{selectedLead.email || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Phone</span>
                        <span className="font-medium">{selectedLead.phone || "—"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Company</span>
                        <span className="font-medium">{selectedLead.company_name || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs">Captured On</span>
                        <span className="font-medium">
                          {format(new Date(selectedLead.created_at), "PPP p")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social/Status */}
                <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status:</span>
                    <Badge variant={
                      selectedLead.enrichment_status === 'completed' ? 'default' : 
                      selectedLead.enrichment_status === 'failed' ? 'destructive' : 'secondary'
                    }>
                      {selectedLead.enrichment_status || 'pending'}
                    </Badge>
                  </div>
                  {selectedLead.linkedin_url && (
                    <a
                      href={selectedLead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-medium text-primary hover:underline ml-auto"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>

                {/* Enriched Data Visualization */}
                {selectedLead.enriched_data && Object.keys(selectedLead.enriched_data).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">Enriched Insights</Badge>
                    </h4>
                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-4 overflow-hidden">
                       <pre className="text-xs overflow-x-auto p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                        {JSON.stringify(selectedLead.enriched_data, null, 2)}
                       </pre>
                    </div>
                  </div>
                )}
                
                {selectedLead.custom_data && Object.keys(selectedLead.custom_data).length > 0 && (
                   <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Custom Data</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedLead.custom_data).map(([key, value]) => (
                        <div key={key} className="p-2 rounded-lg bg-muted/30 border border-border/50 text-xs">
                          <span className="text-muted-foreground block mb-1 uppercase tracking-tighter text-[10px]">{key}</span>
                          <span className="font-medium break-all">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotLeads;
