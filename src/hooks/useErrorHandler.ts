/**
 * Hook centralisé pour la gestion d'erreurs
 * Fournit des messages lisibles et un logging structuré
 */

import { useCallback } from 'react';
import { logger } from '@/infra/logger';
import { toastError, toastNetworkError, toastSessionExpired } from '@/lib/toast-utils';

// ============================================
// TYPES
// ============================================

type ErrorCode =
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'TIMEOUT'
  | 'OFFLINE'
  | 'UNKNOWN';

interface ErrorContext {
  module?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

// ============================================
// MESSAGES UTILISATEUR (français simple)
// ============================================

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Pas de connexion internet. Vérifie ton réseau.',
  UNAUTHORIZED: 'Tu dois te connecter pour accéder à cette page.',
  FORBIDDEN: "Tu n'as pas accès à cette fonctionnalité.",
  NOT_FOUND: "Cette page n'existe pas ou a été déplacée.",
  VALIDATION_ERROR: 'Certaines informations ne sont pas correctes.',
  SERVER_ERROR: 'Un problème est survenu. Réessaie dans quelques minutes.',
  TIMEOUT: 'La connexion est trop lente. Réessaie.',
  OFFLINE: 'Tu es hors ligne. Reconnecte-toi pour continuer.',
  UNKNOWN: 'Une erreur inattendue est survenue.',
};

// ============================================
// DÉTECTION DU TYPE D'ERREUR
// ============================================

function detectErrorCode(error: unknown): ErrorCode {
  if (!navigator.onLine) {
    return 'OFFLINE';
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      name === 'typeerror'
    ) {
      return 'NETWORK_ERROR';
    }

    // Timeout
    if (message.includes('timeout') || message.includes('aborted')) {
      return 'TIMEOUT';
    }

    // Auth errors
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'UNAUTHORIZED';
    }

    if (message.includes('forbidden') || message.includes('403')) {
      return 'FORBIDDEN';
    }

    // Not found
    if (message.includes('not found') || message.includes('404')) {
      return 'NOT_FOUND';
    }

    // Validation
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }

    // Server errors
    if (message.includes('500') || message.includes('server')) {
      return 'SERVER_ERROR';
    }
  }

  // Check for Supabase/API error objects
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>;
    const status = errorObj.status || errorObj.statusCode;

    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 422 || status === 400) return 'VALIDATION_ERROR';
    if (typeof status === 'number' && status >= 500) return 'SERVER_ERROR';
  }

  return 'UNKNOWN';
}

// ============================================
// HOOK
// ============================================

export function useErrorHandler() {
  /**
   * Obtenir un message lisible pour l'utilisateur
   */
  const getHumanReadableMessage = useCallback(
    (error: unknown, fallback?: string): string => {
      const code = detectErrorCode(error);
      return ERROR_MESSAGES[code] || fallback || ERROR_MESSAGES.UNKNOWN;
    },
    []
  );

  /**
   * Gérer une erreur avec logging et toast
   */
  const handleError = useCallback(
    (
      error: unknown,
      context?: ErrorContext,
      options?: { silent?: boolean; onRetry?: () => void }
    ) => {
      const code = detectErrorCode(error);
      const message =
        error instanceof Error ? error.message : 'Unknown error';

      // Log structuré
      logger.error(message, error, {
        module: context?.module || 'App',
        action: context?.action,
        errorCode: code,
        ...context,
      });

      // Toast utilisateur (sauf si silent)
      if (!options?.silent) {
        if (code === 'NETWORK_ERROR' || code === 'OFFLINE') {
          toastNetworkError(options?.onRetry);
        } else if (code === 'UNAUTHORIZED') {
          toastSessionExpired();
        } else {
          toastError(ERROR_MESSAGES[code], { onRetry: options?.onRetry });
        }
      }

      return code;
    },
    []
  );

  /**
   * Reporter une erreur sans toast (logging seulement)
   */
  const reportError = useCallback(
    (error: unknown, context?: ErrorContext) => {
      handleError(error, context, { silent: true });
    },
    [handleError]
  );

  return {
    handleError,
    reportError,
    getHumanReadableMessage,
    detectErrorCode,
  };
}

export type { ErrorCode, ErrorContext };
