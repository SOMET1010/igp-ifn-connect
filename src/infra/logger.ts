/**
 * Logger centralisé et standardisé
 * Remplace les console.* dispersés dans l'application
 */

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  module?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: unknown;
  timestamp: string;
}

// ============================================
// CONFIGURATION
// ============================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// En production, on ne log que warn et error
// En dev, on log tout
const getMinLevel = (): LogLevel => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD) {
    return 'warn';
  }
  return 'debug';
};

const MIN_LEVEL = getMinLevel();

// ============================================
// HELPERS
// ============================================

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatPrefix(level: LogLevel, module?: string): string {
  const timestamp = formatTimestamp().split('T')[1]?.slice(0, 12) || '';
  const moduleStr = module ? `[${module}]` : '';
  return `${timestamp} ${level.toUpperCase().padEnd(5)} ${moduleStr}`.trim();
}

function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) return '';
  
  const { module, ...rest } = context;
  if (Object.keys(rest).length === 0) return '';
  
  return ` | ${JSON.stringify(rest)}`;
}

// ============================================
// STOCKAGE LOCAL (pour debug)
// ============================================

const LOG_STORAGE_KEY = 'app_logs';
const MAX_STORED_LOGS = 100;

function storeLog(entry: LogEntry): void {
  try {
    const stored = localStorage.getItem(LOG_STORAGE_KEY);
    const logs: LogEntry[] = stored ? JSON.parse(stored) : [];
    
    logs.push(entry);
    
    // Garder seulement les derniers logs
    if (logs.length > MAX_STORED_LOGS) {
      logs.splice(0, logs.length - MAX_STORED_LOGS);
    }
    
    localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Silently fail si localStorage n'est pas disponible
  }
}

// ============================================
// LOGGER PRINCIPAL
// ============================================

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: unknown
): LogEntry {
  return {
    level,
    message,
    context,
    error: error instanceof Error ? { name: error.name, message: error.message } : error,
    timestamp: formatTimestamp(),
  };
}

export const logger = {
  /**
   * Log de debug - pour le développement uniquement
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return;
    
    const prefix = formatPrefix('debug', context?.module);
    const contextStr = formatContext(context);
    console.debug(`${prefix} ${message}${contextStr}`);
    
    storeLog(createLogEntry('debug', message, context));
  },

  /**
   * Log d'information - événements normaux
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return;
    
    const prefix = formatPrefix('info', context?.module);
    const contextStr = formatContext(context);
    console.info(`${prefix} ${message}${contextStr}`);
    
    storeLog(createLogEntry('info', message, context));
  },

  /**
   * Log d'avertissement - problèmes potentiels
   */
  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return;
    
    const prefix = formatPrefix('warn', context?.module);
    const contextStr = formatContext(context);
    console.warn(`${prefix} ${message}${contextStr}`);
    
    storeLog(createLogEntry('warn', message, context));
  },

  /**
   * Log d'erreur - avec stack trace optionnel
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (!shouldLog('error')) return;
    
    const prefix = formatPrefix('error', context?.module);
    const contextStr = formatContext(context);
    
    if (error) {
      console.error(`${prefix} ${message}${contextStr}`, error);
    } else {
      console.error(`${prefix} ${message}${contextStr}`);
    }
    
    storeLog(createLogEntry('error', message, context, error));
  },

  /**
   * Crée un logger avec un contexte pré-défini (utile pour les modules)
   */
  withContext(defaultContext: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => 
        logger.debug(msg, { ...defaultContext, ...ctx }),
      
      info: (msg: string, ctx?: LogContext) => 
        logger.info(msg, { ...defaultContext, ...ctx }),
      
      warn: (msg: string, ctx?: LogContext) => 
        logger.warn(msg, { ...defaultContext, ...ctx }),
      
      error: (msg: string, err?: unknown, ctx?: LogContext) => 
        logger.error(msg, err, { ...defaultContext, ...ctx }),
    };
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
   * Exporte les logs pour diagnostic
   */
  exportLogs(): string {
    const logs = logger.getStoredLogs();
    return JSON.stringify(logs, null, 2);
  },
};

// ============================================
// LOGGERS PRÉ-CONFIGURÉS PAR MODULE
// ============================================

export const authLogger = logger.withContext({ module: 'Auth' });
export const merchantLogger = logger.withContext({ module: 'Merchant' });
export const agentLogger = logger.withContext({ module: 'Agent' });
export const coopLogger = logger.withContext({ module: 'Cooperative' });
export const adminLogger = logger.withContext({ module: 'Admin' });
export const syncLogger = logger.withContext({ module: 'Sync' });
export const offlineLogger = logger.withContext({ module: 'Offline' });
export const networkLogger = logger.withContext({ module: 'Network' });

// ============================================
// EXPORT PAR DÉFAUT
// ============================================

export default logger;
