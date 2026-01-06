/**
 * Utilitaires standardisés pour les toasts PNAVIM
 * Messages en français, cohérents dans toute l'application
 */

import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

interface ToastOptions {
  duration?: number;
  description?: string;
}

interface ToastErrorOptions extends ToastOptions {
  onRetry?: () => void;
}

// ============================================
// TOASTS STANDARDISÉS
// ============================================

/**
 * Toast de succès - pour confirmations positives
 */
export const toastSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    duration: options?.duration ?? 3000,
    description: options?.description,
  });
};

/**
 * Toast d'erreur - avec retry optionnel
 */
export const toastError = (message: string, options?: ToastErrorOptions) => {
  toast.error(message, {
    duration: options?.duration ?? 5000,
    description: options?.description,
    action: options?.onRetry
      ? {
          label: 'Réessayer',
          onClick: options.onRetry,
        }
      : undefined,
  });
};

/**
 * Toast d'avertissement - problèmes non bloquants
 */
export const toastWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    duration: options?.duration ?? 4000,
    description: options?.description,
  });
};

/**
 * Toast d'information - messages neutres
 */
export const toastInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    duration: options?.duration ?? 3000,
    description: options?.description,
  });
};

/**
 * Toast avec promesse - pour opérations async
 */
export const toastPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
};

// ============================================
// TOASTS SPÉCIFIQUES PNAVIM
// ============================================

/**
 * Toast mode hors ligne
 */
export const toastOffline = () => {
  toast.warning('Mode hors ligne', {
    description: 'Les modifications seront synchronisées à la reconnexion.',
    duration: 4000,
  });
};

/**
 * Toast synchronisation réussie
 */
export const toastSyncSuccess = (count?: number) => {
  const message = count
    ? `${count} élément${count > 1 ? 's' : ''} synchronisé${count > 1 ? 's' : ''}`
    : 'Synchronisation terminée';
  toast.success(message, { duration: 3000 });
};

/**
 * Toast erreur réseau
 */
export const toastNetworkError = (onRetry?: () => void) => {
  toastError('Pas de connexion internet', {
    description: 'Vérifie ton réseau et réessaie.',
    onRetry,
  });
};

/**
 * Toast session expirée
 */
export const toastSessionExpired = () => {
  toast.error('Session expirée', {
    description: 'Reconnecte-toi pour continuer.',
    duration: 5000,
  });
};
