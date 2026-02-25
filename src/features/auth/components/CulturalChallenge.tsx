import React, { useState, useCallback, useEffect } from 'react';
import { Mic, Loader2, Send, RefreshCw } from 'lucide-react';
import { cn } from '@/shared/lib';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AudioBars } from '@/features/merchant/components/AudioBars';
import { useTts } from '@/shared/hooks/useTts';
import marcheIvoirien from '@/assets/marche-ivoirien.jpg';

interface CulturalChallengeProps {
  question: string;
  personaName: string;
  personaAvatar: string;
  voiceId: string;
  onAnswer: (answer: string) => Promise<boolean>;
  onCancel: () => void;
  isLoading: boolean;
  attemptsLeft?: number;
}

type InputMode = 'voice' | 'text';
type MicState = 'idle' | 'listening' | 'processing';

/**
 * CulturalChallenge - Layer 3 du protocole d'authentification sociale
 * 
 * Pose une question culturelle/personnelle pour vérifier l'identité
 * quand le score de confiance est insuffisant.
 * Utilise la voix clonée du persona (Tantie Sagesse / Gbairai).
 */
export function CulturalChallenge({
  question,
  personaName,
  personaAvatar,
  voiceId,
  onAnswer,
  onCancel,
  isLoading,
  attemptsLeft = 3,
}: CulturalChallengeProps) {
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [micState, setMicState] = useState<MicState>('idle');
  const [textAnswer, setTextAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');
  const [hasPlayedQuestion, setHasPlayedQuestion] = useState(false);

  // Hook TTS ElevenLabs avec voix clonée
  const { speak, isSpeaking, stop } = useTts({
    voiceId: voiceId as import('@/shared/config/voiceConfig').JulabaVoiceId,
    onStart: () => {
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }
  });

  // Auto-play question avec voix clonée
  useEffect(() => {
    if (hasPlayedQuestion) return;
    
    const timer = setTimeout(() => {
      speak(question);
      setHasPlayedQuestion(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [speak, question, hasPlayedQuestion]);

  const handleMicClick = useCallback(() => {
    if (isLoading) return;
    
    // Arrêter le TTS si en cours
    stop();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    if (micState === 'idle') {
      setMicState('listening');
      
      // Simulate voice recognition (in production, use ElevenLabs STT)
      setTimeout(() => {
        setMicState('processing');
        
        setTimeout(async () => {
          setMicState('idle');
          // Demo: simulate voice answer
          const success = await onAnswer('Awa'); // Simulated answer
          if (!success) {
            setAttempts(prev => prev + 1);
            setError('Je n\'ai pas compris. Essaie encore.');
            // Relire la question
            speak(question);
          }
        }, 1500);
      }, 3000);
    } else {
      setMicState('idle');
    }
  }, [isLoading, micState, onAnswer, stop, speak, question]);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textAnswer.trim() || isLoading) return;
    
    setError('');
    const success = await onAnswer(textAnswer.trim());
    
    if (!success) {
      setAttempts(prev => prev + 1);
      setError('Réponse incorrecte. Essaie encore.');
      setTextAnswer('');
      // Relire la question avec la voix clonée
      speak(question);
    }
  };

  const remainingAttempts = attemptsLeft - attempts;

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      {/* Avatar avec expression dubitative */}
      <div className="relative">
        <div className="merchant-avatar-lg opacity-90">
          <img 
            src={marcheIvoirien} 
            alt="Marché ivoirien"
            className="w-full h-full object-cover grayscale-[30%]"
          />
        </div>
        {/* Badge doute */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white text-lg">
          ?
        </div>
      </div>

      {/* Message de doute */}
      <div className="text-center space-y-2 max-w-xs">
        <p className="text-muted-foreground text-sm">
          {personaName} a besoin de te vérifier...
        </p>
        <p className="text-foreground font-medium text-lg">
          "{question}"
        </p>
        
        {/* Indicateur TTS */}
        {isSpeaking && (
          <div className="flex items-center justify-center gap-1.5 text-primary text-xs">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            {personaName} parle...
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Tentatives restantes */}
      {remainingAttempts < attemptsLeft && (
        <div className="flex gap-1">
          {Array.from({ length: attemptsLeft }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < remainingAttempts ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {remainingAttempts} essai{remainingAttempts > 1 ? 's' : ''} restant{remainingAttempts > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {inputMode === 'voice' ? (
        <>
          {/* Bouton micro pour répondre */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading || remainingAttempts <= 0 || isSpeaking}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center transition-all",
              "bg-primary hover:bg-primary/90 shadow-lg",
              micState === 'listening' && 'animate-pulse ring-4 ring-primary/30',
              micState === 'processing' && 'bg-amber-500',
              (isLoading || remainingAttempts <= 0 || isSpeaking) && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Répondre vocalement"
          >
            {micState === 'processing' || isLoading ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Mic className={cn(
                "w-8 h-8 text-white transition-transform",
                micState === 'listening' && 'scale-110'
              )} />
            )}
          </button>

          <AudioBars isActive={micState === 'listening'} />

          <p className="text-center text-muted-foreground text-sm">
            {isSpeaking && 'Écoute...'}
            {!isSpeaking && micState === 'idle' && 'Appuie pour répondre'}
            {!isSpeaking && micState === 'listening' && "Je t'écoute..."}
            {!isSpeaking && micState === 'processing' && 'Vérification...'}
          </p>

          {/* Switch to text */}
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            📝 Répondre par écrit
          </button>
        </>
      ) : (
        <form onSubmit={handleTextSubmit} className="w-full max-w-xs space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Ta réponse..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="pr-12 h-12"
              autoFocus
              disabled={isLoading || remainingAttempts <= 0}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1 top-1 h-10 w-10"
              disabled={!textAnswer.trim() || isLoading || remainingAttempts <= 0}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            🎤 Répondre vocalement
          </button>
        </form>
      )}

      {/* Bouton annuler */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
      >
        <RefreshCw className="w-4 h-4" />
        Recommencer
      </button>
    </div>
  );
}

export default CulturalChallenge;
