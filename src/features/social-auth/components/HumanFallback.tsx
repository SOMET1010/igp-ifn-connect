import React, { useState, useEffect } from 'react';
import { Phone, RefreshCw, HeadphonesIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useElevenLabsTts } from '../hooks/useElevenLabsTts';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';

interface HumanFallbackProps {
  reason: string;
  phone?: string;
  merchantName?: string;
  voiceId: string;
  personaName: string;
  onRetry: () => void;
  supportPhone?: string;
}

/**
 * HumanFallback - Layer 4 du protocole d'authentification sociale
 * 
 * Escalade vers un agent humain quand la vérification automatique échoue.
 * Message rassurant lu avec la voix clonée du persona.
 */
export function HumanFallback({
  reason,
  phone,
  merchantName,
  voiceId,
  personaName,
  onRetry,
  supportPhone = '0800-PNAVIM',
}: HumanFallbackProps) {
  const [waitTime, setWaitTime] = useState(0);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [hasPlayedMessage, setHasPlayedMessage] = useState(false);

  // Hook TTS ElevenLabs avec voix clonée
  const { speak, isSpeaking } = useElevenLabsTts({
    voiceId,
    onStart: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  });

  // Auto-play message de réassurance avec voix clonée
  useEffect(() => {
    if (hasPlayedMessage) return;
    
    const timer = setTimeout(() => {
      const message = merchantName 
        ? `${merchantName}, ne t'inquiète pas. On va appeler un agent pour t'aider.`
        : "Ne t'inquiète pas mon enfant. On va appeler quelqu'un pour t'aider.";
      speak(message);
      setHasPlayedMessage(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [speak, hasPlayedMessage, merchantName]);

  // Simulate creating a support ticket
  useEffect(() => {
    const timer = setTimeout(() => {
      setTicketCreated(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Simulate wait time counter
  useEffect(() => {
    if (!ticketCreated) return;

    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketCreated]);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4 text-center">
      {/* Avatar rassurant */}
      <div className="relative">
        <div className="merchant-avatar-lg opacity-80">
          <img 
            src={marcheIvoirien} 
            alt="Marché ivoirien"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Badge support */}
        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full border-2 border-white flex items-center justify-center">
          <HeadphonesIcon className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Message rassurant - NON technique */}
      <div className="space-y-3 max-w-xs">
        <h3 className="text-lg font-semibold text-foreground">
          On va t'aider
        </h3>
        
        <p className="text-muted-foreground">
          Je ne reconnais pas bien ta voix aujourd'hui. 
          Ne t'inquiète pas, on va appeler un agent pour t'aider.
        </p>

        {/* Indicateur TTS */}
        {isSpeaking && (
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {personaName} parle...
          </div>
        )}

        {/* Info utilisateur si disponible */}
        {(phone || merchantName) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            {merchantName && <p className="font-medium">{merchantName}</p>}
            {phone && <p className="text-muted-foreground">{phone}</p>}
          </div>
        )}
      </div>

      {/* Status du ticket */}
      <div className="w-full max-w-xs space-y-3">
        {!ticketCreated ? (
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Connexion à un agent...</span>
          </div>
        ) : (
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-secondary">
              <HeadphonesIcon className="w-5 h-5" />
              <span className="font-medium">Agent alerté</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Clock className="w-4 h-4" />
              <span>Temps d'attente: ~2 min</span>
            </div>

            {waitTime > 0 && (
              <p className="text-xs text-muted-foreground">
                En attente depuis {formatWaitTime(waitTime)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bouton appel direct */}
      <a
        href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`}
        className="w-full max-w-xs"
      >
        <Button variant="outline" className="w-full h-12 gap-2">
          <Phone className="w-5 h-5" />
          Appeler directement: {supportPhone}
        </Button>
      </a>

      {/* Note rassurante */}
      <div className="flex items-start gap-2 max-w-xs text-left bg-muted/30 rounded-lg p-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Ce problème arrive parfois quand tu utilises un nouveau téléphone 
          ou que tu te connectes depuis un endroit inhabituel. L'agent va 
          vérifier ton identité rapidement.
        </p>
      </div>

      {/* Bouton réessayer */}
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer la connexion
      </button>
    </div>
  );
}

export default HumanFallback;
