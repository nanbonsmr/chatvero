import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateChatbot from "./pages/CreateChatbot";
import ChatbotOverview from "./pages/ChatbotOverview";
import ChatbotSettings from "./pages/ChatbotSettings";
import ChatbotConversations from "./pages/ChatbotConversations";
import ChatbotLeads from "./pages/ChatbotLeads";
import ChatbotAnalytics from "./pages/ChatbotAnalytics";
import CrawledPages from "./pages/CrawledPages";
import ChatbotDocuments from "./pages/ChatbotDocuments";
import ChatbotWidgetTest from "./pages/ChatbotWidgetTest";
import Conversations from "./pages/Conversations";
import Analytics from "./pages/Analytics";
import Leads from "./pages/Leads";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/create-chatbot" element={<ProtectedRoute><CreateChatbot /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              {/* Chatbot-specific routes */}
              <Route path="/chatbot/:id" element={<ProtectedRoute><ChatbotOverview /></ProtectedRoute>} />
              <Route path="/chatbot/:id/settings" element={<ProtectedRoute><ChatbotSettings /></ProtectedRoute>} />
              <Route path="/chatbot/:id/conversations" element={<ProtectedRoute><ChatbotConversations /></ProtectedRoute>} />
              <Route path="/chatbot/:id/leads" element={<ProtectedRoute><ChatbotLeads /></ProtectedRoute>} />
              <Route path="/chatbot/:id/analytics" element={<ProtectedRoute><ChatbotAnalytics /></ProtectedRoute>} />
              <Route path="/chatbot/:id/knowledge" element={<ProtectedRoute><CrawledPages /></ProtectedRoute>} />
              <Route path="/chatbot/:id/documents" element={<ProtectedRoute><ChatbotDocuments /></ProtectedRoute>} />
              <Route path="/chatbot/:id/test" element={<ProtectedRoute><ChatbotWidgetTest /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
