import React from 'react';
import { AlertTriangle, ExternalLink, RefreshCw, Mic, MicOff, Wifi, WifiOff, Shield, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib';

interface VoiceErrorDebuggerProps {
  error: string | null;
  isInIframe: boolean;
  isSecureContext: boolean;
  hasGetUserMedia: boolean;
  voiceState: string;
  scribeStatus?: string;
  scribeError?: unknown;
  onRetry?: () => void;
  onOpenFullscreen?: () => void;
}

/**
 * VoiceErrorDebugger - Composant de debug visuel pour les erreurs vocales
 * Affiche un diagnostic clair et des actions correctives
 */
export const VoiceErrorDebugger: React.FC<VoiceErrorDebuggerProps> = ({
  error,
  isInIframe,
  isSecureContext,
  hasGetUserMedia,
  voiceState,
  scribeStatus,
  scribeError,
  onRetry,
  onOpenFullscreen,
}) => {
  // Déterminer la cause principale
  const getPrimaryIssue = () => {
    if (isInIframe) return { 
      icon: ExternalLink, 
      label: 'Aperçu iframe', 
      color: 'text-orange-500',
      action: 'Ouvrir en plein écran'
    };
    if (!isSecureContext) return { 
      icon: ShieldOff, 
      label: 'Contexte non sécurisé', 
      color: 'text-red-500',
      action: 'Utiliser HTTPS'
    };
    if (!hasGetUserMedia) return { 
      icon: MicOff, 
      label: 'API micro indisponible', 
      color: 'text-red-500',
      action: 'Mettre à jour le navigateur'
    };
    if (error?.includes('permission') || error?.includes('Autorise')) return {
      icon: Shield,
      label: 'Permission refusée',
      color: 'text-yellow-500',
      action: 'Autoriser le micro'
    };
    if (error?.includes('micro détecté') || error?.includes('NotFound')) return {
      icon: MicOff,
      label: 'Aucun micro',
      color: 'text-red-500',
      action: 'Brancher un micro'
    };
    return { 
      icon: AlertTriangle, 
      label: 'Erreur inconnue', 
      color: 'text-gray-500',
      action: 'Réessayer'
    };
  };

  const issue = getPrimaryIssue();
  const IssueIcon = issue.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-4 bg-charbon/5 border border-charbon/10 rounded-2xl space-y-3"
    >
      {/* En-tête avec icône */}
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl bg-white/80", issue.color)}>
          <IssueIcon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-charbon text-sm">{issue.label}</p>
          {error && (
            <p className="text-xs text-charbon/60 mt-0.5 line-clamp-2">{error}</p>
          )}
        </div>
      </div>

      {/* Checklist rapide */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <CheckItem label="HTTPS" checked={isSecureContext} />
        <CheckItem label="Hors iframe" checked={!isInIframe} />
        <CheckItem label="API micro" checked={hasGetUserMedia} />
        <CheckItem label="État" value={voiceState} />
      </div>

      {/* Statut scribe si disponible */}
      {scribeStatus && (
        <div className="text-xs text-charbon/50">
          Scribe: {scribeStatus}
          {scribeError && <span className="text-red-500 ml-2">({String(scribeError)})</span>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {isInIframe && onOpenFullscreen && (
          <button
            onClick={onOpenFullscreen}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-sanguine text-white rounded-xl font-semibold text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Plein écran
          </button>
        )}
        {!isInIframe && onRetry && (
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-charbon/10 text-charbon rounded-xl font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Composant helper pour les items de checklist
const CheckItem: React.FC<{ label: string; checked?: boolean; value?: string }> = ({ 
  label, 
  checked, 
  value 
}) => (
  <div className="flex items-center gap-1.5">
    {value !== undefined ? (
      <>
        <span className="text-charbon/50">{label}:</span>
        <span className="font-medium text-charbon">{value}</span>
      </>
    ) : (
      <>
        <span className={checked ? 'text-green-500' : 'text-red-500'}>
          {checked ? '✓' : '✗'}
        </span>
        <span className={checked ? 'text-charbon' : 'text-charbon/50'}>{label}</span>
      </>
    )}
  </div>
);

export default VoiceErrorDebugger;
