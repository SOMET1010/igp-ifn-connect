// Barrel export for shared hooks

// UI & Responsive
export { useIsMobile } from './use-mobile';
export { useReducedMotion } from './useReducedMotion';

// Toast (shadcn)
export { useToast, toast } from './use-toast';

// Feedback
export { useButtonFeedback } from './useButtonFeedback';
export { useSensoryFeedback, type FeedbackType } from './useSensoryFeedback';

// Network & Offline
export { useOnlineStatus } from './useOnlineStatus';
export { useOfflineSync } from './useOfflineSync';
export { useRetryOperation, withRetry } from './useRetryOperation';

// Demo
export { useDemoMode } from './useDemoMode';

// Error handling
export { useErrorHandler, type ErrorCode, type ErrorContext } from './useErrorHandler';

// Media & Assets
export { useMascotImage } from './useMascotImage';
export { usePhotoUpload } from './usePhotoUpload';

// Notifications
export { usePushNotifications } from './usePushNotifications';

// Time
export { useTimeOfDay, type TimeOfDay } from './useTimeOfDay';

// TTS & Voice (existing)
export { useTts } from './useTts';
export { useVoiceQueue } from './useVoiceQueue';
