import { useState, useCallback, useRef } from 'react';
import { AppError } from '@/shared/types/errors';
import { networkLogger } from '@/infra/logger';

interface RetryConfig {
  /** Nombre maximum de tentatives (défaut: 3) */
  maxRetries?: number;
  /** Délai de base entre les tentatives en ms (défaut: 1000) */
  baseDelay?: number;
  /** Délai maximum entre les tentatives en ms (défaut: 10000) */
  maxDelay?: number;
  /** Utiliser le backoff exponentiel (défaut: true) */
  exponentialBackoff?: boolean;
  /** Ajouter du jitter aléatoire (défaut: true) */
  jitter?: boolean;
  /** Callback appelé avant chaque retry */
  onRetry?: (attempt: number, error: AppError) => void;
  /** Callback appelé en cas de succès */
  onSuccess?: () => void;
  /** Callback appelé après échec de toutes les tentatives */
  onExhausted?: (error: AppError) => void;
}

interface RetryState {
  /** Nombre de tentatives effectuées */
  attemptCount: number;
  /** Erreur courante */
  error: AppError | null;
  /** Opération en cours */
  isRetrying: boolean;
  /** Temps restant avant le prochain retry en ms */
  nextRetryIn: number | null;
}

interface UseRetryOperationResult<T> {
  /** Exécute l'opération avec retry automatique */
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  /** État actuel du retry */
  state: RetryState;
  /** Annuler les retries en cours */
  cancel: () => void;
  /** Réinitialiser l'état */
  reset: () => void;
}

/**
 * Calcule le délai avant le prochain retry avec backoff exponentiel
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  useExponential: boolean,
  useJitter: boolean
): number {
  let delay = baseDelay;
  
  if (useExponential) {
    delay = baseDelay * Math.pow(2, attempt);
  }
  
  delay = Math.min(delay, maxDelay);
  
  if (useJitter) {
    // Ajoute ±25% de variation
    const jitterFactor = 0.75 + Math.random() * 0.5;
    delay = Math.floor(delay * jitterFactor);
  }
  
  return delay;
}

/**
 * Hook pour exécuter des opérations avec retry automatique
 * Idéal pour les appels réseau dans les flows critiques
 */
export function useRetryOperation<T = unknown>(config: RetryConfig = {}): UseRetryOperationResult<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true,
    jitter = true,
    onRetry,
    onSuccess,
    onExhausted,
  } = config;

  const [state, setState] = useState<RetryState>({
    attemptCount: 0,
    error: null,
    isRetrying: false,
    nextRetryIn: null,
  });

  const cancelledRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    clearTimers();
    setState(prev => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: null,
    }));
  }, [clearTimers]);

  const reset = useCallback(() => {
    cancelledRef.current = false;
    clearTimers();
    setState({
      attemptCount: 0,
      error: null,
      isRetrying: false,
      nextRetryIn: null,
    });
  }, [clearTimers]);

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    cancelledRef.current = false;
    clearTimers();

    let lastError: AppError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (cancelledRef.current) {
        networkLogger.debug('Opération annulée', { attempt });
        return null;
      }

      setState(prev => ({
        ...prev,
        attemptCount: attempt,
        isRetrying: attempt > 0,
        nextRetryIn: null,
      }));

      try {
        const result = await operation();
        
        setState(prev => ({
          ...prev,
          error: null,
          isRetrying: false,
        }));
        
        onSuccess?.();
        networkLogger.debug('Opération réussie', { attempt });
        return result;
        
      } catch (err) {
        lastError = AppError.fromError(err);
        
        setState(prev => ({
          ...prev,
          error: lastError,
        }));

        networkLogger.warn('Échec opération', { 
          attempt, 
          maxRetries,
          isRetryable: lastError.isRetryable,
          code: lastError.code,
        });

        // Ne pas réessayer si l'erreur n'est pas retryable
        if (!lastError.isRetryable) {
          networkLogger.debug('Erreur non retryable, abandon');
          break;
        }

        // Dernière tentative échouée
        if (attempt >= maxRetries) {
          break;
        }

        // Calculer le délai et attendre
        const delay = calculateDelay(attempt, baseDelay, maxDelay, exponentialBackoff, jitter);
        
        onRetry?.(attempt + 1, lastError);
        
        // Démarrer le compte à rebours
        setState(prev => ({ ...prev, nextRetryIn: delay }));
        
        intervalRef.current = setInterval(() => {
          setState(prev => {
            if (prev.nextRetryIn === null || prev.nextRetryIn <= 100) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              return { ...prev, nextRetryIn: null };
            }
            return { ...prev, nextRetryIn: prev.nextRetryIn - 100 };
          });
        }, 100);

        // Attendre avant le prochain retry
        await new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            clearTimers();
            resolve();
          }, delay);
        });
      }
    }

    // Toutes les tentatives ont échoué
    setState(prev => ({
      ...prev,
      isRetrying: false,
      nextRetryIn: null,
    }));

    if (lastError) {
      onExhausted?.(lastError);
    }

    return null;
  }, [maxRetries, baseDelay, maxDelay, exponentialBackoff, jitter, onRetry, onSuccess, onExhausted, clearTimers]);

  return {
    execute,
    state,
    cancel,
    reset,
  };
}

/**
 * Wrapper simple pour une opération avec retry
 * Utile pour les cas simples sans besoin de l'état
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Omit<RetryConfig, 'onRetry' | 'onSuccess' | 'onExhausted'> = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true,
    jitter = true,
  } = config;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const appError = AppError.fromError(err);
      
      if (!appError.isRetryable || attempt >= maxRetries) {
        break;
      }

      const delay = calculateDelay(attempt, baseDelay, maxDelay, exponentialBackoff, jitter);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
