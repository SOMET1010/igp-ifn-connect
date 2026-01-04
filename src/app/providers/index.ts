/**
 * Providers - Contextes React centralisés
 * 
 * Export depuis les contextes existants pour transition douce
 */

// Re-export des providers existants
export { AuthProvider, useAuth } from '@/contexts/AuthContext';
export { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
export { AudioProvider, useAudioContext } from '@/contexts/AudioContext';
