import React, { useState, useEffect } from 'react';
import { Phone, RefreshCw, HeadphonesIcon, Clock, AlertCircle, Shield, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTts } from '@/shared/hooks/useTts';
import { AgentValidationRequest } from '@/features/auth/components/AgentValidationRequest';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';

interface HumanFallbackProps {
  reason: string;
  phone?: string;
  merchantId?: string;
  merchantName?: string;
  voiceId: string;
  personaName: string;
  onRetry: () => void;
  onValidated?: () => void;
  supportPhone?: string;
}

type FallbackOption = 'menu' | 'agent_validation' | 'call_support' | 'sms_code';

/**
 * HumanFallback - Layer 4 du protocole d'authentification sociale
 * 
 * Escalade vers un agent humain quand la vérification automatique échoue.
 * Propose plusieurs options de fallback selon le contexte.
 */
export function HumanFallback({
  reason,
  phone,
  merchantId,
  merchantName,
  voiceId,
  personaName,
  onRetry,
  onValidated,
  supportPhone = '0800-JULABA',
}: HumanFallbackProps) {
  const [currentOption, setCurrentOption] = useState<FallbackOption>('menu');
  const [waitTime, setWaitTime] = useState(0);
  const [ticketCreated, setTicketCreated] = useState(false);
  const [hasPlayedMessage, setHasPlayedMessage] = useState(false);

  // Hook TTS ElevenLabs avec voix clonée
  const { speak, isSpeaking } = useTts({
    voiceId: voiceId as import('@/shared/config/voiceConfig').JulabaVoiceId,
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
        ? `${merchantName}, ne t'inquiète pas. On va t'aider à te connecter.`
        : "Ne t'inquiète pas mon enfant. On va t'aider à te connecter.";
      speak(message);
      setHasPlayedMessage(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [speak, hasPlayedMessage, merchantName]);

  // Simulate wait time counter for call support option
  useEffect(() => {
    if (currentOption !== 'call_support' || !ticketCreated) return;

    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentOption, ticketCreated]);

  const formatWaitTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleValidated = () => {
    onValidated?.();
  };

  const handleRejected = () => {
    setCurrentOption('menu');
  };

  // Agent Validation View
  if (currentOption === 'agent_validation' && merchantId && phone) {
    return (
      <div className="py-4">
        <AgentValidationRequest
          merchantId={merchantId}
          merchantName={merchantName}
          phone={phone}
          reason={reason}
          onValidated={handleValidated}
          onRejected={handleRejected}
          onCancel={() => setCurrentOption('menu')}
        />
      </div>
    );
  }

  // Call Support View
  if (currentOption === 'call_support') {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div className="relative">
          <div className="merchant-avatar-lg opacity-80">
            <img 
              src={marcheIvoirien} 
              alt="Marché ivoirien"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-primary rounded-full border-2 border-white flex items-center justify-center">
            <HeadphonesIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="space-y-3 max-w-xs">
          <h3 className="text-lg font-semibold text-foreground">
            Appel au support
          </h3>
          
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

        <a href={`tel:${supportPhone.replace(/[^0-9+]/g, '')}`} className="w-full max-w-xs">
          <Button variant="default" className="w-full h-12 gap-2">
            <Phone className="w-5 h-5" />
            Appeler: {supportPhone}
          </Button>
        </a>

        <Button
          variant="ghost"
          onClick={() => setCurrentOption('menu')}
          className="text-muted-foreground"
        >
          Retour aux options
        </Button>
      </div>
    );
  }

  // Menu View (default)
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
        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Message rassurant */}
      <div className="space-y-3 max-w-xs">
        <h3 className="text-lg font-semibold text-foreground">
          On va t'aider
        </h3>
        
        <p className="text-muted-foreground">
          Je ne reconnais pas bien ta voix aujourd'hui. 
          Choisis une option pour continuer.
        </p>

        {isSpeaking && (
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {personaName} parle...
          </div>
        )}

        {(phone || merchantName) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            {merchantName && <p className="font-medium">{merchantName}</p>}
            {phone && <p className="text-muted-foreground">{phone}</p>}
          </div>
        )}
      </div>

      {/* Options de fallback */}
      <div className="w-full max-w-xs space-y-3">
        {/* Option 1: Validation agent (si marchand connu) */}
        {merchantId && phone && (
          <Button
            variant="default"
            className="w-full h-14 gap-3 justify-start px-4"
            onClick={() => {
              setCurrentOption('agent_validation');
              setTicketCreated(false);
            }}
          >
            <Shield className="w-6 h-6" />
            <div className="text-left">
              <div className="font-medium">Demander à un agent</div>
              <div className="text-xs opacity-80">Validation en ~2 min</div>
            </div>
          </Button>
        )}

        {/* Option 2: Appeler le support */}
        <Button
          variant="outline"
          className="w-full h-14 gap-3 justify-start px-4"
          onClick={() => {
            setCurrentOption('call_support');
            setTimeout(() => setTicketCreated(true), 2000);
          }}
        >
          <Phone className="w-6 h-6" />
          <div className="text-left">
            <div className="font-medium">Appeler le support</div>
            <div className="text-xs text-muted-foreground">{supportPhone}</div>
          </div>
        </Button>

        {/* Option 3: Recevoir un code SMS */}
        <Button
          variant="outline"
          className="w-full h-14 gap-3 justify-start px-4"
          onClick={onRetry}
        >
          <MessageSquare className="w-6 h-6" />
          <div className="text-left">
            <div className="font-medium">Recevoir un code SMS</div>
            <div className="text-xs text-muted-foreground">Code à 6 chiffres</div>
          </div>
        </Button>
      </div>

      {/* Note rassurante */}
      <div className="flex items-start gap-2 max-w-xs text-left bg-muted/30 rounded-lg p-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Ce problème arrive parfois avec un nouveau téléphone 
          ou depuis un endroit inhabituel.
        </p>
      </div>

      {/* Bouton réessayer */}
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Réessayer la connexion vocale
      </button>
    </div>
  );
}

export default HumanFallback;
