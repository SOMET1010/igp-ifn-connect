/**
 * Logger centralisé et standardisé pour JÙLABA
 * Avec support traceId, Sentry et loggers contextuels
 */

import { getSentry } from '@/shared/types';

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  module?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  action: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
  };
  timestamp: string;
  traceId: string | null;
  data?: Record<string, unknown>;
}

// ============================================
// CONFIGURATION
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const getMinLevel = (): LogLevel => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    return 'warn';
  }
  return 'debug';
};

const MIN_LEVEL = getMinLevel();

// ============================================
// STOCKAGE LOCAL
// ============================================

const LOG_STORAGE_KEY = 'app_logs';
const LOG_BUFFER_SIZE = 100;
const logBuffer: LogEntry[] = [];

// TraceId courant (par session/action)
let currentTraceId: string | null = null;

function generateTraceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatPrefix(level: LogLevel, module?: string): string {
  const timestamp = formatTimestamp().split('T')[1]?.slice(0, 12) || '';
  const moduleStr = module ? `[${module}]` : '';
  const traceStr = currentTraceId ? `[${currentTraceId}]` : '';
  return `${timestamp} ${level.toUpperCase().padEnd(5)} ${moduleStr}${traceStr}`.trim();
}

function createEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
  data?: Record<string, unknown>
): LogEntry {
  return {
    timestamp: formatTimestamp(),
    level,
    action: message,
    message,
    traceId: currentTraceId,
    context,
    data,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  };
}

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) {
    logBuffer.shift();
  }
  // Also store in localStorage
  try {
    const stored = localStorage.getItem(LOG_STORAGE_KEY);
    const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
    logs.push(entry);
    if (logs.length > LOG_BUFFER_SIZE) {
      logs.splice(0, logs.length - LOG_BUFFER_SIZE);
    }
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Silently fail si localStorage n'est pas disponible
  }
}

// ============================================
// LOGGER PRINCIPAL
// ============================================

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
  debug(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    const prefix = formatPrefix('debug');
    console.debug(`🔍 ${prefix} ${message}`, data || '');
    addToBuffer(createEntry('debug', message, undefined, undefined, data));
  },

  /**
   * Log d'information
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    const prefix = formatPrefix('info');
    console.log(`ℹ️ ${prefix} ${message}`, data || '');
    addToBuffer(createEntry('info', message, undefined, undefined, data));
  },

  /**
   * Log d'avertissement
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    const prefix = formatPrefix('warn');
    console.warn(`⚠️ ${prefix} ${message}`, data || '');
    addToBuffer(createEntry('warn', message, undefined, undefined, data));
  },

  /**
   * Log d'erreur
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    const prefix = formatPrefix('error');
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(`❌ ${prefix} ${message}`, { error: err.message, ...data });
    addToBuffer(createEntry('error', message, undefined, err, data));
  },

  /**
   * Log fatal - erreurs critiques non récupérables
   */
  fatal(message: string, error?: unknown, context?: LogContext): void {
    const prefix = formatPrefix('fatal', context?.module);
    console.error(`🔴 ${prefix} ${message}`, error);
    
    const err = error instanceof Error ? error : new Error(String(error));
    addToBuffer(createEntry('fatal', message, context, err));
    
    // Sentry integration si disponible
    const sentry = getSentry();
    if (sentry && error) {
      sentry.captureException(error, {
        level: 'fatal',
        extra: context,
      });
    }
  },

  /**
   * Crée un logger avec un contexte pré-défini (utile pour les modules)
   */
  withContext(defaultContext: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => {
        if (!shouldLog('debug')) return;
        const prefix = formatPrefix('debug', defaultContext.module);
        console.debug(`🔍 ${prefix} ${msg}`, ctx || '');
        addToBuffer(createEntry('debug', msg, { ...defaultContext, ...ctx }));
      },
      
      info: (msg: string, ctx?: LogContext) => {
        if (!shouldLog('info')) return;
        const prefix = formatPrefix('info', defaultContext.module);
        console.log(`ℹ️ ${prefix} ${msg}`, ctx || '');
        addToBuffer(createEntry('info', msg, { ...defaultContext, ...ctx }));
      },
      
      warn: (msg: string, ctx?: LogContext) => {
        if (!shouldLog('warn')) return;
        const prefix = formatPrefix('warn', defaultContext.module);
        console.warn(`⚠️ ${prefix} ${msg}`, ctx || '');
        addToBuffer(createEntry('warn', msg, { ...defaultContext, ...ctx }));
      },
      
      error: (msg: string, err?: unknown, ctx?: LogContext) => {
        if (!shouldLog('error')) return;
        const prefix = formatPrefix('error', defaultContext.module);
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`❌ ${prefix} ${msg}`, err);
        addToBuffer(createEntry('error', msg, { ...defaultContext, ...ctx }, error));
      },
    };
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
   * Récupère les logs stockés localement (pour debug)
   */
  getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  /**
   * Vider le buffer (pour tests)
   */
  clearBuffer(): void {
    logBuffer.length = 0;
  },

  /**
   * Efface les logs stockés
   */
  clearStoredLogs(): void {
    try {
      localStorage.removeItem(LOG_STORAGE_KEY);
    } catch {
      // Silently fail
    }
  },

  /**
   * Exporte les logs pour diagnostic avec metadata
   */
  exportLogs(): string {
    const logs = this.getStoredLogs();
    const exportData = {
      exportedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      appVersion: typeof import.meta !== 'undefined' ? import.meta.env.VITE_APP_VERSION || 'dev' : 'unknown',
      environment: typeof import.meta !== 'undefined' ? import.meta.env.MODE : 'unknown',
      logsCount: logs.length,
      logs,
    };
    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Télécharge les logs en fichier JSON
   */
  downloadLogs(): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `julaba-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Actions critiques JÙLABA avec traceId automatique
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

// ============================================
// LOGGERS PRÉ-CONFIGURÉS PAR MODULE
// ============================================

export const authLogger = logger.withContext({ module: 'Auth' });
export const merchantLogger = logger.withContext({ module: 'Merchant' });
export const coopLogger = logger.withContext({ module: 'Cooperative' });
export const adminLogger = logger.withContext({ module: 'Admin' });
export const agentLogger = logger.withContext({ module: 'Agent' });
export const notificationLogger = logger.withContext({ module: 'Notification' });
export const syncLogger = logger.withContext({ module: 'Sync' });
export const networkLogger = logger.withContext({ module: 'Network' });
export const preprodLogger = logger.withContext({ module: 'Preprod' });
export const routerLogger = logger.withContext({ module: 'Router' });
export const apiLogger = logger.withContext({ module: 'API' });

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default logger;
