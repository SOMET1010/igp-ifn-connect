import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Agent pages
import AgentLogin from "./pages/agent/AgentLogin";
import AgentDashboard from "./pages/agent/AgentDashboard";
import MerchantList from "./pages/agent/MerchantList";
import AgentProfile from "./pages/agent/AgentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Agent Routes */}
            <Route path="/agent/login" element={<AgentLogin />} />
            <Route element={<ProtectedRoute requiredRole="agent" redirectTo="/agent/login" />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/marchands" element={<MerchantList />} />
              <Route path="/agent/profil" element={<AgentProfile />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
