import { useState, useEffect, useCallback, useRef } from 'react';
import { AppError } from '@/shared/types/errors';

interface UseDataFetchingOptions<T> {
  /** Fonction async qui retourne les données */
  fetchFn: () => Promise<T>;
  /** Dépendances pour relancer le fetch (comme useEffect) */
  deps?: unknown[];
  /** Fetch automatique au montage (défaut: true) */
  enabled?: boolean;
  /** Délai de base avant retry automatique en ms (défaut: null = pas de retry auto) */
  retryDelay?: number | null;
  /** Nombre max de retries automatiques (défaut: 3) */
  maxRetries?: number;
  /** Activer le backoff exponentiel (défaut: true) */
  exponentialBackoff?: boolean;
  /** Délai maximum entre les retries en ms (défaut: 30000) */
  maxRetryDelay?: number;
  /** Ajouter du jitter aléatoire pour éviter la synchronisation (défaut: true) */
  jitter?: boolean;
  /** Callback appelé en cas de succès */
  onSuccess?: (data: T) => void;
  /** Callback appelé en cas d'erreur */
  onError?: (error: AppError) => void;
}

interface UseDataFetchingResult<T> {
  /** Données récupérées */
  data: T | null;
  /** État de chargement */
  isLoading: boolean;
  /** Erreur éventuelle */
  error: AppError | null;
  /** True si c'est une erreur réseau */
  isNetworkError: boolean;
  /** True si on peut réessayer */
  isRetryable: boolean;
  /** Fonction pour relancer manuellement */
  refetch: () => Promise<void>;
  /** Fonction pour réinitialiser l'état */
  reset: () => void;
  /** Nombre de tentatives effectuées */
  retryCount: number;
  /** Temps avant le prochain retry en ms (null si pas de retry prévu) */
  nextRetryIn: number | null;
}

/**
 * Calcule le délai avant le prochain retry avec backoff exponentiel
 */
function calculateRetryDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  useJitter: boolean
): number {
  // Calcul exponentiel: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Plafonner au délai maximum
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Ajouter jitter (±25% de variation)
  if (useJitter) {
    const jitterFactor = 0.75 + Math.random() * 0.5; // 0.75 à 1.25
    return Math.floor(cappedDelay * jitterFactor);
  }
  
  return cappedDelay;
}

export function useDataFetching<T>({
  fetchFn,
  deps = [],
  enabled = true,
  retryDelay = null,
  maxRetries = 3,
  exponentialBackoff = true,
  maxRetryDelay = 30000,
  jitter = true,
  onSuccess,
  onError,
}: UseDataFetchingOptions<T>): UseDataFetchingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);

  const isMounted = useRef(true);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Mettre à jour les refs pour éviter les re-renders infinis
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const clearTimers = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setNextRetryIn(null);
  }, []);

  const execute = useCallback(async (currentRetryCount = 0) => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);
    setNextRetryIn(null);

    try {
      const result = await fetchFnRef.current();
      if (isMounted.current) {
        setData(result);
        setRetryCount(0);
        onSuccessRef.current?.(result);
      }
    } catch (err) {
      if (isMounted.current) {
        const appError = AppError.fromError(err);
        setError(appError);
        onErrorRef.current?.(appError);

        // Retry automatique si activé et erreur retryable
        if (retryDelay && appError.isRetryable && currentRetryCount < maxRetries) {
          const delay = exponentialBackoff
            ? calculateRetryDelay(currentRetryCount, retryDelay, maxRetryDelay, jitter)
            : retryDelay;

          // Démarrer le compte à rebours pour l'UI
          setNextRetryIn(delay);
          countdownIntervalRef.current = setInterval(() => {
            setNextRetryIn((prev) => {
              if (prev === null || prev <= 100) {
                if (countdownIntervalRef.current) {
                  clearInterval(countdownIntervalRef.current);
                  countdownIntervalRef.current = null;
                }
                return null;
              }
              return prev - 100;
            });
          }, 100);

          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              setRetryCount(currentRetryCount + 1);
              execute(currentRetryCount + 1);
            }
          }, delay);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [retryDelay, maxRetries, exponentialBackoff, maxRetryDelay, jitter]);

  const refetch = useCallback(async () => {
    clearTimers();
    setRetryCount(0);
    await execute(0);
  }, [execute, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setData(null);
    setError(null);
    setIsLoading(false);
    setRetryCount(0);
  }, [clearTimers]);

  useEffect(() => {
    isMounted.current = true;

    if (enabled) {
      execute(0);
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted.current = false;
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    data,
    isLoading,
    error,
    isNetworkError: error?.isNetworkRelated ?? false,
    isRetryable: error?.isRetryable ?? false,
    refetch,
    reset,
    retryCount,
    nextRetryIn,
  };
}
