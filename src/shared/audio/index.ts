/**
 * Système audio unifié - Exports publics
 */

// Core
export { AudioManager } from './core/AudioManager';
export * from './core/types';

// Recording
export { AudioRecorderService } from './recording/AudioRecorder';
export type { RecorderEventHandlers } from './recording/AudioRecorder';

// Analysis
export { AudioAnalyzerService } from './analysis/AudioAnalyzer';
export type { AudioLevelData, AudioLevelStatus } from './analysis/AudioAnalyzer';

// TTS
export { TTSManager } from './tts/TTSManager';

// Hooks
export { useRecorder } from './hooks/useRecorder';
export type { UseRecorderReturn } from './hooks/useRecorder';

export { useAudioLevel } from './hooks/useAudioLevel';
export type { UseAudioLevelReturn } from './hooks/useAudioLevel';

export { useTts } from './hooks/useTts';
export type { UseTtsReturn } from './hooks/useTts';
