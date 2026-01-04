/**
 * Personas PNAVIM - Authentification Sociale Inclusive
 * Tantie Sagesse pour les femmes âgées, Gbairai pour les jeunes
 */

import { PNAVIM_VOICES } from '@/shared/config/voiceConfig';

export type PersonaType = 'tantie' | 'jeune';

export interface Persona {
  name: string;
  avatar: string;
  voiceId: string; // ElevenLabs voice ID
  greetings: {
    welcome: string;
    listen: string;
    recognized: string;
    doubt: string;
    challenge: string;
    error: string;
    success: string;
  };
}

export const PERSONAS: Record<PersonaType, Persona> = {
  tantie: {
    name: 'Tantie Sagesse',
    avatar: '/lovable-uploads/tantie-sagesse.png',
    voiceId: PNAVIM_VOICES.TANTIE_SAGESSE, // PWiCgOlgDsq0Da8bhS6a
    greetings: {
      welcome: "Bonne arrivée mon enfant ! Que Dieu bénisse ton marché aujourd'hui.",
      listen: "Je t'écoute. Donne-moi doucement ton numéro de téléphone.",
      recognized: "Ah {name}, c'est toi ! J'espère que la famille se porte bien.",
      doubt: "Pardon, je n'ai pas bien vu ton visage. Rapproche-toi un peu mon enfant.",
      challenge: "Pour être sûre que c'est bien toi, rappelle-moi juste le nom de ta maman ?",
      error: "Ça ne passe pas, mais ne t'inquiète pas. On appelle l'agent, il arrive tout de suite.",
      success: "Voilà, c'est ouvert ! Tu peux faire tes opérations."
    }
  },
  jeune: {
    name: 'Gbairai',
    avatar: '/lovable-uploads/gbairai.png',
    voiceId: PNAVIM_VOICES.GBAIRAI, // LZZ0J6eX2D30k2TKgBOR
    greetings: {
      welcome: "Salut le Boss ! Prêt à faire bouger les choses aujourd'hui ?",
      listen: "Vas-y, je t'écoute. Donne-moi ton numéro.",
      recognized: "Ah {name}, te voilà ! Toujours fidèle au poste.",
      doubt: "Attends une seconde, je ne te reconnais pas bien. Rapproche-toi un peu.",
      challenge: "Petit contrôle de sécurité rapide. Rappelle-moi ton surnom ?",
      error: "Il y a un petit souci technique. On appelle l'agent pour régler ça vite fait.",
      success: "C'est validé ! Tout est propre. On peut avancer."
    }
  }
};

// Questions culturelles pour le Layer 3
export const CULTURAL_QUESTIONS = {
  mother_name: {
    fr: "Pour être sûre que c'est bien toi, rappelle-moi juste le nom de ta maman ?",
    nouchi: "Petit contrôle rapide. C'est quoi le nom de ta maman ?",
    dioula: "I ba tɔgɔ ye mun ye?"
  },
  market_name: {
    fr: "Tu vends dans quel marché d'habitude ?",
    nouchi: "Tu taffes dans quel marché ?",
    dioula: "I bɛ fɛɛrɛ sugu jumɛn na?"
  },
  neighborhood: {
    fr: "C'est quoi ton surnom au quartier ?",
    nouchi: "Rappelle-moi ton surnom ?",
    dioula: "I tɔgɔ caman ye mun ye?"
  },
  first_product: {
    fr: "Quel produit tu as vendu en premier ici ?",
    nouchi: "C'est quoi tu as vendu first time ici ?",
    dioula: "I ye mun fɛɛrɛ fɔlɔ la yan?"
  }
};

// Seuils de confiance (ajustés pour être plus inclusifs)
export const TRUST_THRESHOLDS = {
  DIRECT_ACCESS: 60,   // Score >= 60 = Accès direct (🟢)
  CHALLENGE: 30,       // Score 30-59 = Question sociale simple (🟠)
  HUMAN_FALLBACK: 0    // Score < 30 = Intervention humaine (🔴)
};

// Messages d'erreur inclusifs (jamais techniques)
export const FRIENDLY_ERRORS = {
  network: {
    fr: "La connexion est difficile. On réessaie ?",
    nouchi: "Le réseau est chaud là. On go encore ?"
  },
  mic_denied: {
    fr: "Je n'arrive pas à t'entendre. Tu peux taper ton numéro.",
    nouchi: "J'entends rien oh. Tape ton numéro plutôt."
  },
  not_recognized: {
    fr: "Je ne reconnais pas ce numéro. C'est la première fois ici ?",
    nouchi: "Ce numéro-là, je connais pas. C'est ton first time ici ?"
  }
};
