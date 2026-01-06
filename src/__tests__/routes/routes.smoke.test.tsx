/**
 * Tests Smoke Routes
 * 
 * Vérifie que toutes les routes publiques se rendent sans crash
 * Phase 5 du plan anti-vibe-coding
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { SITEMAP } from '@/app/router/sitemap';
import React, { Suspense } from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: vi.fn() } } 
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
  },
}));

// Mock contexts
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn().mockReturnValue({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLanguage: vi.fn().mockReturnValue({
    language: 'fr',
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
}));

vi.mock('@/contexts/AudioContext', () => ({
  AudioProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAudio: vi.fn().mockReturnValue({
    isPlaying: false,
    play: vi.fn(),
    stop: vi.fn(),
  }),
}));

// Mock Leaflet (pour les pages carte)
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children?: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  useMap: vi.fn().mockReturnValue({ setView: vi.fn() }),
}));

vi.mock('leaflet', () => ({
  icon: vi.fn().mockReturnValue({}),
  Icon: { Default: { mergeOptions: vi.fn() } },
}));

// Wrapper de test avec providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Fonction utilitaire pour rendre une route
const renderRoute = (path: string, element: React.ReactElement) => {
  return render(
    <TestWrapper>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={path} element={element} />
        </Routes>
      </MemoryRouter>
    </TestWrapper>
  );
};

describe('Routes Smoke Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Home Page', () => {
    it('should render home page without crashing', async () => {
      const Home = (await import('@/pages/Home')).default;
      const { container } = renderRoute('/', <Home />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Auth Pages', () => {
    it('should render auth page without crashing', async () => {
      const AuthPage = (await import('@/features/auth/pages/AuthPage')).default;
      const { container } = renderRoute('/auth', <AuthPage />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Fallback Pages', () => {
    it('should render NotFound page without crashing', async () => {
      const NotFound = (await import('@/pages/NotFound')).default;
      const { container } = renderRoute('/404', <NotFound />);
      expect(container).toBeInTheDocument();
    });

    it('should render HealthPage without crashing', async () => {
      const HealthPage = (await import('@/pages/public/HealthPage')).default;
      const { container } = renderRoute('/health', <HealthPage />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Merchant Public Pages', () => {
    it('should render MerchantLogin without crashing', async () => {
      const MerchantLogin = (await import('@/features/merchant/pages/MerchantLogin')).default;
      const { container } = renderRoute('/marchand/connexion', <MerchantLogin />);
      expect(container).toBeInTheDocument();
    });

    it('should render MerchantVoiceRegister without crashing', async () => {
      const MerchantVoiceRegister = (await import('@/features/merchant/pages/MerchantVoiceRegister')).default;
      const { container } = renderRoute('/marchand/inscription-vocale', <MerchantVoiceRegister />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Agent Public Pages', () => {
    it('should render AgentLogin without crashing', async () => {
      const AgentLogin = (await import('@/features/agent/pages/AgentLogin')).default;
      const { container } = renderRoute('/agent/login', <AgentLogin />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Cooperative Public Pages', () => {
    it('should render CooperativeLogin without crashing', async () => {
      const CooperativeLogin = (await import('@/features/cooperative/pages/CooperativeLogin')).default;
      const { container } = renderRoute('/cooperative/login', <CooperativeLogin />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Admin Public Pages', () => {
    it('should render AdminLogin without crashing', async () => {
      const AdminLogin = (await import('@/features/admin/pages/AdminLogin')).default;
      const { container } = renderRoute('/admin/login', <AdminLogin />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Sitemap Validation', () => {
    it('should have valid public routes defined', () => {
      expect(SITEMAP.public.length).toBeGreaterThan(0);
      SITEMAP.public.forEach(route => {
        expect(route.path).toBeDefined();
        expect(route.name).toBeDefined();
        expect(route.requiresAuth).toBe(false);
      });
    });

    it('should have valid merchant routes defined', () => {
      expect(SITEMAP.merchant.length).toBeGreaterThan(0);
      SITEMAP.merchant.forEach(route => {
        expect(route.path).toMatch(/^\/marchand/);
        expect(route.requiresAuth).toBe(true);
        expect(route.roles).toContain('merchant');
      });
    });

    it('should have valid admin routes defined', () => {
      expect(SITEMAP.admin.length).toBeGreaterThan(0);
      SITEMAP.admin.forEach(route => {
        expect(route.path).toMatch(/^\/admin/);
        expect(route.requiresAuth).toBe(true);
        expect(route.roles).toContain('admin');
      });
    });

    it('should have valid agent routes defined', () => {
      expect(SITEMAP.agent.length).toBeGreaterThan(0);
      SITEMAP.agent.forEach(route => {
        expect(route.path).toMatch(/^\/agent/);
        expect(route.requiresAuth).toBe(true);
        expect(route.roles).toContain('agent');
      });
    });

    it('should have valid cooperative routes defined', () => {
      expect(SITEMAP.cooperative.length).toBeGreaterThan(0);
      SITEMAP.cooperative.forEach(route => {
        expect(route.path).toMatch(/^\/cooperative/);
        expect(route.requiresAuth).toBe(true);
        expect(route.roles).toContain('cooperative');
      });
    });

    it('should have valid producer routes defined', () => {
      expect(SITEMAP.producer.length).toBeGreaterThan(0);
      SITEMAP.producer.forEach(route => {
        expect(route.path).toMatch(/^\/producteur/);
        expect(route.requiresAuth).toBe(true);
        expect(route.roles).toContain('producer');
      });
    });
  });
});

describe('Route Utilities', () => {
  it('getAllRoutes should return all routes', async () => {
    const { getAllRoutes } = await import('@/app/router/sitemap');
    const routes = getAllRoutes();
    
    expect(routes.length).toBeGreaterThan(0);
    expect(routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ path: '/' }),
      expect.objectContaining({ path: '/marchand' }),
      expect.objectContaining({ path: '/admin' }),
    ]));
  });

  it('isValidRoute should validate existing routes', async () => {
    const { isValidRoute } = await import('@/app/router/sitemap');
    
    expect(isValidRoute('/')).toBe(true);
    expect(isValidRoute('/marchand')).toBe(true);
    expect(isValidRoute('/admin')).toBe(true);
    expect(isValidRoute('/nonexistent-route-xyz')).toBe(false);
  });

  it('getRoutesByRole should filter routes correctly', async () => {
    const { getRoutesByRole } = await import('@/app/router/sitemap');
    
    const merchantRoutes = getRoutesByRole('merchant');
    expect(merchantRoutes.length).toBeGreaterThan(0);
    merchantRoutes.forEach(route => {
      expect(route.roles).toContain('merchant');
    });

    const adminRoutes = getRoutesByRole('admin');
    expect(adminRoutes.length).toBeGreaterThan(0);
    adminRoutes.forEach(route => {
      expect(route.roles).toContain('admin');
    });
  });
});
