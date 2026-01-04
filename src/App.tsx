import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioProvider } from "@/contexts/AudioContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { OfflineIndicator } from "@/components/shared/OfflineIndicator";
import { AudioPlayingIndicator } from "@/components/shared/AudioPlayingIndicator";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load heavy components
const AdminMap = React.lazy(() => import("./pages/admin/AdminMap"));
const AuthPage = React.lazy(() => import("./pages/auth/AuthPage"));

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import MyAccount from "./pages/account/MyAccount";
import DemoAccess from "./pages/DemoAccess";

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
import MerchantMoney from "./pages/merchant/MerchantMoney";
import MerchantHelp from "./pages/merchant/MerchantHelp";
import MerchantUnderstand from "./pages/merchant/MerchantUnderstand";
import MerchantInvoices from "./pages/merchant/MerchantInvoices";
import MerchantWallet from "./pages/merchant/MerchantWallet";
import MerchantVoiceRegister from "./pages/merchant/MerchantVoiceRegister";
import MerchantKyc from "./pages/merchant/MerchantKyc";
import MerchantVoiceEntry from "./pages/merchant/MerchantVoiceEntry";
import MerchantSecurityFallback from "./pages/merchant/MerchantSecurityFallback";
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
import AdminAgentRequests from "./pages/admin/AdminAgentRequests";
import AdminCooperatives from "./pages/admin/AdminCooperatives";
// AdminMap is lazy loaded above
import AdminMonitoring from "./pages/admin/AdminMonitoring";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";
import AdminStudio from "./pages/admin/AdminStudio";
import AdminVivriers from "./pages/admin/AdminVivriers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminKycReview from "./pages/admin/AdminKycReview";

// Loading fallback for lazy components
const LazyLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

// Register Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // SW registered successfully - no logging in production
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available - handled silently
              }
            });
          }
        });
      } catch {
        // SW registration failed - handled silently
      }
    });
  }
}

// Call SW registration
registerServiceWorker();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <AudioProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <DemoBanner />
                <OfflineIndicator />
                <AudioPlayingIndicator />
              <Suspense fallback={<LazyLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/demo" element={<DemoAccess />} />
                  <Route path="/compte" element={<MyAccount />} />
                  <Route path="/accueil" element={<Navigate to="/" replace />} />
                  
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
                  <Route path="/marchand/connexion" element={<MerchantVoiceEntry />} />
                  <Route path="/marchand/securite" element={<MerchantSecurityFallback />} />
                  <Route path="/marchand/inscription-vocale" element={<MerchantVoiceRegister />} />
                  <Route element={<ProtectedRoute requiredRole="merchant" redirectTo="/marchand/login" />}>
                    <Route path="/marchand" element={<MerchantDashboard />} />
                    <Route path="/marchand/encaisser" element={<MerchantCashier />} />
                    <Route path="/marchand/historique" element={<MerchantTransactions />} />
                    <Route path="/marchand/argent" element={<MerchantMoney />} />
                    <Route path="/marchand/aide" element={<MerchantHelp />} />
                    <Route path="/marchand/profil" element={<MerchantProfile />} />
                    <Route path="/marchand/stock" element={<MerchantStock />} />
                    <Route path="/marchand/cmu" element={<MerchantCMU />} />
                    <Route path="/marchand/credits" element={<MerchantCredits />} />
                    <Route path="/marchand/scanner" element={<MerchantScanner />} />
                    <Route path="/marchand/promotions" element={<MerchantPromotions />} />
                    <Route path="/marchand/fournisseurs" element={<MerchantSuppliers />} />
                    <Route path="/marchand/comprendre" element={<MerchantUnderstand />} />
                    <Route path="/marchand/factures" element={<MerchantInvoices />} />
                    <Route path="/marchand/wallet" element={<MerchantWallet />} />
                    <Route path="/marchand/kyc" element={<MerchantKyc />} />
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
                    <Route path="/admin/demandes-agents" element={<AdminAgentRequests />} />
                    <Route path="/admin/cooperatives" element={<AdminCooperatives />} />
                    <Route path="/admin/carte" element={<AdminMap />} />
                    <Route path="/admin/monitoring" element={<AdminMonitoring />} />
                    <Route path="/admin/analytics" element={<AdminAnalytics />} />
                    <Route path="/admin/rapports" element={<AdminReports />} />
                    <Route path="/admin/studio" element={<AdminStudio />} />
                    <Route path="/admin/vivriers" element={<AdminVivriers />} />
                    <Route path="/admin/utilisateurs" element={<AdminUsers />} />
                    <Route path="/admin/utilisateurs/:userId" element={<AdminUserDetail />} />
                    <Route path="/admin/kyc" element={<AdminKycReview />} />
                  </Route>
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </AudioProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;
