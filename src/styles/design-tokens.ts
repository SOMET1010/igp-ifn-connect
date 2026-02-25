// ============================================
// JÙLABA DESIGN TOKENS - SOURCE UNIQUE DE VÉRITÉ
// ============================================
// RÈGLE: Si une couleur n'est pas ici, elle est INTERDITE
// Documentation complète: docs/design-system/README.md

// ============================================
// MODE INSTITUTIONNEL (ANSUT / GovTech / Jury)
// Bleu ANSUT + Orange accent, Montserrat/Roboto, sobre
// ============================================
export const ANSUT_COLORS = {
  primary: '#004A8F',       // Bleu ANSUT officiel
  primaryHover: '#003A72',
  primaryLight: '#E8F0FA',
  
  accent: '#E67E22',        // Orange institutionnel ANSUT
  accentHover: '#D35400',
  accentLight: '#FEF0E0',
  
  secondary: '#1F8A3B',     // Vert validation
  secondaryLight: '#E8F5EC',
  
  background: '#F8FAFC',    // Gris-bleu très clair (pro)
  surface: '#FFFFFF',
  
  foreground: '#1A1A2E',    // Bleu-noir profond
  muted: '#64748B',         // Gris slate
  
  destructive: '#DC2626',
  warning: '#F59E0B',
  
  border: '#E2E8F0',        // Gris-bleu subtil
} as const;

export const ANSUT_HSL = {
  primary: '210 100% 28%',
  primaryHover: '210 100% 22%',
  primaryLight: '213 60% 95%',
  accent: '28 81% 52%',
  accentHover: '20 100% 41%',
  accentLight: '33 96% 94%',
  secondary: '142 63% 33%',
  secondaryLight: '140 35% 93%',
  background: '210 40% 98%',
  surface: '0 0% 100%',
  foreground: '234 30% 14%',
  muted: '215 16% 47%',
  destructive: '0 84% 50%',
  warning: '38 92% 50%',
  border: '214 32% 91%',
} as const;

// ============================================
// MODE TERRAIN (JÙLABA / Marchands / Inclusif)
// Orange chaud + Vert forêt, Nunito, chaleureux
// ============================================
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
// DESIGN SYSTEM COMMUN (partagé entre modes)
// ============================================

export const DESIGN_SYSTEM = {
  // Spacing scale (8px base)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  // Border radius scale
  radius: {
    none: '0',
    sm: '0.375rem',    // 6px - boutons compacts
    md: '0.5rem',      // 8px - inputs, cartes pro
    lg: '0.75rem',     // 12px - cartes standard
    xl: '1rem',        // 16px - cartes terrain
    '2xl': '1.5rem',   // 24px - cartes hero
    full: '9999px',    // pills, avatars
  },
  // Shadow scale
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    institutional: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
  },
  // Typography
  fonts: {
    institutional: "'Montserrat', 'Inter', system-ui, sans-serif",
    terrain: "'Nunito', 'Segoe UI', system-ui, sans-serif",
  },
  // Touch targets
  touch: {
    min: '44px',       // WCAG AA minimum
    voiceFirst: '56px', // Voice-First UX
    hero: '64px',       // CTA principaux
  },
} as const;

// ============================================
// COULEURS PAR RÔLE (partagé)
// ============================================
export const ROLE_COLORS = {
  merchant: { hsl: '28 95% 55%', label: 'Orange' },
  agent: { hsl: '160 50% 40%', label: 'Émeraude' },
  cooperative: { hsl: '270 50% 55%', label: 'Violet' },
  admin: { hsl: '210 100% 28%', label: 'Bleu ANSUT' },
} as const;

// ============================================
// COULEURS ÉTAT (partagé)
// ============================================
export const STATE_COLORS = {
  success: { hsl: '142 63% 33%', bg: '140 35% 93%', icon: '✓' },
  error: { hsl: '0 84% 50%', bg: '0 80% 95%', icon: '✕' },
  warning: { hsl: '38 92% 50%', bg: '40 90% 95%', icon: '⚠' },
  info: { hsl: '210 100% 28%', bg: '213 60% 95%', icon: 'ℹ' },
  pending: { hsl: '45 90% 55%', bg: '45 90% 95%', icon: '⏳' },
  active: { hsl: '142 63% 33%', bg: '140 35% 93%', icon: '●' },
  inactive: { hsl: '0 0% 46%', bg: '0 0% 95%', icon: '○' },
} as const;

// ============================================
// SHADOWS JÙLABA
// ============================================
export const JULABA_SHADOWS = {
  primary: 'shadow-julaba-primary',
  secondary: 'shadow-julaba-secondary',
  warning: 'shadow-julaba-warning',
  muted: 'shadow-julaba-muted',
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
  container: 'max-w-md mx-auto px-4',
  touchTarget: 'min-h-[48px]',
  cardPadding: 'p-4',
  sectionGap: 'gap-4',
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
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1400px',
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
export type DesignMode = 'institutional' | 'terrain';
export type JulabaColor = keyof typeof JULABA_COLORS;
export type JulabaShadow = keyof typeof JULABA_SHADOWS;
export type JulabaAnimation = keyof typeof JULABA_ANIMATIONS;

/** @deprecated */
export type PnavimColor = JulabaColor;
/** @deprecated */
export type PnavimShadow = JulabaShadow;
/** @deprecated */
export type PnavimAnimation = JulabaAnimation;
