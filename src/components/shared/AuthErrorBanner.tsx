/**
 * AuthErrorBanner - Bannière d'erreur standardisée pour l'authentification
 * 
 * Affiche:
 * - Cause lisible de l'erreur
 * - Code incident (ex: AUTH-01)
 * - Actions de récupération: Réessayer, Clavier, Appeler agent
 */

import React from 'react';
import { AlertCircle, RefreshCw, Keyboard, Phone, WifiOff, MicOff, ServerCrash, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

type ErrorType = 'network' | 'microphone' | 'validation' | 'server' | 'timeout' | 'unknown';

interface AuthErrorBannerProps {
  code: string;
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onSwitchToKeyboard?: () => void;
  onCallSupport?: () => void;
  className?: string;
}

const ERROR_ICONS: Record<ErrorType, React.ReactNode> = {
  network: <WifiOff className="w-5 h-5" />,
  microphone: <MicOff className="w-5 h-5" />,
  server: <ServerCrash className="w-5 h-5" />,
  timeout: <Clock className="w-5 h-5" />,
  validation: <AlertCircle className="w-5 h-5" />,
  unknown: <AlertCircle className="w-5 h-5" />,
};

const ERROR_COLORS: Record<ErrorType, string> = {
  network: 'bg-amber-50 border-amber-200 text-amber-800',
  microphone: 'bg-blue-50 border-blue-200 text-blue-800',
  server: 'bg-red-50 border-red-200 text-red-800',
  timeout: 'bg-orange-50 border-orange-200 text-orange-800',
  validation: 'bg-red-50 border-red-200 text-red-800',
  unknown: 'bg-gray-50 border-gray-200 text-gray-800',
};

/**
 * Codes d'erreur standardisés PNAVIM
 * AUTH-01: Micro refusé
 * AUTH-02: Réseau indisponible
 * AUTH-03: Timeout API (>12s)
 * AUTH-04: Numéro non reconnu
 * AUTH-05: Erreur serveur
 */
export const AUTH_ERROR_CODES = {
  MICROPHONE_DENIED: 'AUTH-01',
  NETWORK_UNAVAILABLE: 'AUTH-02',
  API_TIMEOUT: 'AUTH-03',
  PHONE_NOT_FOUND: 'AUTH-04',
  SERVER_ERROR: 'AUTH-05',
} as const;

export function AuthErrorBanner({
  code,
  message,
  type = 'unknown',
  onRetry,
  onSwitchToKeyboard,
  onCallSupport,
  className,
}: AuthErrorBannerProps) {
  const icon = ERROR_ICONS[type];
  const colorClass = ERROR_COLORS[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "w-full rounded-xl border p-4 space-y-3",
        colorClass,
        className
      )}
      role="alert"
    >
      {/* En-tête avec icône et message */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">
            {message}
          </p>
          <p className="text-xs opacity-70 mt-0.5">
            Code incident: <span className="font-mono font-bold">{code}</span>
          </p>
        </div>
      </div>

      {/* Actions de récupération */}
      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex-1 min-w-[100px] bg-white/50 hover:bg-white/80"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Réessayer
          </Button>
        )}
        
        {onSwitchToKeyboard && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSwitchToKeyboard}
            className="flex-1 min-w-[100px] bg-white/50 hover:bg-white/80"
          >
            <Keyboard className="w-4 h-4 mr-1.5" />
            Clavier
          </Button>
        )}
        
        {onCallSupport && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCallSupport}
            className="flex-1 min-w-[100px] bg-white/50 hover:bg-white/80"
          >
            <Phone className="w-4 h-4 mr-1.5" />
            Appeler
          </Button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Hook pour créer des erreurs standardisées
 */
export function createAuthError(
  type: ErrorType,
  customMessage?: string
): { code: string; message: string; type: ErrorType } {
  const defaults: Record<ErrorType, { code: string; message: string }> = {
    microphone: {
      code: AUTH_ERROR_CODES.MICROPHONE_DENIED,
      message: "Micro non autorisé. Autorise l'accès ou utilise le clavier.",
    },
    network: {
      code: AUTH_ERROR_CODES.NETWORK_UNAVAILABLE,
      message: "Pas de connexion internet. Vérifie ton réseau.",
    },
    timeout: {
      code: AUTH_ERROR_CODES.API_TIMEOUT,
      message: "Réseau trop lent (>12s). Réessaie plus tard.",
    },
    validation: {
      code: AUTH_ERROR_CODES.PHONE_NOT_FOUND,
      message: "Numéro non reconnu. Vérifie et réessaie.",
    },
    server: {
      code: AUTH_ERROR_CODES.SERVER_ERROR,
      message: "Erreur serveur. Réessaie dans quelques instants.",
    },
    unknown: {
      code: 'AUTH-00',
      message: customMessage || "Une erreur est survenue.",
    },
  };

  const error = defaults[type];
  return {
    code: error.code,
    message: customMessage || error.message,
    type,
  };
}

export default AuthErrorBanner;
