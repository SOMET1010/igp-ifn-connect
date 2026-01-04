/**
 * Personas PNAVIM - Authentification Sociale Inclusive
 * Tantie Sagesse pour les femmes âgées, Gbairai pour les jeunes
 */

export type PersonaType = 'tantie' | 'jeune';

export interface Persona {
  name: string;
  avatar: string;
  voiceId?: string; // ElevenLabs voice ID
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
    voiceId: 'zMDaFembtPriQKXI1MGS', // Voix clonée Tantie Sagesse PNAVIM
    greetings: {
      welcome: "Bonne arrivée mon enfant ! C'est qui est là ?",
      listen: "Dis-moi ton numéro de téléphone, je t'écoute...",
      recognized: "Ah ! {name} ! Ça va bien ? Entre donc.",
      doubt: "Je ne te reconnais pas bien aujourd'hui...",
      challenge: "Rappelle-moi le prénom de ta maman ?",
      error: "Mon enfant, on va appeler quelqu'un pour t'aider. Ne quitte pas.",
      success: "C'est bon mon enfant, tu peux entrer !"
    }
  },
  jeune: {
    name: 'Gbairai',
    avatar: '/lovable-uploads/gbairai.png',
    voiceId: 'wZM0gfJ4eOdCRsqygbFq', // Voix clonée Gbairai PNAVIM
    greetings: {
      welcome: "Yo ! C'est qui là ? Dis ton numéro !",
      listen: "Je t'écoute, envoie le numéro !",
      recognized: "Ehhh {name} ! T'es là ! Entre vite !",
      doubt: "Attends... Je te calcule pas trop là...",
      challenge: "Dis-moi, c'est quoi ton surnom au quartier ?",
      error: "Frère, y'a un souci. On va appeler le boss.",
      success: "C'est carré ! Tu peux go !"
    }
  }
};

// Questions culturelles pour le Layer 3
export const CULTURAL_QUESTIONS = {
  mother_name: {
    fr: "Rappelle-moi le prénom de ta maman ?",
    nouchi: "C'est comment ta daronne s'appelle ?",
    dioula: "I ba tɔgɔ ye mun ye?"
  },
  market_name: {
    fr: "Tu vends dans quel marché d'habitude ?",
    nouchi: "Tu taffes dans quel marché ?",
    dioula: "I bɛ fɛɛrɛ sugu jumɛn na?"
  },
  neighborhood: {
    fr: "C'est quoi ton surnom au quartier ?",
    nouchi: "On t'appelle comment au grin ?",
    dioula: "I tɔgɔ caman ye mun ye?"
  },
  first_product: {
    fr: "Quel produit tu as vendu en premier ici ?",
    nouchi: "C'est quoi tu as vendu first time ici ?",
    dioula: "I ye mun fɛɛrɛ fɔlɔ la yan?"
  }
};

// Seuils de confiance
export const TRUST_THRESHOLDS = {
  DIRECT_ACCESS: 70,   // Score >= 70 = Accès direct
  CHALLENGE: 40,       // Score 40-69 = Question culturelle
  HUMAN_FALLBACK: 0    // Score < 40 = Intervention humaine
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
