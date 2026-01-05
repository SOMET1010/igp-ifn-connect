// Auth Feature - Authentification PNAVIM Unifiée
// Protocole à 4 couches pour l'inclusion des marchands ivoiriens

// === OTP Auth Components (original) ===
export { GenericOtpLoginPage } from "./components/GenericOtpLoginPage";
export { AdminLoginPage } from "./components/AdminLoginPage";

// === Social Auth Components (merged from social-auth) ===
export { VoiceSocialAuth } from './components/VoiceSocialAuth';
export { CulturalChallenge } from './components/CulturalChallenge';
export { HumanFallback } from './components/HumanFallback';
export { PersonaSelector } from './components/PersonaSelector';
export { AgentValidationRequest } from './components/AgentValidationRequest';
export { SimpleRegistrationForm } from './components/SimpleRegistrationForm';

// === Voice Interview (merged from voice-auth) ===
export { VoiceInterviewWizard } from './components/VoiceInterviewWizard';

// === Hooks ===
export { useSocialAuth } from './hooks/useSocialAuth';
export { useDeviceFingerprint } from './hooks/useDeviceFingerprint';
export { useTrustScore } from './hooks/useTrustScore';
export { useVoiceTranscription } from './hooks/useVoiceTranscription';
export { useVoiceTranscriptionV2 } from './hooks/useVoiceTranscriptionV2';
export { useAudioLevel } from './hooks/useAudioLevel';
export { useAgentValidation } from './hooks/useAgentValidation';
export { useAuthLogging } from './hooks/useAuthLogging';
export { usePersistedPersona } from './hooks/usePersistedPersona';

// === Audio Feedback Components ===
export { AudioLevelIndicator, AudioPulse, AudioWaveform } from './components/AudioLevelIndicator';

// === Configs ===
export {
  merchantLoginConfig,
  agentLoginConfig,
  cooperativeLoginConfig,
  adminLoginConfig,
} from "./config/loginConfigs";

export { 
  PERSONAS, 
  CULTURAL_QUESTIONS, 
  TRUST_THRESHOLDS,
  FRIENDLY_ERRORS,
  type PersonaType 
} from './config/personas';

export { 
  VOICE_SCRIPTS,
  getVoiceScript,
  formatPhoneForSpeech,
  type VoiceAuthLang,
  type VoiceScriptKey
} from '@/shared/config/audio/suta';

// === Types ===
export type {
  LoginStep,
  LoginRole,
  LoginRoleConfig,
  AdminLoginConfig,
  StepConfig,
} from "./types/login.types";

// === Utils ===
export { normalizeAnswer, compareAnswers, similarityScore } from './utils/normalize';
