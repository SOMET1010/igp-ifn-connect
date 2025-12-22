/**
 * Système d'erreurs standardisé - AppError
 * Permet une gestion cohérente des erreurs dans toute l'application
 */

// ============================================
// CODES D'ERREUR
// ============================================

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'AUTH_EXPIRED'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'STORAGE_ERROR'
  | 'OFFLINE_ERROR'
  | 'SYNC_ERROR'
  | 'UNKNOWN_ERROR';

// ============================================
// MESSAGES D'ERREUR PAR DÉFAUT
// ============================================

const DEFAULT_MESSAGES: Record<ErrorCode, string> = {
  NETWORK_ERROR: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
  AUTH_ERROR: 'Erreur d\'authentification. Veuillez vous reconnecter.',
  AUTH_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',
  VALIDATION_ERROR: 'Les données saisies sont invalides.',
  NOT_FOUND: 'La ressource demandée n\'existe pas.',
  PERMISSION_DENIED: 'Vous n\'avez pas les droits pour effectuer cette action.',
  CONFLICT: 'Un conflit a été détecté. Les données ont peut-être été modifiées.',
  RATE_LIMITED: 'Trop de requêtes. Veuillez patienter quelques instants.',
  STORAGE_ERROR: 'Erreur de stockage. Espace insuffisant ou fichier invalide.',
  OFFLINE_ERROR: 'Action impossible hors ligne. Réessayez une fois connecté.',
  SYNC_ERROR: 'Erreur de synchronisation. Les données seront synchronisées plus tard.',
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite.',
};

// ============================================
// CLASSE APPERROR
// ============================================

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly originalError?: unknown;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      originalError?: unknown;
      context?: Record<string, unknown>;
    }
  ) {
    super(message || DEFAULT_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.originalError = options?.originalError;
    this.context = options?.context;
    this.timestamp = new Date();

    // Maintenir la stack trace correcte
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Indique si l'erreur peut être résolue par un retry
   */
  get isRetryable(): boolean {
    return ['NETWORK_ERROR', 'RATE_LIMITED', 'SYNC_ERROR'].includes(this.code);
  }

  /**
   * Indique si l'utilisateur doit se reconnecter
   */
  get requiresReauth(): boolean {
    return ['AUTH_ERROR', 'AUTH_EXPIRED'].includes(this.code);
  }

  /**
   * Indique si l'erreur est due à un problème réseau
   */
  get isNetworkRelated(): boolean {
    return ['NETWORK_ERROR', 'OFFLINE_ERROR', 'SYNC_ERROR'].includes(this.code);
  }

  /**
   * Retourne un message utilisateur friendly
   */
  get userMessage(): string {
    return this.message;
  }

  /**
   * Sérialise l'erreur pour le logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Crée une AppError à partir d'une erreur inconnue
   */
  static fromError(error: unknown, context?: Record<string, unknown>): AppError {
    // Déjà une AppError
    if (error instanceof AppError) {
      return error;
    }

    // Erreur JavaScript standard
    if (error instanceof Error) {
      // Détection des erreurs réseau
      if (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('Failed to fetch') ||
        error.name === 'TypeError'
      ) {
        return new AppError('NETWORK_ERROR', error.message, {
          originalError: error,
          context,
        });
      }

      // Erreur générique
      return new AppError('UNKNOWN_ERROR', error.message, {
        originalError: error,
        context,
      });
    }

    // Erreur sous forme de string
    if (typeof error === 'string') {
      return new AppError('UNKNOWN_ERROR', error, { context });
    }

    // Erreur Supabase ou objet avec message
    if (error && typeof error === 'object' && 'message' in error) {
      const msg = (error as { message: string }).message;
      
      // Détection erreurs Supabase spécifiques
      if (msg.includes('JWT') || msg.includes('token')) {
        return new AppError('AUTH_EXPIRED', msg, { originalError: error, context });
      }
      if (msg.includes('permission') || msg.includes('policy')) {
        return new AppError('PERMISSION_DENIED', msg, { originalError: error, context });
      }
      if (msg.includes('not found') || msg.includes('no rows')) {
        return new AppError('NOT_FOUND', msg, { originalError: error, context });
      }

      return new AppError('UNKNOWN_ERROR', msg, { originalError: error, context });
    }

    // Fallback
    return new AppError('UNKNOWN_ERROR', 'Erreur inconnue', {
      originalError: error,
      context,
    });
  }

  /**
   * Crée une erreur réseau
   */
  static network(message?: string, originalError?: unknown): AppError {
    return new AppError('NETWORK_ERROR', message, { originalError });
  }

  /**
   * Crée une erreur d'authentification
   */
  static auth(message?: string, originalError?: unknown): AppError {
    return new AppError('AUTH_ERROR', message, { originalError });
  }

  /**
   * Crée une erreur de validation
   */
  static validation(message: string, context?: Record<string, unknown>): AppError {
    return new AppError('VALIDATION_ERROR', message, { context });
  }

  /**
   * Crée une erreur not found
   */
  static notFound(resource?: string): AppError {
    const message = resource 
      ? `${resource} introuvable`
      : DEFAULT_MESSAGES.NOT_FOUND;
    return new AppError('NOT_FOUND', message);
  }
}

// ============================================
// TYPE GUARDS
// ============================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isNetworkError(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isNetworkRelated;
  }
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.name === 'TypeError'
    );
  }
  return false;
}
