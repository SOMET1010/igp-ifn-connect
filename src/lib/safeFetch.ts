import { toast } from "sonner";

interface SafeFetchOptions<T> {
  /** Timeout en millisecondes (défaut: 10000) */
  timeout?: number;
  /** Nombre de tentatives (défaut: 2) */
  retries?: number;
  /** Données fallback si échec total */
  fallbackData?: T;
  /** Ne pas afficher de toast en cas d'erreur */
  silent?: boolean;
  /** Message personnalisé en cas d'erreur */
  errorMessage?: string;
}

interface SafeFetchResult<T> {
  data: T | null;
  error: Error | null;
  isMock: boolean;
}

/**
 * safeFetch - Wrapper pour appels API avec timeout, retry et fallback
 * Ne jamais laisser l'utilisateur sans réponse.
 */
export async function safeFetch<T>(
  fetcher: () => Promise<T>,
  options: SafeFetchOptions<T> = {}
): Promise<SafeFetchResult<T>> {
  const {
    timeout = 10000,
    retries = 2,
    fallbackData,
    silent = false,
    errorMessage = "Le service est temporairement indisponible.",
  } = options;

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout")), timeout);
      });

      // Race between fetcher and timeout
      const data = await Promise.race([fetcher(), timeoutPromise]);

      return {
        data,
        error: null,
        isMock: false,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      attempt++;

      // Exponential backoff: 1s, 2s, 4s...
      if (attempt <= retries) {
        await delay(Math.pow(2, attempt - 1) * 1000);
      }
    }
  }

  // All retries failed
  if (!silent) {
    toast.error(errorMessage);
  }

  // Return fallback data if provided
  if (fallbackData !== undefined) {
    return {
      data: fallbackData,
      error: lastError,
      isMock: true,
    };
  }

  return {
    data: null,
    error: lastError,
    isMock: false,
  };
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * safeFetchWithRetry - Version simplifiée pour cas courants
 */
export async function safeFetchWithRetry<T>(
  fetcher: () => Promise<T>,
  fallbackData?: T
): Promise<T | null> {
  const result = await safeFetch(fetcher, { fallbackData });
  return result.data;
}

export default safeFetch;
