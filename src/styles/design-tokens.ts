// ============================================
// PNAVIM DESIGN TOKENS - SOURCE UNIQUE DE VÉRITÉ
// ============================================
// RÈGLE: Si une couleur n'est pas ici, elle est INTERDITE

export const PNAVIM_COLORS = {
  // COULEURS IDENTITAIRES (Immuables)
  primary: '#E36A00',      // Orange PNAVIM (Action principale, Vendre)
  primaryHover: '#cc5f00',
  primaryLight: '#FFF0E5', // Fond orange clair
  
  secondary: '#1F8A3B',    // Vert PNAVIM (Argent, Succès, Agent)
  secondaryHover: '#187030',
  secondaryLight: '#E8F5EC', // Fond vert clair

  // COULEURS FONCTIONNELLES
  background: '#FFF6EC',   // Sable clair (Fond d'écran chaud)
  surface: '#FFFFFF',      // Blanc (Cartes)
  
  foreground: '#2E2E2E',   // Charbon (Texte principal - lisibilité max)
  muted: '#757575',        // Gris neutre (Texte secondaire)
  
  destructive: '#D32F2F',  // Rouge (Danger, Annuler)
  destructiveLight: '#FFEBEE',
  warning: '#FBC02D',      // Jaune (Attention)
  warningLight: '#FFF8E1',
  
  border: '#E5E7EB',       // Gris très clair (Bordures subtiles)
} as const;

// Convertir HEX en HSL pour Tailwind
export const PNAVIM_HSL = {
  primary: '24 100% 45%',
  primaryHover: '24 100% 40%',
  secondary: '142 63% 33%',
  secondaryHover: '142 63% 28%',
  background: '30 100% 97%',
  surface: '0 0% 100%',
  foreground: '0 0% 18%',
  muted: '0 0% 46%',
  destructive: '0 73% 50%',
  warning: '45 97% 58%',
  border: '220 13% 91%',
} as const;

export const PNAVIM_SPACING = {
  container: 'max-w-md mx-auto px-4', // Conteneur mobile standard
  touchTarget: 'min-h-[48px]',        // Standard accessibilité tactile (48px min)
  cardPadding: 'p-4',                 // Padding standard cartes
  sectionGap: 'gap-4',                // Espacement entre sections
} as const;

export const PNAVIM_TYPOGRAPHY = {
  title: 'text-xl font-bold text-pnavim-foreground',
  subtitle: 'text-lg font-semibold text-pnavim-foreground',
  body: 'text-base text-pnavim-foreground',
  caption: 'text-sm text-pnavim-muted',
  stat: 'text-3xl font-bold',
} as const;

export type PnavimColor = keyof typeof PNAVIM_COLORS;
