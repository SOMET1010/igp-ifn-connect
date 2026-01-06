import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { AppShell } from "@/app/layouts";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { NetworkGuard } from "@/app/guards/NetworkGuard";
import { PreprodDebugPanel } from "@/shared/dev/PreprodDebugPanel";
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Routes centralisées
import {
  merchantPublicRoutes,
  merchantProtectedRoutes,
  agentPublicRoutes,
  agentProtectedRoutes,
  cooperativePublicRoutes,
  cooperativeProtectedRoutes,
  producerPublicRoutes,
  producerProtectedRoutes,
  adminPublicRoutes,
  adminProtectedRoutes,
} from "@/routes/index.ts";

// Pages publiques (auth depuis features)
const AuthPage = React.lazy(() => import("@/features/auth/pages/AuthPage"));
const AuthCallback = React.lazy(() => import("@/features/auth/pages/AuthCallback"));
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import MyAccount from "./pages/account/MyAccount";
import VivriersCooperativesPage from "./pages/public/VivriersCooperativesPage";
const PublicMapPage = React.lazy(() => import("./pages/public/PublicMapPage"));
import DemoAccess from "./pages/DemoAccess";

// Pages fallback PRÉ-PROD
import { OfflinePage, MaintenancePage, ErrorPage, HelpPage } from "./pages/fallback";
import HealthPage from "./pages/public/HealthPage";

// Loading fallback for lazy components
const LazyLoadingFallback = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
    <p className="text-muted-foreground">Chargement...</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Register Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
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
                  <NetworkGuard>
                    <AppShell>
                      <Suspense fallback={<LazyLoadingFallback />}>
                        <Routes>
                          {/* Routes publiques */}
                          <Route path="/" element={<Home />} />
                          <Route path="/auth" element={<AuthPage />} />
                          <Route path="/auth/callback" element={<AuthCallback />} />
                          <Route path="/demo" element={<DemoAccess />} />
                          <Route path="/compte" element={<MyAccount />} />
                          <Route path="/cooperatives" element={<VivriersCooperativesPage />} />
                          <Route path="/carte" element={<PublicMapPage />} />
                          <Route path="/accueil" element={<Navigate to="/" replace />} />

                          {/* Routes fallback PRÉ-PROD */}
                          <Route path="/offline" element={<OfflinePage />} />
                          <Route path="/maintenance" element={<MaintenancePage />} />
                          <Route path="/error" element={<ErrorPage />} />
                          <Route path="/aide" element={<HelpPage />} />
                          <Route path="/health" element={<HealthPage />} />

                          {/* Redirections pour routes alternatives */}
                          <Route path="/social-login" element={<Navigate to="/marchand/connexion" replace />} />
                          <Route path="/marchand/login" element={<Navigate to="/marchand/connexion" replace />} />
                          {/* Aliases historiques / anglais (éviter les 404) */}
                          <Route path="/marchand/voice" element={<Navigate to="/marchand/connexion" replace />} />
                          <Route path="/merchant" element={<Navigate to="/marchand/connexion" replace />} />
                          <Route path="/merchant/voice" element={<Navigate to="/marchand/connexion" replace />} />
                          <Route path="/cooperative/connexion" element={<Navigate to="/cooperative/login" replace />} />
                          <Route path="/agent/connexion" element={<Navigate to="/agent/login" replace />} />

                          {/* Routes Marchand */}
                          {merchantPublicRoutes}
                          {merchantProtectedRoutes}

                          {/* Routes Agent */}
                          {agentPublicRoutes}
                          {agentProtectedRoutes}

                          {/* Routes Coopérative */}
                          {cooperativePublicRoutes}
                          {cooperativeProtectedRoutes}

                          {/* Routes Producteur */}
                          {producerPublicRoutes}
                          {producerProtectedRoutes}

                          {/* Routes Admin */}
                          {adminPublicRoutes}
                          {adminProtectedRoutes}

                          {/* 404 - doit être en dernier */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </AppShell>
                  </NetworkGuard>
                  {/* Panel debug PRÉ-PROD */}
                  <PreprodDebugPanel />
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
