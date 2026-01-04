/**
 * Configuration centralisée des voix ElevenLabs PNAVIM
 * JAMAIS utiliser d'autres voix que celles-ci
 */

export const PNAVIM_VOICES = {
  /** Tantie Sagesse - Voix féminine chaleureuse (femmes âgées, marchandes) */
  TANTIE_SAGESSE: 'PWiCgOlgDsq0Da8bhS6a',
  
  /** Gbairai - Voix dynamique (jeunes, agents) */
  GBAIRAI: 'LZZ0J6eX2D30k2TKgBOR',
  
  /** Voix par défaut pour le projet = Tantie Sagesse */
  DEFAULT: 'PWiCgOlgDsq0Da8bhS6a',
} as const;

export type PnavimVoiceId = typeof PNAVIM_VOICES[keyof typeof PNAVIM_VOICES];

/** Mapping voix par contexte/rôle */
export const VOICE_BY_CONTEXT = {
  marchand: PNAVIM_VOICES.TANTIE_SAGESSE,
  merchant: PNAVIM_VOICES.TANTIE_SAGESSE,
  agent: PNAVIM_VOICES.GBAIRAI,
  cooperative: PNAVIM_VOICES.TANTIE_SAGESSE,
  home: PNAVIM_VOICES.TANTIE_SAGESSE,
  tantie: PNAVIM_VOICES.TANTIE_SAGESSE,
  jeune: PNAVIM_VOICES.GBAIRAI,
} as const;

export type VoiceContext = keyof typeof VOICE_BY_CONTEXT;
