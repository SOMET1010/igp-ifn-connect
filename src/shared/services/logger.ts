/**
 * Logger structuré avec traceId pour P.NA.VIM
 * Actions critiques: login, vente, sync
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  traceId: string | null;
  data?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

// Storage pour les logs récents (diagnostic)
const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

// TraceId courant (par session/action)
let currentTraceId: string | null = null;

function generateTraceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function createEntry(
  level: LogLevel,
  action: string,
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    action,
    traceId: currentTraceId,
    data,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };
}

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
}

function formatForConsole(entry: LogEntry): string {
  const prefix = entry.traceId ? `[${entry.traceId}]` : '';
  return `${prefix} ${entry.action}`;
}

export const logger = {
  /**
   * Définir un traceId pour la session/action courante
   */
  setTraceId(id?: string): string {
    currentTraceId = id || generateTraceId();
    return currentTraceId;
  },

  /**
   * Obtenir le traceId courant
   */
  getTraceId(): string | null {
    return currentTraceId;
  },

  /**
   * Effacer le traceId courant
   */
  clearTraceId(): void {
    currentTraceId = null;
  },

  /**
   * Log de debug (dev only)
   */
  debug(action: string, data?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      const entry = createEntry('debug', action, data);
      addToBuffer(entry);
      console.debug(`🔍 ${formatForConsole(entry)}`, data || '');
    }
  },

  /**
   * Log d'information
   */
  info(action: string, data?: Record<string, unknown>): void {
    const entry = createEntry('info', action, data);
    addToBuffer(entry);
    console.log(`ℹ️ ${formatForConsole(entry)}`, data || '');
  },

  /**
   * Log d'avertissement
   */
  warn(action: string, data?: Record<string, unknown>): void {
    const entry = createEntry('warn', action, data);
    addToBuffer(entry);
    console.warn(`⚠️ ${formatForConsole(entry)}`, data || '');
  },

  /**
   * Log d'erreur
   */
  error(action: string, error: Error, data?: Record<string, unknown>): void {
    const entry = createEntry('error', action, data, error);
    addToBuffer(entry);
    console.error(`❌ ${formatForConsole(entry)}`, { error: error.message, ...data });
  },

  /**
   * Obtenir les logs récents (pour diagnostic)
   */
  getRecentLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return logBuffer.filter(e => e.level === level);
    }
    return [...logBuffer];
  },

  /**
   * Obtenir les logs par traceId
   */
  getLogsByTraceId(traceId: string): LogEntry[] {
    return logBuffer.filter(e => e.traceId === traceId);
  },

  /**
   * Vider le buffer (pour tests)
   */
  clearBuffer(): void {
    logBuffer.length = 0;
  },

  /**
   * Actions critiques P.NA.VIM avec traceId automatique
   */
  critical: {
    login(data: { phone?: string; method: string; success: boolean }): void {
      const traceId = logger.setTraceId();
      if (data.success) {
        logger.info('AUTH:LOGIN_SUCCESS', { ...data, traceId });
      } else {
        logger.warn('AUTH:LOGIN_FAILED', { ...data, traceId });
      }
    },

    sale(data: { amount: number; products?: string[]; offline?: boolean }): void {
      const traceId = logger.setTraceId();
      logger.info('SALE:CREATED', { ...data, traceId });
    },

    sync(data: { action: string; entity: string; success: boolean; offline?: boolean }): void {
      if (data.success) {
        logger.info('SYNC:SUCCESS', data);
      } else {
        logger.warn('SYNC:FAILED', data);
      }
    },

    offlineQueue(data: { action: 'add' | 'process' | 'error'; entity: string; count?: number }): void {
      logger.info(`OFFLINE:${data.action.toUpperCase()}`, data);
    },
  },
};

export type { LogEntry, LogLevel };
