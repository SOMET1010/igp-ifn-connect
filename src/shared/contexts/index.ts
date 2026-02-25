/**
 * Shared Contexts - Barrel Export
 * Contextes React réexportés depuis src/shared/contexts
 */

// Auth Context
export { AuthProvider, useAuth } from './AuthContext';

// Language Context
export { LanguageProvider, useLanguage } from './LanguageContext';

// Audio Context
export { AudioProvider, useAudioContext } from './AudioContext';

// Design Mode Context (Dual mode: Institutional / Terrain)
export { DesignModeProvider, useDesignMode } from './DesignModeContext';
