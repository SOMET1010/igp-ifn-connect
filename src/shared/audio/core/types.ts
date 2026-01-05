/**
 * Types partagés pour le système audio unifié
 */

export type RecorderState = 'idle' | 'requesting' | 'recording' | 'stopped' | 'error';

export type TTSProvider = 'elevenlabs' | 'webspeech';

export type TTSPriority = 'low' | 'normal' | 'high' | 'immediate';

export interface RecorderOptions {
  maxDuration?: number; // en secondes
  chunkInterval?: number; // en ms
  mimeType?: string;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface TTSOptions {
  provider?: TTSProvider;
  voiceId?: string;
  priority?: TTSPriority;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export interface AudioLevelConfig {
  smoothingWindow?: number; // ms pour moyenne glissante
  silenceThreshold?: number;
  lowThreshold?: number;
  updateInterval?: number; // ms
}

export interface AudioCapabilities {
  hasMediaRecorder: boolean;
  hasGetUserMedia: boolean;
  hasSpeechSynthesis: boolean;
  supportedMimeTypes: string[];
}

export interface MicrophonePermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

export const DEFAULT_RECORDER_OPTIONS: RecorderOptions = {
  maxDuration: 60,
  chunkInterval: 500,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export const DEFAULT_TTS_OPTIONS: TTSOptions = {
  provider: 'elevenlabs',
  priority: 'normal',
  rate: 1,
  pitch: 1,
  volume: 1,
};

export const DEFAULT_AUDIO_LEVEL_CONFIG: AudioLevelConfig = {
  smoothingWindow: 200,
  silenceThreshold: 0.03,
  lowThreshold: 0.08,
  updateInterval: 50,
};

// Mime types supportés par ordre de préférence
export const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
  'audio/mpeg',
];
