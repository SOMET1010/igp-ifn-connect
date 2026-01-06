/**
 * Shared module - Re-exports centralisés
 * Single Source of Truth pour types, hooks et lib partagés
 */

// Types (includes errors, ui, web-apis, realtime, auth)
export * from './types';

// Hooks (excluding ErrorCode which is already in types)
export {
  useIsMobile,
  useReducedMotion,
  useToast,
  toast,
  useButtonFeedback,
  useSensoryFeedback,
  useOnlineStatus,
  useOfflineSync,
  useRetryOperation,
  withRetry,
  useDemoMode,
  useErrorHandler,
  useMascotImage,
  usePhotoUpload,
  usePushNotifications,
  useTimeOfDay,
  useTts,
  useVoiceQueue,
} from './hooks';
export type { FeedbackType, TimeOfDay, ErrorContext } from './hooks';

// Lib utilities
export * from './lib';

// Contexts
export * from './contexts';
