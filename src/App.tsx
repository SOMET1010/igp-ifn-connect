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
import MerchantCredits from "./pages/merchant/MerchantCredits";
import MerchantScanner from "./pages/merchant/MerchantScanner";
import MerchantPromotions from "./pages/merchant/MerchantPromotions";
import MerchantSuppliers from "./pages/merchant/MerchantSuppliers";

// Cooperative pages
import CooperativeLogin from "./pages/cooperative/CooperativeLogin";
import CooperativeDashboard from "./pages/cooperative/CooperativeDashboard";
import CooperativeStock from "./pages/cooperative/CooperativeStock";
import CooperativeOrders from "./pages/cooperative/CooperativeOrders";
import CooperativeProfile from "./pages/cooperative/CooperativeProfile";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMerchants from "./pages/admin/AdminMerchants";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminCooperatives from "./pages/admin/AdminCooperatives";
import AdminMap from "./pages/admin/AdminMap";
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";

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
              <Route path="/marchand/credits" element={<MerchantCredits />} />
              <Route path="/marchand/scanner" element={<MerchantScanner />} />
              <Route path="/marchand/promotions" element={<MerchantPromotions />} />
              <Route path="/marchand/fournisseurs" element={<MerchantSuppliers />} />
            </Route>

            {/* Cooperative Routes */}
            <Route path="/cooperative/login" element={<CooperativeLogin />} />
            <Route element={<ProtectedRoute requiredRole="cooperative" redirectTo="/cooperative/login" />}>
              <Route path="/cooperative" element={<CooperativeDashboard />} />
              <Route path="/cooperative/stock" element={<CooperativeStock />} />
              <Route path="/cooperative/commandes" element={<CooperativeOrders />} />
              <Route path="/cooperative/profil" element={<CooperativeProfile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute requiredRole="admin" redirectTo="/admin/login" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/marchands" element={<AdminMerchants />} />
              <Route path="/admin/agents" element={<AdminAgents />} />
              <Route path="/admin/cooperatives" element={<AdminCooperatives />} />
              <Route path="/admin/carte" element={<AdminMap />} />
              <Route path="/admin/monitoring" element={<AdminMonitoring />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/rapports" element={<AdminReports />} />
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
