import { ReactNode, useEffect, useState, useCallback } from "react";
import { WifiOff, Wifi, AlertTriangle, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";

type NetworkState = "online" | "offline" | "unstable" | "syncing";

interface NetworkGuardProps {
  children: ReactNode;
}

/**
 * NetworkGuard - Composant global pour la gestion des états réseau
 * Affiche un indicateur visuel et message vocal selon l'état du réseau
 */
export function NetworkGuard({ children }: NetworkGuardProps) {
  const { isOnline, isOffline } = useOnlineStatus();
  const [networkState, setNetworkState] = useState<NetworkState>("online");
  const [showBanner, setShowBanner] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Detect network state changes
  useEffect(() => {
    if (isOffline) {
      setNetworkState("offline");
      setShowBanner(true);
      speakMessage("Tu n'as pas de réseau. On continue sans internet.");
    } else if (connectionAttempts > 2) {
      setNetworkState("unstable");
      setShowBanner(true);
    } else {
      if (networkState === "offline") {
        speakMessage("Connexion rétablie.");
      }
      setNetworkState("online");
      setConnectionAttempts(0);
      // Hide banner after 3 seconds when back online
      setTimeout(() => setShowBanner(false), 3000);
    }
  }, [isOnline, isOffline, connectionAttempts, networkState]);

  // TTS helper
  const speakMessage = useCallback((message: string) => {
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = "fr-FR";
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Set syncing state
  const setSyncing = useCallback((isSyncing: boolean) => {
    if (isSyncing && isOnline) {
      setNetworkState("syncing");
      setShowBanner(true);
    } else if (!isSyncing && networkState === "syncing") {
      setNetworkState("online");
      setTimeout(() => setShowBanner(false), 2000);
    }
  }, [isOnline, networkState]);

  // Expose setSyncing globally for other components
  useEffect(() => {
    (window as unknown as { setNetworkSyncing?: (isSyncing: boolean) => void }).setNetworkSyncing = setSyncing;
    return () => {
      delete (window as unknown as { setNetworkSyncing?: (isSyncing: boolean) => void }).setNetworkSyncing;
    };
  }, [setSyncing]);

  const getBannerContent = () => {
    switch (networkState) {
      case "offline":
        return {
          icon: <WifiOff className="w-4 h-4" />,
          message: "Hors ligne",
          bgClass: "bg-muted border-muted-foreground/20",
          textClass: "text-muted-foreground",
        };
      case "unstable":
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          message: "Connexion instable",
          bgClass: "bg-yellow-500/10 border-yellow-500/30",
          textClass: "text-yellow-600 dark:text-yellow-400",
        };
      case "syncing":
        return {
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          message: "Synchronisation...",
          bgClass: "bg-primary/10 border-primary/30",
          textClass: "text-primary",
        };
      case "online":
        return {
          icon: <Wifi className="w-4 h-4" />,
          message: "Connecté",
          bgClass: "bg-green-500/10 border-green-500/30",
          textClass: "text-green-600 dark:text-green-400",
        };
    }
  };

  const banner = getBannerContent();

  return (
    <>
      {/* Network status banner */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium border-b transition-transform duration-300",
          banner.bgClass,
          banner.textClass,
          showBanner ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {banner.icon}
        <span>{banner.message}</span>
        {networkState === "offline" && (
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline text-xs"
          >
            Réessayer
          </button>
        )}
      </div>

      {/* Main content with padding when banner is visible */}
      <div className={cn(showBanner && "pt-10", "transition-all duration-300")}>
        {children}
      </div>
    </>
  );
}

export default NetworkGuard;
