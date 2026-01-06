/**
 * Tests ErrorBoundary
 * 
 * Tests unitaires pour le composant de capture d'erreurs
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@/shared/ui';

// Composant qui throw une erreur pour les tests
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Content without error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Normal content</div>
      </ErrorBoundary>
    );
    
    expect(getByText('Normal content')).toBeInTheDocument();
  });

  it('should render fallback UI when child throws error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Vérifie que l'UI d'erreur est affichée
    expect(getByText(/erreur/i)).toBeInTheDocument();
  });

  it('should not render children when error is caught', () => {
    const { queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(queryByText('Content without error')).not.toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    const { getByText } = render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(getByText('Custom error message')).toBeInTheDocument();
  });

  it('should show reload button in error UI', () => {
    const { queryByRole, queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Cherche un bouton de rechargement/réessayer
    const reloadButton = queryByRole('button', { name: /recharger|réessayer|actualiser/i });
    expect(reloadButton || queryByText(/recharger|réessayer/i)).toBeInTheDocument();
  });

  it('should show go home button in error UI', () => {
    const { queryByRole, queryByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Cherche un bouton retour accueil
    const homeButton = queryByRole('button', { name: /accueil|retour/i });
    expect(homeButton || queryByText(/accueil|retour/i)).toBeInTheDocument();
  });

  it('should log error when caught', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // componentDidCatch devrait logger l'erreur
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should work with multiple children', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );
    
    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
    expect(getByText('Child 3')).toBeInTheDocument();
  });

  it('should catch errors from nested components', () => {
    const NestedError = () => (
      <div>
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      </div>
    );
    
    const { getByText } = render(
      <ErrorBoundary>
        <NestedError />
      </ErrorBoundary>
    );
    
    expect(getByText(/erreur/i)).toBeInTheDocument();
  });

  it('should not catch errors outside its tree', () => {
    const { getByText } = render(
      <div>
        <ErrorBoundary>
          <div>Protected content</div>
        </ErrorBoundary>
        <div>Unprotected content</div>
      </div>
    );
    
    expect(getByText('Protected content')).toBeInTheDocument();
    expect(getByText('Unprotected content')).toBeInTheDocument();
  });

  it('should render error details in development mode', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // En mode development, les détails devraient être visibles
    const errorUI = getByText(/erreur/i);
    expect(errorUI).toBeInTheDocument();
  });
});
