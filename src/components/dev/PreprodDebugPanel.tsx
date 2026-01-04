import { useState, useEffect } from "react";
import { X, Bug, Wifi, WifiOff, Database, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DebugLog {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

/**
 * PreprodDebugPanel - Panel de diagnostic pour pré-production
 * Activer via localStorage: localStorage.setItem('pnavim-debug', 'true')
 */
export function PreprodDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const { isOnline } = useOnlineStatus();
  const { isAuthenticated, userRole, user } = useAuth();

  // Check if debug mode is enabled
  useEffect(() => {
    const checkDebugMode = () => {
      const debugEnabled = localStorage.getItem("pnavim-debug") === "true";
      setIsVisible(debugEnabled);
    };

    checkDebugMode();
    window.addEventListener("storage", checkDebugMode);
    return () => window.removeEventListener("storage", checkDebugMode);
  }, []);

  // Capture console logs
  useEffect(() => {
    if (!isVisible) return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args) => {
      addLog("error", args.map(String).join(" "));
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      addLog("warn", args.map(String).join(" "));
      originalConsoleWarn(...args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [isVisible]);

  const addLog = (level: DebugLog["level"], message: string) => {
    setLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString("fr-FR"),
        level,
        message: message.slice(0, 200),
      },
      ...prev.slice(0, 49), // Keep last 50 logs
    ]);
  };

  if (!isVisible) return null;

  const buildInfo = {
    version: import.meta.env.VITE_APP_VERSION || "dev",
    env: import.meta.env.MODE,
    timestamp: new Date().toLocaleString("fr-FR"),
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "fixed bottom-4 right-4 z-[100] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors",
          isExpanded
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        {isExpanded ? <X className="w-5 h-5" /> : <Bug className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {isExpanded && (
        <div className="fixed bottom-20 right-4 z-[100] w-80 max-h-[70vh] bg-background border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-muted px-4 py-2 border-b">
            <h3 className="font-semibold text-sm">Debug PNAVIM</h3>
            <p className="text-xs text-muted-foreground">
              {buildInfo.env} | v{buildInfo.version}
            </p>
          </div>

          {/* Status indicators */}
          <div className="p-4 space-y-3 border-b">
            {/* Network */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                Réseau
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  isOnline
                    ? "bg-green-500/10 text-green-600"
                    : "bg-red-500/10 text-red-600"
                )}
              >
                {isOnline ? "En ligne" : "Hors ligne"}
              </span>
            </div>

            {/* Auth */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Auth
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs",
                  isAuthenticated
                    ? "bg-green-500/10 text-green-600"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isAuthenticated ? userRole || "Connecté" : "Non connecté"}
              </span>
            </div>

            {/* User ID */}
            {user && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  User ID
                </span>
                <span className="text-xs font-mono text-muted-foreground truncate max-w-[120px]">
                  {user.id.slice(0, 8)}...
                </span>
              </div>
            )}

            {/* Timestamp */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Heure
              </span>
              <span className="text-xs text-muted-foreground">
                {buildInfo.timestamp}
              </span>
            </div>
          </div>

          {/* Logs */}
          <div className="max-h-48 overflow-y-auto">
            <div className="px-4 py-2 bg-muted/50 border-b">
              <span className="text-xs font-medium">Logs récents</span>
            </div>
            {logs.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground text-center">
                Aucun log récent
              </p>
            ) : (
              <div className="divide-y">
                {logs.map((log, i) => (
                  <div key={i} className="px-4 py-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          log.level === "error" && "bg-red-500",
                          log.level === "warn" && "bg-yellow-500",
                          log.level === "info" && "bg-blue-500"
                        )}
                      />
                      <span className="text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    <p className="text-foreground break-all">{log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 border-t bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                localStorage.removeItem("pnavim-debug");
                setIsVisible(false);
              }}
            >
              Désactiver le mode debug
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default PreprodDebugPanel;
