/**
 * Configuration centralisée des voix ElevenLabs JÙLABA
 * JAMAIS utiliser d'autres voix que celles-ci
 */

export const JULABA_VOICES = {
  /** Tantie Sagesse - Voix féminine chaleureuse (femmes âgées, marchandes) */
  TANTIE_SAGESSE: 'PWiCgOlgDsq0Da8bhS6a',
  
  /** Gbairai - Voix dynamique (jeunes, agents) */
  GBAIRAI: 'LZZ0J6eX2D30k2TKgBOR',
  
  /** Voix par défaut pour le projet = Tantie Sagesse */
  DEFAULT: 'PWiCgOlgDsq0Da8bhS6a',
} as const;

/** @deprecated Utiliser JULABA_VOICES */
export const PNAVIM_VOICES = JULABA_VOICES;

export type JulabaVoiceId = typeof JULABA_VOICES[keyof typeof JULABA_VOICES];
/** @deprecated Utiliser JulabaVoiceId */
export type PnavimVoiceId = JulabaVoiceId;

/** Mapping voix par contexte/rôle */
export const VOICE_BY_CONTEXT = {
  marchand: JULABA_VOICES.TANTIE_SAGESSE,
  merchant: JULABA_VOICES.TANTIE_SAGESSE,
  agent: JULABA_VOICES.GBAIRAI,
  cooperative: JULABA_VOICES.TANTIE_SAGESSE,
  home: JULABA_VOICES.TANTIE_SAGESSE,
  tantie: JULABA_VOICES.TANTIE_SAGESSE,
  jeune: JULABA_VOICES.GBAIRAI,
} as const;

export type VoiceContext = keyof typeof VOICE_BY_CONTEXT;
