import { useState, useEffect, useCallback, useRef } from 'react';
import { AppError } from '@/shared/types/errors';

interface UseDataFetchingOptions<T> {
  /** Fonction async qui retourne les données */
  fetchFn: () => Promise<T>;
  /** Dépendances pour relancer le fetch (comme useEffect) */
  deps?: unknown[];
  /** Fetch automatique au montage (défaut: true) */
  enabled?: boolean;
  /** Délai avant retry automatique en ms (défaut: null = pas de retry auto) */
  retryDelay?: number | null;
  /** Nombre max de retries automatiques (défaut: 3) */
  maxRetries?: number;
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
}

export function useDataFetching<T>({
  fetchFn,
  deps = [],
  enabled = true,
  retryDelay = null,
  maxRetries = 3,
  onSuccess,
  onError,
}: UseDataFetchingOptions<T>): UseDataFetchingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<AppError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const isMounted = useRef(true);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchFnRef = useRef(fetchFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  // Mettre à jour les refs pour éviter les re-renders infinis
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const execute = useCallback(async (currentRetryCount = 0) => {
    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

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
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              setRetryCount(currentRetryCount + 1);
              execute(currentRetryCount + 1);
            }
          }, retryDelay);
        }
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [retryDelay, maxRetries]);

  const refetch = useCallback(async () => {
    // Annuler tout retry en cours
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setRetryCount(0);
    await execute(0);
  }, [execute]);

  const reset = useCallback(() => {
    // Annuler tout retry en cours
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setData(null);
    setError(null);
    setIsLoading(false);
    setRetryCount(0);
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (enabled) {
      execute(0);
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
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
  };
}
