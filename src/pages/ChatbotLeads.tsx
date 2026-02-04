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
import { useLeads, useDeleteLead, useBulkDeleteLeads } from "@/hooks/useLeads";
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
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Lead } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";

const ChatbotLeads = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  
  const { toast } = useToast();
  const { data: allLeads = [], isLoading } = useLeads();
  const deleteLead = useDeleteLead();
  const bulkDeleteLeads = useBulkDeleteLeads();
  
  // Filter leads for this chatbot
  const leads = useMemo(() => {
    return allLeads.filter(lead => lead.chatbot_id === chatbotId);
  }, [allLeads, chatbotId]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        lead.email?.toLowerCase().includes(query) ||
        lead.name?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query)
      );
    });
  }, [leads, searchQuery]);

  const allSelected = filteredLeads.length > 0 && filteredLeads.every(lead => selectedLeadIds.has(lead.id));
  const someSelected = filteredLeads.some(lead => selectedLeadIds.has(lead.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  const toggleSelectLead = (leadId: string) => {
    const newSelected = new Set(selectedLeadIds);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeadIds(newSelected);
  };

  const handleBulkDelete = () => {
    bulkDeleteLeads.mutate(Array.from(selectedLeadIds), {
      onSuccess: () => {
        toast({
          title: "Leads deleted",
          description: `Successfully deleted ${selectedLeadIds.size} lead${selectedLeadIds.size !== 1 ? "s" : ""}.`,
        });
        setSelectedLeadIds(new Set());
        setShowBulkDeleteDialog(false);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete leads. Please try again.",
          variant: "destructive",
        });
        console.error("Bulk delete error:", error);
      },
    });
  };

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
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedLeadIds.size > 0 && (
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedLeadIds.size})
              </Button>
            )}
            <Button size="sm" onClick={exportToCSV} disabled={filteredLeads.length === 0} className="w-full sm:w-auto">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
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
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                      className={someSelected && !allSelected ? "opacity-50" : ""}
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                   <TableHead>Captured</TableHead>
                   <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className={selectedLeadIds.has(lead.id) ? "bg-muted/50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLeadIds.has(lead.id)}
                        onCheckedChange={() => toggleSelectLead(lead.id)}
                        aria-label={`Select ${lead.name || lead.email || "lead"}`}
                      />
                    </TableCell>
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLeadToDelete(lead)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

        <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Lead</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this lead
                {leadToDelete?.name ? ` (${leadToDelete.name})` : leadToDelete?.email ? ` (${leadToDelete.email})` : ""}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (leadToDelete) {
                    deleteLead.mutate(leadToDelete.id, {
                      onSuccess: () => {
                        toast({
                          title: "Lead deleted",
                          description: "The lead has been successfully deleted.",
                        });
                        setLeadToDelete(null);
                      },
                      onError: (error) => {
                        toast({
                          title: "Error",
                          description: "Failed to delete the lead. Please try again.",
                          variant: "destructive",
                        });
                        console.error("Delete error:", error);
                      },
                    });
                  }
                }}
              >
                {deleteLead.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {selectedLeadIds.size} Lead{selectedLeadIds.size !== 1 ? "s" : ""}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedLeadIds.size} selected lead{selectedLeadIds.size !== 1 ? "s" : ""}?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleBulkDelete}
              >
                {bulkDeleteLeads.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Delete ${selectedLeadIds.size} Lead${selectedLeadIds.size !== 1 ? "s" : ""}`
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ChatbotLeads;
