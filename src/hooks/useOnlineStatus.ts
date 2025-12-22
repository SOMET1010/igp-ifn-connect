import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface UseOnlineStatusOptions {
  /** Callback appelé lors du passage en ligne */
  onOnline?: () => void;
  /** Callback appelé lors du passage hors-ligne */
  onOffline?: () => void;
  /** Afficher les toasts automatiquement (défaut: false) */
  showToasts?: boolean;
}

interface UseOnlineStatusResult {
  /** True si l'appareil est connecté */
  isOnline: boolean;
  /** True si l'appareil est hors-ligne */
  isOffline: boolean;
  /** Force une vérification du statut */
  checkStatus: () => boolean;
}

/**
 * Hook centralisé pour la détection du statut réseau.
 * Remplace le boilerplate useState + addEventListener pour online/offline.
 */
export function useOnlineStatus(options?: UseOnlineStatusOptions): UseOnlineStatusResult {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const { onOnline, onOffline, showToasts = false } = options ?? {};

  const checkStatus = useCallback(() => {
    const status = typeof navigator !== "undefined" ? navigator.onLine : true;
    setIsOnline(status);
    return status;
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      onOnline?.();
      if (showToasts) {
        toast.success("Connexion rétablie");
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      onOffline?.();
      if (showToasts) {
        toast.warning("Vous êtes hors-ligne");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onOnline, onOffline, showToasts]);

  return {
    isOnline,
    isOffline: !isOnline,
    checkStatus,
  };
}
