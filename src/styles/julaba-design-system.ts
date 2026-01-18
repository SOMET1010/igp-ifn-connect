/**
 * ============================================
 * JÙLABA DESIGN SYSTEM
 * "Ton djè est bien géré" 
 * ============================================
 * 
 * Philosophie: Voice-First, Zero Text, Inclusif
 * Cible: Marchandes rurales, faible littératie
 * 
 * RÈGLES D'OR:
 * 1. Pictogrammes > Texte (toujours)
 * 2. Boutons géants (min 56px tactile)
 * 3. 1 action par écran
 * 4. Feedback immédiat (son + visuel)
 * 5. Ton maternel, jamais bancaire
 */

// ============================================
// COULEURS JÙLABA (Chaleur africaine)
// ============================================
export const JULABA_COLORS = {
  // Primaire - Orange Mangue (Chaleur, Action)
  mango: {
    50: '#FFF8F0',
    100: '#FFF0E0',
    200: '#FFE0C0',
    300: '#FFCC99',
    400: '#FFB366',
    500: '#FF9933',  // PRIMARY - Orange vif
    600: '#E67300',
    700: '#CC6600',
    800: '#994D00',
    900: '#663300',
  },
  
  // Secondaire - Vert Avocat (Confiance, Argent)
  avocado: {
    50: '#F0FFF4',
    100: '#E0FFEC',
    200: '#B8F5D0',
    300: '#7AE8A8',
    400: '#38D67A',  // SUCCESS - Vert vif
    500: '#1DB954',  // SECONDARY
    600: '#159A44',
    700: '#0F7A35',
    800: '#0A5A27',
    900: '#053A18',
  },
  
  // Accent - Soleil Doré (Mise en avant)
  sun: {
    300: '#FFE066',
    400: '#FFD633',
    500: '#FFCC00',  // ACCENT
    600: '#E6B800',
  },
  
  // Neutres - Terre (Fond chaleureux)
  earth: {
    50: '#FFFBF5',   // Background principal
    100: '#FFF6EB',
    200: '#F5EBE0',
    300: '#E8DED3',
    400: '#D4C5B5',
    500: '#A89585',
    600: '#7A6B5A',
    700: '#5C4E3F',
    800: '#3D3327',
    900: '#1F1A14',
  },
  
  // Danger
  danger: {
    400: '#FF6B6B',
    500: '#EE5252',
    600: '#DC3545',
  },
} as const;

// ============================================
// TOKENS CSS VARIABLES (HSL pour Tailwind)
// ============================================
export const JULABA_CSS_VARS = {
  // Backgrounds
  '--julaba-bg': '30 100% 98%',           // earth.50
  '--julaba-surface': '0 0% 100%',        // Blanc pur
  '--julaba-surface-warm': '30 50% 97%',  // Beige chaud
  
  // Primary (Mango)
  '--julaba-primary': '30 100% 60%',      // mango.500
  '--julaba-primary-light': '30 100% 70%',
  '--julaba-primary-dark': '27 100% 45%',
  '--julaba-primary-glow': '30 100% 60% / 0.4',
  
  // Secondary (Avocado)
  '--julaba-secondary': '145 74% 42%',    // avocado.500
  '--julaba-secondary-light': '145 70% 55%',
  '--julaba-secondary-dark': '145 74% 32%',
  
  // Text
  '--julaba-text': '20 15% 15%',          // Charbon chaud
  '--julaba-text-muted': '20 10% 45%',
  '--julaba-text-inverse': '0 0% 100%',
  
  // Accents
  '--julaba-accent': '45 100% 50%',       // sun.500
  '--julaba-danger': '0 80% 60%',
  
  // Borders
  '--julaba-border': '30 20% 88%',
  '--julaba-border-focus': '30 100% 60%',
} as const;

// ============================================
// DIMENSIONS INCLUSIVES
// ============================================
export const JULABA_SIZES = {
  // Touch targets (WCAG minimum 44px, nous utilisons 56px+)
  touchMin: 56,        // Bouton standard
  touchLarge: 72,      // Bouton important
  touchHero: 96,       // Bouton CTA principal
  touchVoice: 110,     // Bouton micro
  
  // Border radius
  radiusSoft: 16,      // Cartes
  radiusPill: 9999,    // Boutons arrondis
  radiusButton: 20,    // Boutons standards
  
  // Spacing
  gapTight: 8,
  gapNormal: 16,
  gapLarge: 24,
  gapSection: 32,
  
  // Container
  maxWidth: 428,       // iPhone 14 Pro Max width
} as const;

// ============================================
// TYPOGRAPHY INCLUSIVE (Grand et lisible)
// ============================================
export const JULABA_TYPOGRAPHY = {
  // Font family - Nunito (arrondi, amical)
  fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif",
  
  // Sizes
  hero: {
    size: '2rem',      // 32px - Titre principal
    weight: 800,
    lineHeight: 1.2,
  },
  title: {
    size: '1.5rem',    // 24px - Titre section
    weight: 700,
    lineHeight: 1.3,
  },
  subtitle: {
    size: '1.125rem', // 18px - Sous-titre
    weight: 600,
    lineHeight: 1.4,
  },
  body: {
    size: '1rem',      // 16px - Corps
    weight: 500,
    lineHeight: 1.5,
  },
  bodyLarge: {
    size: '1.125rem', // 18px - Corps emphase
    weight: 500,
    lineHeight: 1.5,
  },
  caption: {
    size: '0.875rem', // 14px - Légende
    weight: 400,
    lineHeight: 1.4,
  },
  stat: {
    size: '2.5rem',    // 40px - Chiffres clés
    weight: 800,
    lineHeight: 1.1,
  },
} as const;

