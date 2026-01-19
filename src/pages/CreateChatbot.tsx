import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateChatbot } from "@/hooks/useChatbots";

const tones = [
  { id: "professional", label: "Professional", description: "Formal and business-focused" },
  { id: "friendly", label: "Friendly", description: "Warm and conversational" },
  { id: "sales", label: "Sales-Focused", description: "Persuasive and action-oriented" },
];

const goals = [
  { id: "lead_generation", label: "Lead Generation", description: "Capture emails and contact info", icon: Users },
  { id: "sales", label: "Drive Sales", description: "Convert visitors to customers", icon: Target },
  { id: "support", label: "Customer Support", description: "Answer questions and help users", icon: HeadphonesIcon },
];

const CreateChatbot = () => {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [tone, setTone] = useState("friendly");
  const [goal, setGoal] = useState("lead_generation");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [botId, setBotId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const createChatbot = useCreateChatbot();

  const handleCrawl = async () => {
    if (!url) return;
    setIsProcessing(true);
    
    // Simulate crawling progress (real crawling would happen here)
    const progressSteps = [10, 25, 40, 60, 75, 90, 100];
    for (const p of progressSteps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(p);
    }

    // Auto-generate name from URL
    const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    setName(domain.charAt(0).toUpperCase() + domain.slice(1) + " Bot");
    
    setIsProcessing(false);
    setStep(2);
  };

  const handleCreate = async () => {
    setIsProcessing(true);
    
    try {
      const chatbot = await createChatbot.mutateAsync({
        name,
        website_url: url,
        tone,
        goal,
      });
      
      setBotId(chatbot.id);
      setStep(4);
      
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

  const copyEmbedCode = () => {
    const code = `<script src="https://embedai.dev/widget.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s < step
                    ? "gradient-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 h-1 mx-2 rounded-full transition-all ${
                    s < step ? "gradient-primary" : "bg-secondary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: URL Input */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3">
                Enter Your Website URL
              </h1>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                We'll crawl your website and train an AI chatbot on your content.
              </p>

              <div className="bg-card rounded-2xl border border-border p-8">
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="url">Website URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="h-14 text-lg"
                    />
                  </div>

                  {isProcessing ? (
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="font-medium">Crawling website...</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full gradient-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
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
            </motion.div>
          )}

          {/* Step 2: Configure */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-center">
                Configure Your Chatbot
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                Customize how your chatbot looks and behaves.
              </p>

              <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Chatbot Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Awesome Bot"
                    className="h-12"
                  />
                </div>

                {/* Tone */}
                <div className="space-y-3">
                  <Label>Conversation Tone</Label>
                  <div className="grid gap-3">
                    {tones.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTone(t.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          tone === t.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <p className="font-medium">{t.label}</p>
                        <p className="text-sm text-muted-foreground">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="lg"
                  className="w-full"
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold mb-3 text-center">
                Set Your Primary Goal
              </h1>
              <p className="text-muted-foreground mb-8 text-center">
                What do you want your chatbot to help you achieve?
              </p>

              <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                <div className="grid gap-4">
                  {goals.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`p-5 rounded-xl border text-left transition-all flex items-start gap-4 ${
                        goal === g.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        goal === g.id ? "gradient-primary" : "bg-secondary"
                      }`}>
                        <g.icon className={`w-6 h-6 ${
                          goal === g.id ? "text-primary-foreground" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{g.label}</p>
                        <p className="text-sm text-muted-foreground">{g.description}</p>
                      </div>
                    </button>
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

          {/* Step 4: Success */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-primary-foreground" />
              </motion.div>
              
              <h1 className="font-display text-3xl font-bold mb-3">
                Your Chatbot is Ready! 🎉
              </h1>
              <p className="text-muted-foreground mb-8">
                Copy the embed code below and add it to your website.
              </p>

              <div className="bg-card rounded-2xl border border-border p-8 space-y-6 text-left">
                <div>
                  <Label className="mb-2 block">Embed Code</Label>
                  <div className="bg-secondary rounded-xl p-4 font-mono text-sm break-all">
                    {`<script src="https://embedai.dev/widget.js" data-bot-id="${botId}"></script>`}
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

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3">Quick Start Guide:</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Copy the embed code above</li>
                    <li>2. Paste it before the closing &lt;/body&gt; tag on your website</li>
                    <li>3. Your chatbot will appear as a floating widget!</li>
                  </ol>
                </div>

                <Link to="/dashboard" className="block">
                  <Button variant="outline" size="lg" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreateChatbot;
