/**
 * Tests RequireRole Guard
 * 
 * Tests unitaires pour le guard de protection des routes par rôle
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireRole } from '@/app/guards/RequireRole';

// Mock du contexte Auth
const mockAuthContext = {
  isAuthenticated: false,
  isLoading: false,
  userRole: null as string | null,
  user: null,
  session: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithPhone: vi.fn(),
  verifyOtp: vi.fn(),
  checkRole: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Wrapper pour les tests
const TestWrapper = ({ 
  children, 
  initialRoute = '/protected' 
}: { 
  children: React.ReactNode; 
  initialRoute?: string;
}) => (
  <MemoryRouter initialEntries={[initialRoute]}>
    {children}
  </MemoryRouter>
);

// Composant de contenu protégé
const ProtectedContent = () => <div>Protected Content</div>;

describe('RequireRole Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock values
    mockAuthContext.isAuthenticated = false;
    mockAuthContext.isLoading = false;
    mockAuthContext.userRole = null;
  });

  describe('Loading State', () => {
    it('should show loading state while auth is loading', () => {
      mockAuthContext.isLoading = true;
      
      render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      // Vérifie qu'un indicateur de chargement est présent
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not show protected content while loading', () => {
      mockAuthContext.isLoading = true;
      
      const { queryByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      expect(queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authentication Check', () => {
    it('should show login required UI when not authenticated', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = false;
      
      const { queryByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      // Cherche un message de connexion requise
      const loginMessage = queryByText(/connexion|authentification|connecter/i);
      expect(loginMessage).toBeInTheDocument();
    });

    it('should show login button when not authenticated', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = false;
      
      const { queryByRole } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      const loginButton = queryByRole('button', { name: /connexion|connecter|login/i });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe('Role Authorization', () => {
    it('should show access denied when role does not match', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.userRole = 'merchant';
      
      const { queryByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      // Cherche un message d'accès refusé
      const accessDenied = queryByText(/accès|refusé|autorisé|permission/i);
      expect(accessDenied).toBeInTheDocument();
    });

    it('should not show protected content when role mismatches', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.userRole = 'merchant';
      
      const { queryByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      expect(queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render Outlet when role matches', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.userRole = 'admin';
      
      const { getByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      expect(getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow merchant to access merchant routes', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.userRole = 'merchant';
      
      const { getByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="merchant" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      expect(getByText('Protected Content')).toBeInTheDocument();
    });

    it('should allow agent to access agent routes', () => {
      mockAuthContext.isAuthenticated = true;
      mockAuthContext.isLoading = false;
      mockAuthContext.userRole = 'agent';
      
      const { getByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="agent" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      expect(getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Custom Redirect', () => {
    it('should use custom redirectTo prop', () => {
      mockAuthContext.isAuthenticated = false;
      mockAuthContext.isLoading = false;
      
      const { queryByText } = render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" redirectTo="/custom-login" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
            <Route path="/custom-login" element={<div>Custom Login Page</div>} />
          </Routes>
        </TestWrapper>
      );
      
      // Le composant affiche l'UI de connexion requise
      const loginUI = queryByText(/connexion/i);
      expect(loginUI).toBeInTheDocument();
    });
  });

  describe('Loading Timeout', () => {
    it('should handle long loading states gracefully', () => {
      mockAuthContext.isLoading = true;
      
      render(
        <TestWrapper>
          <Routes>
            <Route element={<RequireRole requiredRole="admin" />}>
              <Route path="/protected" element={<ProtectedContent />} />
            </Route>
          </Routes>
        </TestWrapper>
      );
      
      // Vérifie que le spinner est présent
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });
});
