import { useState, useEffect, useCallback } from "react";
import { X, Bug, Wifi, WifiOff, Database, Shield, Clock, Download, Filter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/shared/hooks";
import { useAuth } from "@/shared/contexts";
import { cn } from "@/shared/lib";
import { logger, type LogLevel, type LogEntry } from "@/infra/logger";

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
  const [storedLogs, setStoredLogs] = useState<LogEntry[]>([]);
  const [logFilter, setLogFilter] = useState<LogLevel | 'all'>('all');
  const { isOnline } = useOnlineStatus();
  const { isAuthenticated, userRole, user } = useAuth();

  // Load stored logs from logger
  const refreshStoredLogs = useCallback(() => {
    const logs = logger.getStoredLogs();
    setStoredLogs(logs.reverse()); // Most recent first
  }, []);

  // Refresh logs when panel opens
  useEffect(() => {
    if (isExpanded) {
      refreshStoredLogs();
    }
  }, [isExpanded, refreshStoredLogs]);

  const handleExportLogs = () => {
    logger.downloadLogs();
  };

  const handleClearLogs = () => {
    logger.clearStoredLogs();
    refreshStoredLogs();
  };

  const filteredStoredLogs = storedLogs.filter(
    log => logFilter === 'all' || log.level === logFilter
  );

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

          {/* Logs with filter */}
          <div className="max-h-64 overflow-y-auto">
            <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
              <span className="text-xs font-medium">Logs système ({filteredStoredLogs.length})</span>
              <div className="flex items-center gap-2">
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value as LogLevel | 'all')}
                  className="text-xs bg-background border rounded px-1 py-0.5"
                >
                  <option value="all">Tous</option>
                  <option value="error">Erreurs</option>
                  <option value="warn">Warnings</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
                <button
                  onClick={handleExportLogs}
                  className="p-1 hover:bg-muted rounded"
                  title="Exporter les logs"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={handleClearLogs}
                  className="p-1 hover:bg-muted rounded text-destructive"
                  title="Effacer les logs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {filteredStoredLogs.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground text-center">
                Aucun log récent
              </p>
            ) : (
              <div className="divide-y">
                {filteredStoredLogs.slice(0, 30).map((log, i) => (
                  <div key={i} className="px-4 py-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full flex-shrink-0",
                          log.level === "fatal" && "bg-purple-500",
                          log.level === "error" && "bg-red-500",
                          log.level === "warn" && "bg-yellow-500",
                          log.level === "info" && "bg-blue-500",
                          log.level === "debug" && "bg-gray-400"
                        )}
                      />
                      <span className="text-muted-foreground flex-shrink-0">
                        {log.timestamp.split('T')[1]?.slice(0, 8) || log.timestamp}
                      </span>
                      {log.context?.module && (
                        <span className="text-muted-foreground/70 text-[10px]">
                          [{log.context.module}]
                        </span>
                      )}
                    </div>
                    <p className="text-foreground break-all">{log.message}</p>
                    {log.error && (
                      <p className="text-destructive/80 text-[10px] mt-1 break-all">
                        {typeof log.error === 'object' && log.error !== null
                          ? (log.error as any).message || JSON.stringify(log.error)
                          : String(log.error)}
                      </p>
                    )}
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
