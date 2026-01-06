/**
 * Shared Library - Barrel Export
 * Utilitaires communs réexportés depuis src/shared/lib
 */

// Core utilities
export { cn } from './utils';

// Translations
export {
  type LanguageCode,
  type LanguageInfo,
  LANGUAGES,
  translations,
  getTranslation
} from './translations';

// Toast utilities
export {
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastPromise,
  toastOffline,
  toastSyncSuccess,
  toastNetworkError,
  toastSessionExpired
} from './toast-utils';

// Geo utilities
export {
  calculateDistance,
  formatDistance,
  getCurrentPosition
} from './geoUtils';

// Image utilities
export { compressImage, compressBase64Image } from './imageCompression';

// Audio service
export { playPrerecordedAudio, stopAudio } from './audioService';

// Offline DB
export {
  openDB,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromQueue,
  updateQueueItem,
  clearQueue,
  setCachedData,
  getCachedData,
  clearExpiredCache,
  type OfflineItem
} from './offlineDB';

// Safe fetch
export { safeFetch, safeFetchWithRetry } from './safeFetch';

// Sensory toast
export { sensoryToast } from './sensoryToast';

// Validation schemas
export {
  phoneSchema,
  phoneLocalSchema,
  phoneFullSchema,
  phoneLocalOptionalSchema,
  normalizePhoneCI,
  formatPhoneCI,
  isValidCIPhonePrefix,
  emailSchema,
  passwordSchema,
  strongPasswordSchema,
  fullNameSchema,
  otpSchema,
  loginFormSchema,
  signupFormSchema,
  phoneLoginSchema,
  getZodErrorMessage,
  validateField,
  getValidationError,
  type LoginFormData,
  type SignupFormData,
  type PhoneLoginData
} from './validationSchemas';

// Mock data (pour dev/démo)
export {
  mockMerchant,
  mockWalletBalance,
  mockTransactions,
  mockProducts,
  mockDashboardStats,
  mockNotifications,
  getMockData
} from './mockData';
