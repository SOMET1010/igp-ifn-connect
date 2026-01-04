/**
 * VoiceAssistant - Page principale de l'assistant vocal unifié
 * 3 modes : Caisse / Articles / Stock
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import { useVoiceAssistantCore } from '../hooks/useVoiceAssistantCore';
import { BigMicButton } from '../components/BigMicButton';
import { VoiceModeTabs } from '../components/VoiceModeTabs';
import { RecapCard } from '../components/RecapCard';
import { OfflineBadge } from '../components/OfflineBadge';
import { PictogramActionBar } from '../components/PictogramActionBar';
import { VOICE_SCRIPTS } from '@/shared/config/audio/voiceAssistantScripts';
import { speak } from '../services/textToSpeech';
import type { VoiceMode, VoiceCommand } from '../types/voice.types';

export default function VoiceAssistant() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<VoiceMode>('cashier');
  const [isMuted, setIsMuted] = useState(false);
  
  // Callbacks pour les actions confirmées
  const handleSaleConfirmed = useCallback((command: VoiceCommand) => {
    console.log('[VoiceAssistant] Vente confirmée:', command);
    toast.success('Vente enregistrée !');
    // TODO: Intégrer avec le service de ventes
  }, []);
  
  const handleStockUpdated = useCallback((command: VoiceCommand) => {
    console.log('[VoiceAssistant] Stock mis à jour:', command);
    toast.success('Stock mis à jour !');
    // TODO: Intégrer avec le service de stock
  }, []);
  
  const handleArticleCreated = useCallback((command: VoiceCommand) => {
    console.log('[VoiceAssistant] Article créé:', command);
    toast.success('Article créé !');
    // TODO: Intégrer avec le service d'articles
  }, []);
  
  const {
    state,
    isListening,
    isProcessing,
    isOffline,
    transcript,
    lastCommand,
    startVoice,
    stopVoice,
    confirm,
    cancel,
    repeat,
    sayText,
    isTTSAvailable,
    isSTTAvailable
  } = useVoiceAssistantCore({
    mode,
    onSaleConfirmed: handleSaleConfirmed,
    onStockUpdated: handleStockUpdated,
    onArticleCreated: handleArticleCreated
  });
  
  const handleMicPress = useCallback(() => {
    if (isListening) {
      stopVoice();
    } else {
      startVoice();
    }
  }, [isListening, startVoice, stopVoice]);
  
  const handleHelp = useCallback(() => {
    sayText(VOICE_SCRIPTS.control.help);
  }, [sayText]);
  
  const handleModeChange = useCallback((newMode: VoiceMode) => {
    setMode(newMode);
    // Feedback vocal du changement de mode
    const modeNames = {
      cashier: 'Mode caisse',
      article: 'Mode articles',
      stock: 'Mode stock'
    };
    if (!isMuted) {
      speak(modeNames[newMode]);
    }
  }, [isMuted]);
  
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);
  
  // Message selon l'état
  const getStatusMessage = () => {
    switch (state) {
      case 'listening':
        return 'Je t\'écoute...';
      case 'processing':
        return 'Je réfléchis...';
      case 'confirming':
        return 'Tu confirmes ?';
      case 'success':
        return 'C\'est noté !';
      case 'error':
        return 'Réessaie';
      default:
        return 'Appuie pour parler';
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={24} />
          </Button>
          
          <h1 className="text-lg font-semibold">Assistant Vocal</h1>
          
          <div className="flex items-center gap-2">
            <OfflineBadge isOffline={isOffline} />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Onglets de mode */}
      <div className="px-4 py-3">
        <VoiceModeTabs 
          mode={mode} 
          onModeChange={handleModeChange}
          disabled={isListening}
        />
      </div>
      
      {/* Zone principale */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {/* Transcript en cours */}
        {transcript && (
          <div className="w-full max-w-md mb-6 p-4 bg-muted rounded-xl text-center">
            <p className="text-lg italic text-muted-foreground">
              "{transcript}"
            </p>
          </div>
        )}
        
        {/* Carte de récapitulatif */}
        {lastCommand && state === 'confirming' && (
          <div className="w-full max-w-md mb-6">
            <RecapCard
              mode={mode}
              command={lastCommand}
              onConfirm={confirm}
              onCancel={cancel}
              onRepeat={repeat}
            />
          </div>
        )}
        
        {/* Bouton micro central */}
        <div className="my-8">
          <BigMicButton
            isListening={isListening}
            isProcessing={isProcessing}
            isOffline={isOffline}
            onPress={handleMicPress}
            size="xl"
          />
        </div>
        
        {/* Message de statut */}
        <p className="text-lg text-center text-muted-foreground mb-4">
          {getStatusMessage()}
        </p>
        
        {/* Avertissement si pas de support */}
        {(!isSTTAvailable || !isTTSAvailable) && (
          <p className="text-xs text-amber-600 text-center mb-4">
            {!isSTTAvailable && "Reconnaissance vocale non disponible. "}
            {!isTTSAvailable && "Synthèse vocale non disponible."}
          </p>
        )}
      </main>
      
      {/* Barre d'actions pictogrammes */}
      <div className="border-t bg-background">
        <PictogramActionBar
          onConfirm={confirm}
          onCancel={cancel}
          onRepeat={repeat}
          onHelp={handleHelp}
          showMic={false}
          disabled={state === 'idle'}
        />
      </div>
    </div>
  );
}
