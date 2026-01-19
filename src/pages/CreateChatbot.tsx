import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  ArrowLeft, 
  Globe, 
  Wand2, 
  Check,
  Loader2,
  Sparkles,
  Target,
  Users,
  HeadphonesIcon,
  Copy,
  FileText,
  Upload,
  X,
  File,
  Presentation,
  FileSpreadsheet,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateChatbot } from "@/hooks/useChatbots";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const tones = [
  { id: "professional", label: "Professional", description: "Formal and business-focused", icon: "💼" },
  { id: "friendly", label: "Friendly", description: "Warm and conversational", icon: "😊" },
  { id: "sales", label: "Sales-Focused", description: "Persuasive and action-oriented", icon: "🚀" },
];

const goals = [
  { id: "lead_generation", label: "Lead Generation", description: "Capture emails and contact info", icon: Users },
  { id: "sales", label: "Drive Sales", description: "Convert visitors to customers", icon: Target },
  { id: "support", label: "Customer Support", description: "Answer questions and help users", icon: HeadphonesIcon },
];

type SourceType = "website" | "documents" | null;

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
}

const ACCEPTED_TYPES = {
  "application/pdf": { icon: FileText, label: "PDF", color: "text-red-500" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, label: "DOCX", color: "text-blue-500" },
  "application/msword": { icon: FileText, label: "DOC", color: "text-blue-500" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: Presentation, label: "PPTX", color: "text-orange-500" },
  "application/vnd.ms-powerpoint": { icon: Presentation, label: "PPT", color: "text-orange-500" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: FileSpreadsheet, label: "XLSX", color: "text-green-500" },
  "application/vnd.ms-excel": { icon: FileSpreadsheet, label: "XLS", color: "text-green-500" },
  "text/plain": { icon: FileText, label: "TXT", color: "text-muted-foreground" },
};

