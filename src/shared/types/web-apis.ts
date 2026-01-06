/**
 * Types pour Web APIs non standard (Speech Recognition, Audio, etc.)
 * Élimine les `as any` dans les hooks voice/audio
 */

// === Speech Recognition API ===

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: 
    | 'no-speech'
    | 'aborted'
    | 'audio-capture'
    | 'network'
    | 'not-allowed'
    | 'service-not-allowed'
    | 'bad-grammar'
    | 'language-not-supported';
  readonly message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  onaudiostart: ((event: Event) => void) | null;
  onspeechstart: ((event: Event) => void) | null;
  onspeechend: ((event: Event) => void) | null;
  
  start(): void;
  stop(): void;
  abort(): void;
}

export interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

// === WebOTP API ===

export interface OTPCredential extends Credential {
  readonly code: string;
}

export interface OTPCredentialRequestOptions {
  otp: { transport: ('sms')[] };
  signal?: AbortSignal;
}

// === Extended Window avec APIs non-standard ===

export interface ExtendedWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
  webkitAudioContext?: typeof AudioContext;
}

// === Sentry (optionnel) ===

export interface SentryInstance {
  captureException: (error: Error | unknown, context?: Record<string, unknown>) => void;
  captureMessage: (message: string, level?: 'fatal' | 'error' | 'warning' | 'info') => void;
}

export interface WindowWithSentry extends Window {
  Sentry?: SentryInstance;
}

// === Helpers ===

/**
 * Récupère SpeechRecognition de manière type-safe
 */
export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as ExtendedWindow;
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

/**
 * Récupère AudioContext de manière type-safe (avec fallback webkit)
 */
export function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as ExtendedWindow;
  return window.AudioContext || win.webkitAudioContext || null;
}

/**
 * Vérifie si Sentry est disponible
 */
export function getSentry(): SentryInstance | null {
  if (typeof window === 'undefined') return null;
  const win = window as WindowWithSentry;
  return win.Sentry || null;
}
