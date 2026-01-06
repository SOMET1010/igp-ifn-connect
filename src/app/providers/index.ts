/**
 * Providers - Contextes React centralisés
 * 
 * Export depuis les contextes existants pour transition douce
 */

// Re-export des providers depuis shared/contexts
export { AuthProvider, useAuth } from '@/shared/contexts';
export { LanguageProvider, useLanguage } from '@/shared/contexts';
export { AudioProvider, useAudioContext } from '@/shared/contexts';
