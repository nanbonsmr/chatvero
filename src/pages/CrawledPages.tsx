import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCrawledPages, useDeleteCrawledPage, useRecrawlPage } from "@/hooks/useCrawledPages";
import { useCrawlWebsite } from "@/hooks/useCrawlWebsite";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Globe,
  Loader2,
  Search,
  Trash2,
  RefreshCw,
  FileText,
  ExternalLink,
  Plus,
  Eye,
  Calendar,
} from "lucide-react";

const CrawledPages = () => {
  const { id: chatbotId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [previewPage, setPreviewPage] = useState<{ title: string; content: string; url: string } | null>(null);
  const [recrawlingUrls, setRecrawlingUrls] = useState<Set<string>>(new Set());

  const { data: chatbot } = useQuery({
    queryKey: ["chatbot", chatbotId],
    queryFn: async () => {
      if (!chatbotId) return null;
      const { data } = await supabase
        .from("chatbots")
        .select("name, website_url")
        .eq("id", chatbotId)
        .maybeSingle();
      return data;
    },
    enabled: !!chatbotId,
  });

  const { data: pages = [], isLoading } = useCrawledPages(chatbotId);
  const deletePage = useDeleteCrawledPage();
  const recrawlPage = useRecrawlPage();
  const { crawl, isLoading: isCrawlingNew } = useCrawlWebsite();

  const filteredPages = pages.filter((page) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      page.url.toLowerCase().includes(query) ||
      page.title?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (pageId: string) => {
    if (!chatbotId) return;
    try {
      await deletePage.mutateAsync({ pageId, chatbotId });
      toast({
        title: "Deleted",
        description: "Page removed from knowledge base",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const handleRecrawl = async (url: string) => {
    if (!chatbotId) return;
    setRecrawlingUrls((prev) => new Set(prev).add(url));
    
    try {
      await recrawlPage.mutateAsync({ chatbotId, url });
      toast({
        title: "Recrawled",
        description: "Page content has been updated",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to recrawl page",
        variant: "destructive",
      });
    } finally {
      setRecrawlingUrls((prev) => {
        const next = new Set(prev);
        next.delete(url);
        return next;
      });
    }
  };

  const handleAddPage = async () => {
    if (!chatbotId || !newUrl.trim()) return;
    
    try {
      new URL(newUrl); // Validate URL
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    const result = await crawl(chatbotId, newUrl.trim(), 1);
    
    if (result && result.pages_saved > 0) {
      toast({
        title: "Page added",
        description: "New page has been crawled and added",
      });
      setNewUrl("");
    } else {
      toast({
        title: "Failed",
        description: "Could not crawl the page",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={`/chatbot/${chatbotId}/settings`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">{chatbot?.name || "Chatbot"} - Crawled Pages</p>
          </div>
        </div>

        {/* Add New Page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Page
          </h2>
          <div className="flex gap-3">
            <Input
              placeholder="https://example.com/page"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddPage} disabled={isCrawlingNew || !newUrl.trim()}>
              {isCrawlingNew ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              Crawl Page
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pages List */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">
              {filteredPages.length} Page{filteredPages.length !== 1 ? "s" : ""} Indexed
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No pages crawled</h3>
              <p className="text-muted-foreground mb-4">
                Add a URL above to start building your chatbot's knowledge base
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredPages.map((page) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {page.title || "Untitled Page"}
                      </h3>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 truncate"
                      >
                        {page.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(page.crawled_at), { addSuffix: true })}
                        </span>
                        <span>
                          {page.content.length.toLocaleString()} characters
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewPage({ 
                          title: page.title || "Untitled", 
                          content: page.content,
                          url: page.url 
                        })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRecrawl(page.url)}
                        disabled={recrawlingUrls.has(page.url)}
                      >
                        {recrawlingUrls.has(page.url) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete page?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the page from your chatbot's knowledge base.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(page.id)}
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

      {/* Content Preview Dialog */}
      <Dialog open={!!previewPage} onOpenChange={() => setPreviewPage(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewPage?.title}</DialogTitle>
            <a
              href={previewPage?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              {previewPage?.url}
              <ExternalLink className="w-3 h-3" />
            </a>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4">
            <div className="text-sm whitespace-pre-wrap text-muted-foreground">
              {previewPage?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrawledPages;
