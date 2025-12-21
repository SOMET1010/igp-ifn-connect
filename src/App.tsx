import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Agent pages
import AgentLogin from "./pages/agent/AgentLogin";
import AgentDashboard from "./pages/agent/AgentDashboard";
import MerchantList from "./pages/agent/MerchantList";
import AgentProfile from "./pages/agent/AgentProfile";
import EnrollmentWizard from "./pages/agent/EnrollmentWizard";

// Merchant pages
import MerchantLogin from "./pages/merchant/MerchantLogin";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import MerchantCashier from "./pages/merchant/MerchantCashier";
import MerchantCMU from "./pages/merchant/MerchantCMU";
import MerchantProfile from "./pages/merchant/MerchantProfile";
import MerchantTransactions from "./pages/merchant/MerchantTransactions";
import MerchantStock from "./pages/merchant/MerchantStock";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/accueil" element={<Index />} />
            
            {/* Agent Routes */}
            <Route path="/agent/login" element={<AgentLogin />} />
            <Route element={<ProtectedRoute requiredRole="agent" redirectTo="/agent/login" />}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/enrolement" element={<EnrollmentWizard />} />
              <Route path="/agent/marchands" element={<MerchantList />} />
              <Route path="/agent/profil" element={<AgentProfile />} />
            </Route>
            
            {/* Merchant Routes */}
            <Route path="/marchand/login" element={<MerchantLogin />} />
            <Route element={<ProtectedRoute requiredRole="merchant" redirectTo="/marchand/login" />}>
              <Route path="/marchand" element={<MerchantDashboard />} />
              <Route path="/marchand/encaisser" element={<MerchantCashier />} />
              <Route path="/marchand/historique" element={<MerchantTransactions />} />
              <Route path="/marchand/stock" element={<MerchantStock />} />
              <Route path="/marchand/cmu" element={<MerchantCMU />} />
              <Route path="/marchand/profil" element={<MerchantProfile />} />
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
