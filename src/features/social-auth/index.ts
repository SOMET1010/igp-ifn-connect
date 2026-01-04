// Social Auth - Authentification Sociale PNAVIM
// Protocole à 4 couches pour l'inclusion des marchands ivoiriens

// Components
export { VoiceSocialAuth } from './components/VoiceSocialAuth';
export { CulturalChallenge } from './components/CulturalChallenge';
export { HumanFallback } from './components/HumanFallback';

// Hooks
export { useSocialAuth } from './hooks/useSocialAuth';
export { useDeviceFingerprint } from './hooks/useDeviceFingerprint';
export { useTrustScore } from './hooks/useTrustScore';
export { useVoiceTranscription } from './hooks/useVoiceTranscription';
export { useElevenLabsTts } from './hooks/useElevenLabsTts';

// Config
export { 
  PERSONAS, 
  CULTURAL_QUESTIONS, 
  TRUST_THRESHOLDS,
  FRIENDLY_ERRORS,
  type PersonaType 
} from './config/personas';

// Utils
export { normalizeAnswer, compareAnswers, similarityScore } from './utils/normalize';
