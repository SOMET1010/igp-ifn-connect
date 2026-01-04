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
import ErrorBoundary from "@/components/shared/ErrorBoundary";
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
  adminPublicRoutes,
  adminProtectedRoutes,
} from "@/routes";

// Pages publiques
const AuthPage = React.lazy(() => import("./pages/auth/AuthPage"));
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import MyAccount from "./pages/account/MyAccount";
import DemoAccess from "./pages/DemoAccess";

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
                  <AppShell>
                    <Suspense fallback={<LazyLoadingFallback />}>
                      <Routes>
                        {/* Routes publiques */}
                        <Route path="/" element={<Home />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/demo" element={<DemoAccess />} />
                        <Route path="/compte" element={<MyAccount />} />
                        <Route path="/accueil" element={<Navigate to="/" replace />} />

                        {/* Routes Marchand */}
                        {merchantPublicRoutes}
                        {merchantProtectedRoutes}

                        {/* Routes Agent */}
                        {agentPublicRoutes}
                        {agentProtectedRoutes}

                        {/* Routes Coopérative */}
                        {cooperativePublicRoutes}
                        {cooperativeProtectedRoutes}

                        {/* Routes Admin */}
                        {adminPublicRoutes}
                        {adminProtectedRoutes}

                        {/* 404 - doit être en dernier */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AppShell>
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
