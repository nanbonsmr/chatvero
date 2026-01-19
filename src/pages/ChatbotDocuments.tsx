import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useDeleteDocument, useReprocessDocument } from "@/hooks/useDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Loader2,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  HardDrive,
} from "lucide-react";

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (fileType.includes("word") || fileType.includes("docx")) return <FileText className="w-5 h-5 text-blue-500" />;
  if (fileType.includes("sheet") || fileType.includes("xlsx") || fileType.includes("csv")) return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (fileType.includes("presentation") || fileType.includes("pptx")) return <FileImage className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Processed
        </Badge>
      );
    case "processing":
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Processing
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ChatbotDocuments = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const { data: chatbot } = useQuery({
    queryKey: ["chatbot", chatbotId],
    queryFn: async () => {
      if (!chatbotId) return null;
      const { data } = await supabase
        .from("chatbots")
        .select("name")
        .eq("id", chatbotId)
        .maybeSingle();
      return data;
    },
    enabled: !!chatbotId,
  });

  const { data: documents = [], isLoading } = useDocuments(chatbotId);
  const deleteDocument = useDeleteDocument();
  const reprocessDocument = useReprocessDocument();

  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return doc.file_name.toLowerCase().includes(query);
  });

  const handleDelete = async (documentId: string) => {
    if (!chatbotId) return;
    try {
      await deleteDocument.mutateAsync({ documentId, chatbotId });
      toast({
        title: "Deleted",
        description: "Document removed from knowledge base",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    }
  };

  const handleReprocess = async (documentId: string) => {
    if (!chatbotId) return;
    setProcessingIds((prev) => new Set(prev).add(documentId));

    try {
      await reprocessDocument.mutateAsync({ documentId, chatbotId });
      toast({
        title: "Reprocessing",
        description: "Document is being reprocessed",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to reprocess document",
        variant: "destructive",
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">
            {chatbot?.name || "Chatbot"} - Uploaded Documents
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Documents List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">
              {filteredDocuments.length} Document{filteredDocuments.length !== 1 ? "s" : ""} Uploaded
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No documents uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload documents when creating or editing your chatbot
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredDocuments.map((doc) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.file_name}</h3>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {getStatusBadge(doc.status)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(doc.file_size)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReprocess(doc.id)}
                        disabled={processingIds.has(doc.id) || doc.status === "processing"}
                        title="Reprocess document"
                      >
                        {processingIds.has(doc.id) || doc.status === "processing" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete document?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the document and all its parsed content from your
                              chatbot's knowledge base.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(doc.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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

export default ChatbotDocuments;
