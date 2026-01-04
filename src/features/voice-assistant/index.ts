/**
 * Point d'entrée public du module Voice Assistant
 * Seules les API exposées ici sont considérées publiques
 */

// Page principale
export { default as VoiceAssistant } from './pages/VoiceAssistant';

// Composants
export { BigMicButton } from './components/BigMicButton';
export { VoiceModeTabs } from './components/VoiceModeTabs';
export { RecapCard } from './components/RecapCard';
export { OfflineBadge } from './components/OfflineBadge';
export { PictogramActionBar } from './components/PictogramActionBar';

// Hooks
export { useVoiceAssistantCore } from './hooks/useVoiceAssistantCore';

// Services
export { parseVoiceInput, parseFrenchNumber, extractNumbers } from './services/intentParser';
export { speak, stopSpeaking, isTTSAvailable, initVoices } from './services/textToSpeech';
export { 
  initSpeechRecognition, 
  startListening, 
  stopListening, 
  isSTTAvailable 
} from './services/speechToText';

// Types
export type {
  VoiceAssistantState,
  VoiceMode,
  VoiceIntent,
  SaleIntent,
  ControlIntent,
  StockIntent,
  ArticleIntent,
  VoiceCommand,
  ParseResult,
  TranscriptionEvent,
  TTSConfig,
  BigMicButtonProps,
  RecapCardProps
} from './types/voice.types';
