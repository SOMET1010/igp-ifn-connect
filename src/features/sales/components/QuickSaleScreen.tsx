/**
 * Écran de vente rapide vocale - P.NA.VIM
 * UX: gros boutons, 3 actions max, mode 5 secondes
 */

import { useState, useEffect, useCallback } from 'react';
import { Mic, Volume2, X, Check, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuickSale } from '../hooks/useQuickSale';
import { getSpeechRecognitionConstructor, type SpeechRecognitionEvent } from '@/shared/types';

interface QuickSaleScreenProps {
  onClose?: () => void;
}

export function QuickSaleScreen({ onClose }: QuickSaleScreenProps) {
  const { state, start, processVoiceInput, confirm, cancel, getConfirmationText, getSuccessText } = useQuickSale();
  const [isRecording, setIsRecording] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Fonction speak avec Web Speech API
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Surveillance réseau
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-start au montage
  useEffect(() => {
    start();
    speak("Dites votre vente. Par exemple: 3 tomates 500 francs");
  }, [start, speak]);

  // Parler selon l'étape
  useEffect(() => {
    if (state.step === 'confirm') speak(getConfirmationText());
    else if (state.step === 'success') speak(getSuccessText());
    else if (state.step === 'error' && state.error) speak(state.error);
  }, [state.step, state.error, speak, getConfirmationText, getSuccessText]);

  const handleStartRecording = useCallback(() => {
    const SpeechRecognitionClass = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionClass) {
      toast.error('Reconnaissance vocale non supportée');
      return;
    }
    const recognition = new SpeechRecognitionClass();
    recognition.lang = 'fr-FR';
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      processVoiceInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    setIsRecording(true);
    recognition.start();
  }, [processVoiceInput]);

  const handleRepeat = useCallback(() => {
    if (state.step === 'confirm') speak(getConfirmationText());
    else speak("Dites votre vente. Par exemple: 3 tomates 500 francs");
  }, [state.step, speak, getConfirmationText]);

  const getStepContent = () => {
    switch (state.step) {
      case 'listening':
      case 'idle':
        return (
          <div className="flex flex-col items-center gap-6">
            <p className="text-xl text-center text-muted-foreground">Appuyez sur le micro et parlez</p>
            <motion.button
              className={`w-40 h-40 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-primary'}`}
              onClick={handleStartRecording}
              whileTap={{ scale: 0.95 }}
            >
              <Mic className="w-20 h-20 text-primary-foreground" />
            </motion.button>
            <p className="text-sm text-muted-foreground">{isRecording ? "J'écoute..." : "🎤 Parler"}</p>
          </div>
        );
      case 'parsing':
        return (
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-16 h-16 animate-spin text-primary" />
            <p className="text-xl">Analyse...</p>
          </div>
        );
      case 'confirm':
        return (
          <div className="flex flex-col items-center gap-6 w-full">
            <Card className="w-full p-6 bg-primary/10 border-primary">
              <div className="text-center space-y-2">
                <p className="text-3xl font-bold">{state.input?.quantity} {state.input?.product}</p>
                {state.input?.totalAmount && <p className="text-2xl text-primary">{state.input.totalAmount.toLocaleString()} FCFA</p>}
              </div>
            </Card>
            <p className="text-lg text-muted-foreground">C'est bon ?</p>
            <div className="flex gap-4 w-full">
              <Button variant="outline" size="lg" className="flex-1 h-16" onClick={cancel}><X className="w-6 h-6 mr-2" />Non</Button>
              <Button size="lg" className="flex-1 h-16 bg-green-600" onClick={confirm}><Check className="w-6 h-6 mr-2" />Oui</Button>
            </div>
          </div>
        );
      case 'processing':
        return <div className="flex flex-col items-center gap-4"><RefreshCw className="w-16 h-16 animate-spin text-primary" /><p>Enregistrement...</p></div>;
      case 'success':
        return (
          <motion.div className="flex flex-col items-center gap-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center"><Check className="w-12 h-12 text-white" /></div>
            <p className="text-2xl font-bold text-green-600">C'est noté !</p>
            {!isOnline && <p className="text-sm text-muted-foreground flex items-center gap-2"><WifiOff className="w-4 h-4" />Sync plus tard</p>}
          </motion.div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center"><X className="w-12 h-12 text-red-500" /></div>
            <p className="text-lg text-center text-muted-foreground">{state.error}</p>
            <Button onClick={start}>Réessayer</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center gap-2"><h1 className="text-xl font-bold">P.NA.VIM</h1><span className="text-muted-foreground">Vente Rapide</span></div>
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-yellow-500" />}
          {onClose && <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>}
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div key={state.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-md">{getStepContent()}</motion.div>
        </AnimatePresence>
      </div>
      <div className="p-4 border-t flex justify-center">
        <Button variant="outline" size="lg" onClick={handleRepeat}><Volume2 className="w-5 h-5 mr-2" />Répéter</Button>
      </div>
    </div>
  );
}
