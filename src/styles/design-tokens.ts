// ============================================
// JÙLABA DESIGN TOKENS - SOURCE UNIQUE DE VÉRITÉ
// ============================================
// RÈGLE: Si une couleur n'est pas ici, elle est INTERDITE
// Documentation complète: docs/design-system/README.md

export const JULABA_COLORS = {
  // COULEURS IDENTITAIRES (Immuables)
  primary: '#E36A00',      // Orange JÙLABA (Action principale, Vendre)
  primaryHover: '#cc5f00',
  primaryLight: '#FFF0E5', // Fond orange clair
  
  secondary: '#1F8A3B',    // Vert JÙLABA (Argent, Succès, Agent)
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

/** @deprecated Utiliser JULABA_COLORS */
export const PNAVIM_COLORS = JULABA_COLORS;

// Convertir HEX en HSL pour Tailwind
export const JULABA_HSL = {
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

/** @deprecated Utiliser JULABA_HSL */
export const PNAVIM_HSL = JULABA_HSL;

// ============================================
// SHADOWS JÙLABA
// ============================================
export const JULABA_SHADOWS = {
  primary: 'shadow-julaba-primary',
  secondary: 'shadow-julaba-secondary',
  warning: 'shadow-julaba-warning',
  muted: 'shadow-julaba-muted',
  // Glow effects
  glowPrimary: 'shadow-glow-primary',
  glowSecondary: 'shadow-glow-secondary',
  glowWarning: 'shadow-glow-warning',
  glowDestructive: 'shadow-glow-destructive',
} as const;

/** @deprecated Utiliser JULABA_SHADOWS */
export const PNAVIM_SHADOWS = JULABA_SHADOWS;

// ============================================
// SPACING
// ============================================
export const JULABA_SPACING = {
  container: 'max-w-md mx-auto px-4', // Conteneur mobile standard
  touchTarget: 'min-h-[48px]',        // Standard accessibilité tactile (48px min)
  cardPadding: 'p-4',                 // Padding standard cartes
  sectionGap: 'gap-4',                // Espacement entre sections
} as const;

/** @deprecated Utiliser JULABA_SPACING */
export const PNAVIM_SPACING = JULABA_SPACING;

// ============================================
// TYPOGRAPHY
// ============================================
export const JULABA_TYPOGRAPHY = {
  title: 'text-xl font-bold text-julaba-foreground',
  subtitle: 'text-lg font-semibold text-julaba-foreground',
  body: 'text-base text-julaba-foreground',
  caption: 'text-sm text-julaba-muted',
  stat: 'text-3xl font-bold',
} as const;

/** @deprecated Utiliser JULABA_TYPOGRAPHY */
export const PNAVIM_TYPOGRAPHY = JULABA_TYPOGRAPHY;

// ============================================
// BREAKPOINTS
// ============================================
export const JULABA_BREAKPOINTS = {
  sm: '640px',   // Téléphones paysage
  md: '768px',   // Tablettes
  lg: '1024px',  // Desktop
  xl: '1280px',  // Grand desktop
  '2xl': '1400px', // Très grand écran
} as const;

/** @deprecated Utiliser JULABA_BREAKPOINTS */
export const PNAVIM_BREAKPOINTS = JULABA_BREAKPOINTS;

// ============================================
// ANIMATIONS
// ============================================
export const JULABA_ANIMATIONS = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  scaleIn: 'animate-scale-in',
  pulseRing: 'animate-pulse-ring',
  bounceGentle: 'animate-bounce-gentle',
} as const;

/** @deprecated Utiliser JULABA_ANIMATIONS */
export const PNAVIM_ANIMATIONS = JULABA_ANIMATIONS;

// ============================================
// TYPES
// ============================================
export type JulabaColor = keyof typeof JULABA_COLORS;
export type JulabaShadow = keyof typeof JULABA_SHADOWS;
export type JulabaAnimation = keyof typeof JULABA_ANIMATIONS;

/** @deprecated */
export type PnavimColor = JulabaColor;
/** @deprecated */
export type PnavimShadow = JulabaShadow;
/** @deprecated */
export type PnavimAnimation = JulabaAnimation;