// ============================================
// ANIMATIONS JÙLABA (Feedback sensoriel)
// ============================================
export const JULABA_ANIMATIONS = {
  // Durées
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
  
  // Easings
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Keyframes
  pulseWarm: `
    @keyframes pulse-warm {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 hsl(30 100% 60% / 0.4); }
      50% { transform: scale(1.02); box-shadow: 0 0 30px 10px hsl(30 100% 60% / 0.2); }
    }
  `,
  pressDown: `
    @keyframes press-down {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
  `,
  slideUp: `
    @keyframes slide-up-julaba {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  voicePulse: `
    @keyframes voice-pulse {
      0% { box-shadow: 0 0 0 0 hsl(145 74% 42% / 0.7); }
      70% { box-shadow: 0 0 0 25px hsl(145 74% 42% / 0); }
      100% { box-shadow: 0 0 0 0 hsl(145 74% 42% / 0); }
    }
  `,
} as const;

// ============================================
// COMPOSANTS PRÉDÉFINIS (Classes Tailwind)
// ============================================
export const JULABA_COMPONENTS = {
  // Bouton CTA géant (VENDRE, INSCRIRE)
  buttonHero: `
    min-h-[96px] w-full rounded-[24px] 
    bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]
    text-white font-extrabold text-2xl
    shadow-[0_8px_32px_-8px_hsl(30_100%_50%/0.5)]
    active:scale-95 transition-transform duration-150
    flex items-center justify-center gap-4
  `,
  
  // Bouton secondaire
  buttonSecondary: `
    min-h-[56px] px-6 rounded-[16px]
    bg-white border-2 border-[hsl(30_100%_60%)]
    text-[hsl(27_100%_45%)] font-semibold text-lg
    active:scale-95 transition-transform duration-150
  `,
  
  // Bouton micro (Voice)
  buttonVoice: `
    w-[110px] h-[110px] rounded-full
    bg-gradient-to-br from-[hsl(30_100%_60%)] to-[hsl(27_100%_50%)]
    border-4 border-white
    shadow-[0_8px_32px_-4px_hsl(30_100%_50%/0.5)]
    flex items-center justify-center
    active:scale-92 transition-transform duration-100
  `,
  
  // Carte standard
  card: `
    bg-white rounded-[20px] p-5
    border border-[hsl(30_20%_90%)]
    shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)]
  `,
  
  // Carte stat avec icône
  cardStat: `
    bg-white rounded-[20px] p-4
    border border-[hsl(30_20%_90%)]
    flex items-center gap-4
  `,
  
  // Navigation bottom
  bottomNav: `
    fixed bottom-0 left-0 right-0
    bg-white border-t border-[hsl(30_20%_90%)]
    px-4 py-3 pb-safe
    flex justify-around items-center
    max-w-[428px] mx-auto
  `,
  
  // Item navigation
  navItem: `
    flex flex-col items-center gap-1
    min-w-[64px] py-2 px-3 rounded-2xl
    transition-colors duration-150
  `,
  navItemActive: `
    bg-[hsl(30_100%_95%)] text-[hsl(27_100%_45%)]
  `,
  navItemInactive: `
    text-[hsl(20_10%_50%)]
  `,
} as const;

// ============================================
// PICTOGRAMMES UNIVERSELS (Emoji + couleurs)
// ============================================
export const JULABA_ICONS = {
  // Actions principales
  sell: { emoji: '🛒', color: 'mango.500', label: 'Vendre' },
  money: { emoji: '💰', color: 'avocado.500', label: 'Argent' },
  stock: { emoji: '📦', color: 'sun.500', label: 'Marchandise' },
  profile: { emoji: '👤', color: 'earth.500', label: 'Moi' },
  home: { emoji: '🏠', color: 'mango.400', label: 'Accueil' },
  
  // Agent
  register: { emoji: '📝', color: 'avocado.500', label: 'Inscrire' },
  people: { emoji: '👥', color: 'mango.500', label: 'Mes gens' },
  stats: { emoji: '📊', color: 'sun.500', label: 'Activité' },
  
  // États
  success: { emoji: '✅', color: 'avocado.500', label: 'Fait' },
  warning: { emoji: '⚠️', color: 'sun.500', label: 'Attention' },
  error: { emoji: '❌', color: 'danger.500', label: 'Erreur' },
  voice: { emoji: '🎤', color: 'mango.500', label: 'Parler' },
  
  // Temps
  today: { emoji: '☀️', color: 'sun.500', label: "Aujourd'hui" },
  history: { emoji: '📜', color: 'earth.500', label: 'Historique' },
} as const;

// ============================================
// EXPORT TYPE HELPERS
// ============================================
export type JulabaColor = keyof typeof JULABA_COLORS;
export type JulabaIcon = keyof typeof JULABA_ICONS;
export type JulabaComponent = keyof typeof JULABA_COMPONENTS;
