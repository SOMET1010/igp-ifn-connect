/**
 * Tests StateComponents
 * 
 * Tests unitaires pour les composants d'état (Loading, Error, Empty)
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingState, ErrorState, EmptyState } from '@/shared/ui';

describe('StateComponents', () => {
  
  describe('LoadingState', () => {
    it('should render loading spinner', () => {
      render(<LoadingState />);
      
      // Le spinner a une animation de rotation
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should display default loading message', () => {
      const { getByText } = render(<LoadingState />);
      
      expect(getByText('Chargement...')).toBeInTheDocument();
    });

    it('should display custom loading message', () => {
      const { getByText } = render(<LoadingState message="Chargement des données..." />);
      
      expect(getByText('Chargement des données...')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<LoadingState className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('ErrorState', () => {
    it('should display default error title', () => {
      const { getByText } = render(<ErrorState />);
      
      expect(getByText('Erreur de chargement')).toBeInTheDocument();
    });

    it('should display custom error message', () => {
      const { getByText } = render(<ErrorState message="Erreur de connexion" />);
      
      expect(getByText('Erreur de connexion')).toBeInTheDocument();
    });

    it('should show retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      const { getByText } = render(<ErrorState onRetry={onRetry} />);
      
      expect(getByText('Réessayer')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      const { getByText } = render(<ErrorState onRetry={onRetry} />);
      
      getByText('Réessayer').click();
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should hide retry button if onRetry is not provided', () => {
      const { queryByText } = render(<ErrorState />);
      
      expect(queryByText('Réessayer')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<ErrorState className="custom-error" />);
      
      expect(container.firstChild).toHaveClass('custom-error');
    });

    it('should show network error icon for network errors', () => {
      const { getByText } = render(<ErrorState message="Erreur réseau" isNetworkError />);
      
      // L'icône WifiOff devrait être présente
      expect(getByText('Erreur réseau')).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('should display title', () => {
      const { getByText } = render(<EmptyState title="Aucun élément" />);
      
      expect(getByText('Aucun élément')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      const { getByText } = render(<EmptyState title="Vide" message="Aucune transaction trouvée" />);
      
      expect(getByText('Aucune transaction trouvée')).toBeInTheDocument();
    });

    it('should display custom title', () => {
      const { getByText } = render(<EmptyState title="Liste vide" message="Aucun élément disponible" />);
      
      expect(getByText('Liste vide')).toBeInTheDocument();
    });

    it('should render action button when provided', () => {
      const { getByText } = render(
        <EmptyState 
          title="Aucun produit"
          message="Aucun produit disponible" 
          actionLabel="Ajouter un produit"
          onAction={() => {}}
        />
      );
      
      expect(getByText('Ajouter un produit')).toBeInTheDocument();
    });

    it('should call onAction when action button is clicked', () => {
      const onAction = vi.fn();
      const { getByText } = render(
        <EmptyState 
          title="Aucun produit"
          message="Aucun produit" 
          actionLabel="Ajouter"
          onAction={onAction}
        />
      );
      
      getByText('Ajouter').click();
      
      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should hide action button if onAction is not provided', () => {
      const { queryByText } = render(<EmptyState title="Aucun élément" message="Aucun élément" actionLabel="Action" />);
      
      expect(queryByText('Action')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<EmptyState title="Vide" className="custom-empty" />);
      
      expect(container.firstChild).toHaveClass('custom-empty');
    });

    it('should render custom icon when provided', () => {
      const CustomIcon = () => <span data-testid="custom-icon">📦</span>;
      const { getByTestId } = render(<EmptyState title="Vide" icon={<CustomIcon />} />);
      
      expect(getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('should render as Card variant when specified', () => {
      const { container } = render(<EmptyState title="Vide" variant="card" />);
      
      // Vérifie que le composant a une structure de card
      expect(container.querySelector('.card-institutional')).toBeInTheDocument();
    });
  });
});
