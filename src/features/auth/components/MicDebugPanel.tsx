/**
 * MicDebugPanel - Panneau de debug pour le microphone
 * 
 * Affiche en temps réel :
 * - Permission micro (granted/denied/prompt)
 * - État de connexion (idle/connecting/listening...)
 * - Niveau audio brut et lissé
 * - Statut audio (silence/weak/ok)
 * - Durée du silence
 * - Transcription en cours
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib';
import { AudioStatus } from '../hooks/useAudioLevel';

interface MicDebugPanelProps {
  audioLevel: number;
  smoothedLevel?: number;
  isReceivingAudio: boolean;
  audioStatus: AudioStatus;
  silenceDuration: number;
  state: 'idle' | 'requesting_mic' | 'connecting' | 'listening' | 'processing' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  transcript: string;
  extractedDigits: string;
  scribeStatus?: string;
  scribeError?: string | null;
  errorMessage?: string | null;
}

// Indicateur de niveau audio visuel
const LevelMeter = ({ level, label }: { level: number; label: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-white/60 w-16">{label}</span>
    <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden">
      <motion.div
        className={cn(
          "h-full rounded-full",
          level < 0.03 ? "bg-gray-400" :
          level < 0.08 ? "bg-yellow-400" :
          "bg-green-400"
        )}
        animate={{ width: `${Math.min(level * 100, 100)}%` }}
        transition={{ duration: 0.05 }}
      />
    </div>
    <span className="text-xs text-white font-mono w-12 text-right">
      {(level * 100).toFixed(1)}%
    </span>
  </div>
);

export function MicDebugPanel({
  audioLevel,
  smoothedLevel,
  isReceivingAudio,
  audioStatus,
  silenceDuration,
  state,
  isConnected,
  isConnecting,
  transcript,
  extractedDigits,
  scribeStatus,
  scribeError,
  errorMessage,
}: MicDebugPanelProps) {
  const [micPermission, setMicPermission] = useState<'checking' | 'granted' | 'denied' | 'prompt'>('checking');

  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();

  const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
  const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Vérifier la permission du micro
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (!navigator.permissions) {
          setMicPermission('prompt');
          return;
        }
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        result.onchange = () => {
          setMicPermission(result.state as 'granted' | 'denied' | 'prompt');
        };
      } catch {
        setMicPermission('prompt');
      }
    };
    checkPermission();
  }, []);
  
  const stateColors: Record<typeof state, string> = {
    idle: 'bg-gray-500',
    requesting_mic: 'bg-blue-500',
    connecting: 'bg-yellow-500',
    listening: 'bg-green-500',
    processing: 'bg-purple-500',
    error: 'bg-red-500',
  };
  
  const statusColors: Record<AudioStatus, string> = {
    silence: 'text-gray-400',
    weak: 'text-yellow-400',
    ok: 'text-green-400',
  };
  
  const permissionColors = {
    checking: 'text-gray-400',
    granted: 'text-green-400',
    denied: 'text-red-400',
    prompt: 'text-yellow-400',
  };

  // Détection si iframe bloqué (aussi basé sur le message d'erreur normalisé)
  const isIframeBlocked = isInIframe && (
    micPermission === 'denied' || 
    state === 'error' || 
    errorMessage?.includes('aperçu') || 
    errorMessage?.includes('plein écran')
  );

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-black/40 backdrop-blur-sm rounded-xl p-3 mt-3 text-xs font-mono space-y-2"
    >
      <div className="text-white/80 font-bold text-center border-b border-white/20 pb-1 mb-2">
        🔧 DEBUG MICRO
        {isIframeBlocked && (
          <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px]">
            IFRAME BLOQUÉ
          </span>
        )}
      </div>
      
      {/* Contexte */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">Contexte:</span>
        <span className={cn("text-white/80", isInIframe && "text-yellow-400")}>
          {isSecureContext ? 'secure' : 'not-secure'} · {isInIframe ? '⚠️ iframe' : 'top'} · {hasGetUserMedia ? 'getUserMedia' : 'no-getUserMedia'}
        </span>
      </div>

      {/* Permission */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">Permission:</span>
        <span className={permissionColors[micPermission]}>
          {micPermission.toUpperCase()}
        </span>
      </div>
      
      {/* État */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">État:</span>
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", stateColors[state])} />
          <span className="text-white">{state}</span>
        </div>
      </div>
      
      {/* Connexion */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">Connexion:</span>
        <span className={isConnected ? 'text-green-400' : isConnecting ? 'text-yellow-400' : 'text-gray-400'}>
          {isConnected ? '✅ Connecté' : isConnecting ? '⏳ En cours...' : '❌ Déconnecté'}
        </span>
      </div>

      {/* Scribe */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">Scribe:</span>
        <span className="text-white/80">{scribeStatus || '—'}</span>
      </div>

      {(scribeError || errorMessage) && (
        <div className="pt-1 border-t border-white/10">
          <span className="text-white/60">Erreur:</span>
          <div className="text-red-200 text-[10px] mt-1 bg-black/20 p-1 rounded max-h-12 overflow-auto">
            {errorMessage || scribeError}
          </div>
        </div>
      )}
      
      {/* Niveaux audio */}
      <div className="space-y-1 pt-1 border-t border-white/10">
        <LevelMeter level={audioLevel} label="Niveau:" />
        {smoothedLevel !== undefined && (
          <LevelMeter level={smoothedLevel} label="Lissé:" />
        )}
      </div>
      
      {/* Statut audio */}
      <div className="flex justify-between items-center">
        <span className="text-white/60">Audio:</span>
        <div className="flex items-center gap-2">
          <span className={statusColors[audioStatus]}>
            {audioStatus === 'silence' && '🔇 Silence'}
            {audioStatus === 'weak' && '🔈 Faible'}
            {audioStatus === 'ok' && '🔊 OK'}
          </span>
          {isReceivingAudio && (
            <span className="text-green-400 animate-pulse">●</span>
          )}
        </div>
      </div>
      
      {/* Durée silence */}
      {silenceDuration > 500 && (
        <div className="flex justify-between items-center">
          <span className="text-white/60">Silence:</span>
          <span className={silenceDuration > 3000 ? 'text-red-400' : 'text-yellow-400'}>
            {(silenceDuration / 1000).toFixed(1)}s
          </span>
        </div>
      )}
      
      {/* Chiffres détectés */}
      <div className="flex justify-between items-center pt-1 border-t border-white/10">
        <span className="text-white/60">Chiffres:</span>
        <span className="text-white font-bold">
          {extractedDigits || '—'}
          <span className="text-white/40 ml-1">({extractedDigits.length}/10)</span>
        </span>
      </div>
      
      {/* Transcription */}
      {transcript && (
        <div className="pt-1 border-t border-white/10">
          <span className="text-white/60">Texte:</span>
          <div className="text-white/80 text-[10px] mt-1 bg-black/20 p-1 rounded max-h-12 overflow-auto">
            {transcript}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default MicDebugPanel;