const CreateChatbot = () => {
  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tone, setTone] = useState("friendly");
  const [goal, setGoal] = useState("lead_generation");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [botId, setBotId] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createChatbot = useCreateChatbot();

  const handleSourceSelect = (source: SourceType) => {
    setSourceType(source);
    setStep(2);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = Object.keys(ACCEPTED_TYPES).includes(file.type);
      const isValidSize = file.size <= 20 * 1024 * 1024; // 20MB max
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive",
        });
      }
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive",
        });
      }
      return isValidType && isValidSize;
    });

    const newFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      id: crypto.randomUUID(),
      progress: 0,
      status: "pending" as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    const config = ACCEPTED_TYPES[type as keyof typeof ACCEPTED_TYPES];
    if (config) {
      const Icon = config.icon;
      return <Icon className={`w-5 h-5 ${config.color}`} />;
    }
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCrawl = async () => {
    if (!url) return;
    setIsProcessing(true);
    
    const progressSteps = [10, 25, 40, 60, 75, 90, 100];
    for (const p of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(p);
    }

    const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    setName(domain.charAt(0).toUpperCase() + domain.slice(1) + " Bot");
    
    setIsProcessing(false);
    setStep(3);
  };

  const handleDocumentsNext = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files uploaded",
        description: "Please upload at least one document",
        variant: "destructive",
      });
      return;
    }
    setName("Knowledge Bot");
    setStep(3);
  };

  const handleCreate = async () => {
    setIsProcessing(true);
    
    try {
      const chatbot = await createChatbot.mutateAsync({
        name,
        website_url: sourceType === "website" ? url : "documents://uploaded",
        tone,
        goal,
      });

      // If documents source, upload files to storage
      if (sourceType === "documents" && uploadedFiles.length > 0 && user) {
        for (const uploadFile of uploadedFiles) {
          const filePath = `${user.id}/${chatbot.id}/${uploadFile.id}-${uploadFile.file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from("chatbot-documents")
            .upload(filePath, uploadFile.file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          // Save document record
          await supabase.from("chatbot_documents").insert({
            chatbot_id: chatbot.id,
            file_name: uploadFile.file.name,
            file_path: filePath,
            file_type: uploadFile.file.type,
            file_size: uploadFile.file.size,
            status: "pending",
          });
        }
      }
      
      setBotId(chatbot.id);
      setStep(5);
      
      toast({
        title: "Chatbot created! 🎉",
        description: "Your AI chatbot is ready to go live.",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create chatbot";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmbedCode = () => {
    return `<script src="https://czhltxnpaukjqmtgrgzc.supabase.co/functions/v1/widget?bot=${botId}"></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-8 sm:py-12 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: s === step ? 1.1 : 1,
                }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  s < step
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : s === step
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-secondary/80 text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
              </motion.div>
              {s < 5 && (
                <div
                  className={`w-8 sm:w-12 lg:w-16 h-1 mx-1 sm:mx-2 rounded-full transition-all ${
                    s < step ? "gradient-primary" : "bg-secondary/80"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Source Type */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
              >
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                How would you like to train your AI?
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Choose your knowledge source to create a powerful, customized chatbot.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Website Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSourceSelect("website")}
                  className="group relative bg-card rounded-2xl border border-border/50 p-6 text-left transition-all hover:border-primary/50 hover:shadow-elevated overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                      <Globe className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">Website URL</h3>
                    <p className="text-sm text-muted-foreground">
                      Crawl your website and train your bot on all your pages automatically.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Auto-crawl</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">Real-time sync</span>
                    </div>
                  </div>
                </motion.button>

                {/* Documents Option */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSourceSelect("documents")}
                  className="group relative bg-card rounded-2xl border border-border/50 p-6 text-left transition-all hover:border-accent/50 hover:shadow-elevated overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow">
                      <FileText className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2">Upload Documents</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload PDFs, Word docs, PowerPoints, and more to train your bot.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">PDF</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">DOCX</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">PPTX</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">+more</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Website URL or Document Upload */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              {sourceType === "website" ? (
                <>
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                    <Globe className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                    Enter Your Website URL
                  </h1>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    We'll crawl your website and train an AI chatbot on your content.
                  </p>

                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 shadow-card">
                    <div className="space-y-4">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="url">Website URL</Label>
                        <Input
                          id="url"
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="h-14 text-lg bg-background/50"
                        />
                      </div>

                      {isProcessing ? (
                        <div className="space-y-4 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="font-medium">Analyzing website...</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-sm text-muted-foreground">
                            {progress < 40 && "Discovering pages..."}
                            {progress >= 40 && progress < 70 && "Extracting content..."}
                            {progress >= 70 && progress < 100 && "Preparing AI training data..."}
                            {progress >= 100 && "Complete!"}
                          </p>
                        </div>
                      ) : (
                        <Button
                          variant="hero"
                          size="lg"
                          className="w-full"
                          onClick={handleCrawl}
                          disabled={!url}
                        >
                          <Wand2 className="w-5 h-5" />
                          Analyze Website
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Upload className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                    Upload Your Documents
                  </h1>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Drag and drop or browse to upload your knowledge base files.
                  </p>

                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 shadow-card">
                    {/* Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                        isDragging 
                          ? "border-primary bg-primary/5 scale-[1.02]" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="text-center pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-1">
                          {isDragging ? "Drop files here" : "Drag & drop files here"}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          or click to browse
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400">PDF</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">DOCX</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">PPTX</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">XLSX</span>
                          <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">TXT</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Max 20MB per file
                        </p>
                      </div>
                    </div>

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">
                            Uploaded Files ({uploadedFiles.length})
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFiles([])}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            Clear all
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {uploadedFiles.map((uploadFile) => (
                            <motion.div
                              key={uploadFile.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 group"
                            >
                              {getFileIcon(uploadFile.file.type)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(uploadFile.file.size)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFile(uploadFile.id)}
                                className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full mt-6"
                      onClick={handleDocumentsNext}
                      disabled={uploadedFiles.length === 0}
                    >
                      <Sparkles className="w-5 h-5" />
                      Continue with {uploadedFiles.length} file{uploadedFiles.length !== 1 ? "s" : ""}
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => {
                  setStep(1);
                  setSourceType(null);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Choose different source
              </Button>
            </motion.div>
          )}

          {/* Step 3: Configure */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3 text-center">
                Configure Your Chatbot
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                Customize how your chatbot looks and behaves.
              </p>

              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 space-y-6 shadow-card">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Chatbot Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Bot"
                    className="h-12 bg-background/50"
                  />
                </div>

                {/* Tone */}
                <div className="space-y-3">
                  <Label>Conversation Tone</Label>
                  <div className="grid gap-3">
                    {tones.map((t) => (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setTone(t.id)}
                        className={`p-4 rounded-xl border text-left transition-all flex items-center gap-4 ${
                          tone === t.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/30 bg-background/30"
                        }`}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <p className="font-medium">{t.label}</p>
                          <p className="text-sm text-muted-foreground">{t.description}</p>
                        </div>
                        {tone === t.id && (
                          <Check className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(4)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Goal */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3 text-center">
                Set Your Primary Goal
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                What do you want your chatbot to help you achieve?
              </p>

              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 space-y-6 shadow-card">
                <div className="grid gap-4">
                  {goals.map((g) => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setGoal(g.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                        goal === g.id
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/30 bg-background/30"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        goal === g.id ? "gradient-primary shadow-lg" : "bg-secondary"
                      }`}>
                        <g.icon className={`w-6 h-6 ${
                          goal === g.id ? "text-primary-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{g.label}</p>
                        <p className="text-sm text-muted-foreground">{g.description}</p>
                      </div>
                      {goal === g.id && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      )}
                    </motion.button>
                  ))}
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={handleCreate}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Chatbot...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Create Chatbot
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
              >
                <Check className="w-12 h-12 text-primary-foreground" />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h1 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                  Your Chatbot is Ready! 🎉
                </h1>
                <p className="text-muted-foreground mb-8">
                  Copy the embed code below and add it to your website.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 sm:p-8 space-y-6 text-left shadow-card"
              >
                <div>
                  <Label className="mb-2 block">Embed Code</Label>
                  <div className="bg-secondary/50 rounded-xl p-4 font-mono text-sm break-all border border-border/50">
                    {getEmbedCode()}
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={copyEmbedCode}
                >
                  <Copy className="w-5 h-5" />
                  Copy Embed Code
                </Button>

                <div className="pt-4 border-t border-border/50">
                  <h3 className="font-semibold mb-3">Quick Start Guide:</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      Copy the embed code above
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      Paste it before the closing &lt;/body&gt; tag on your website
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      Your chatbot will appear as a floating widget!
                    </li>
                  </ol>
                </div>

                <Link to="/dashboard" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreateChatbot;