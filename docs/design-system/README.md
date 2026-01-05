# PNAVIM Design System

> **Source unique de vérité** pour toutes les décisions visuelles de l'application PNAVIM-CI.

## 🎨 Philosophie

PNAVIM est une application **inclusive** destinée aux commerçants ivoiriens, souvent sur le terrain avec des conditions variées :
- Écrans de tailles diverses (smartphone entrée de gamme à tablette)
- Connexion réseau parfois instable
- Utilisateurs de tous niveaux d'alphabétisation

### Principes Directeurs

1. **Mobile-First** : Conception pour petit écran d'abord
2. **Touch-First** : Zones tactiles de 48px minimum
3. **Inclusive** : Pictogrammes + texte, audio optionnel
4. **Lisible** : Contraste WCAG AA minimum

---

## 🎨 Palette de Couleurs

### Couleurs Identitaires (Immuables)

| Nom | HEX | HSL | Usage |
|-----|-----|-----|-------|
| **Primary** (Orange PNAVIM) | `#E36A00` | `24 100% 45%` | Actions principales, CTA "Vendre" |
| **Primary Hover** | `#cc5f00` | `24 100% 40%` | État hover du primary |
| **Primary Light** | `#FFF0E5` | `30 100% 95%` | Fonds légers orange |
| **Secondary** (Vert PNAVIM) | `#1F8A3B` | `142 63% 33%` | Succès, Argent, Agents |
| **Secondary Hover** | `#187030` | `142 63% 28%` | État hover du secondary |
| **Secondary Light** | `#E8F5EC` | `142 50% 93%` | Fonds légers verts |

### Couleurs Fonctionnelles

| Nom | HEX | HSL | Usage |
|-----|-----|-----|-------|
| **Background** | `#FFF6EC` | `30 100% 97%` | Fond d'écran principal (sable clair) |
| **Surface** | `#FFFFFF` | `0 0% 100%` | Cartes, modales |
| **Foreground** | `#2E2E2E` | `0 0% 18%` | Texte principal |
| **Muted** | `#757575` | `0 0% 46%` | Texte secondaire, placeholders |
| **Destructive** | `#D32F2F` | `0 73% 50%` | Erreurs, actions dangereuses |
| **Destructive Light** | `#FFEBEE` | `0 100% 95%` | Fond d'erreur |
| **Warning** | `#FBC02D` | `45 97% 58%` | Alertes, attention |
| **Warning Light** | `#FFF8E1` | `45 100% 95%` | Fond d'alerte |
| **Border** | `#E5E7EB` | `220 13% 91%` | Bordures subtiles |

### Classes Tailwind

```tsx
// ✅ Correct - Utiliser les tokens PNAVIM
<Button className="bg-pnavim-primary text-white" />
<Card className="bg-pnavim-surface border-pnavim-border" />
<p className="text-pnavim-foreground" />
<span className="text-pnavim-muted" />

// ✅ Correct - Utiliser les variables CSS shadcn
<Button className="bg-primary text-primary-foreground" />
<Card className="bg-card text-card-foreground" />

// ❌ Interdit - Couleurs natives Tailwind pour éléments identitaires
<Button className="bg-orange-500" /> // NON
<Card className="bg-green-600" /> // NON
```

---

## 📝 Typographie

### Familles de Polices

| Police | Usage | Fallback |
|--------|-------|----------|
| **Nunito** | Titres, headings, boutons | `sans-serif` |
| **Inter** | Corps de texte, labels | `system-ui, sans-serif` |

### Échelle Typographique

| Classe | Taille | Usage |
|--------|--------|-------|
| `text-2xs` | 0.625rem (10px) | Mentions légales |
| `text-xs` | 0.75rem (12px) | Captions, badges |
| `text-sm` | 0.875rem (14px) | Labels, texte secondaire |
| `text-base` | 1rem (16px) | Corps de texte standard |
| `text-lg` | 1.125rem (18px) | Sous-titres |
| `text-xl` | 1.25rem (20px) | Titres de sections |
| `text-xxl` | 1.375rem (22px) | Titres de pages |
| `text-2xl` | 1.5rem (24px) | Titres importants |
| `text-3xl` | 1.875rem (30px) | Statistiques, montants |

### Tokens Typographiques

```ts
// Définis dans src/styles/design-tokens.ts
PNAVIM_TYPOGRAPHY = {
  title: 'text-xl font-bold text-pnavim-foreground',
  subtitle: 'text-lg font-semibold text-pnavim-foreground',
  body: 'text-base text-pnavim-foreground',
  caption: 'text-sm text-pnavim-muted',
  stat: 'text-3xl font-bold',
}
```

---

## 📏 Espacement

### Système de Grille (4px)

PNAVIM utilise une grille de 4px. Tous les espacements sont des multiples de 4.

| Token | Valeur | Tailwind |
|-------|--------|----------|
| `--space-1` | 4px | `p-1`, `m-1`, `gap-1` |
| `--space-2` | 8px | `p-2`, `m-2`, `gap-2` |
| `--space-3` | 12px | `p-3`, `m-3`, `gap-3` |
| `--space-4` | 16px | `p-4`, `m-4`, `gap-4` |
| `--space-5` | 20px | `p-5`, `m-5`, `gap-5` |
| `--space-6` | 24px | `p-6`, `m-6`, `gap-6` |
| `--space-8` | 32px | `p-8`, `m-8`, `gap-8` |

### Conteneur Standard Mobile

```ts
// Défini dans src/styles/design-tokens.ts
PNAVIM_SPACING = {
  container: 'max-w-md mx-auto px-4',  // 448px max, 16px padding
  touchTarget: 'min-h-[48px]',          // Standard accessibilité
  cardPadding: 'p-4',                   // 16px
  sectionGap: 'gap-4',                  // 16px entre sections
}
```

---

## 🎯 Accessibilité

### Règles Obligatoires

1. **Zones tactiles** : Minimum 48×48px pour tous les éléments interactifs
2. **Contraste** : WCAG AA minimum (4.5:1 pour texte, 3:1 pour UI)
3. **Focus visible** : Outline de 3px primary sur `:focus-visible`
4. **Reduced motion** : Respecter `prefers-reduced-motion`

### Classes Utilitaires

```tsx
// Zone tactile accessible
<Button className="min-h-[48px] min-w-[48px]" />

// Skip link (navigation clavier)
<a href="#main" className="skip-link">Aller au contenu</a>

// Focus visible amélioré (automatique via index.css)
:focus-visible {
  outline: 3px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### Mode Contraste Élevé

```tsx
// Activer le mode high-contrast
<html className="high-contrast">
```

---

## 🎭 Ombres (Box Shadows)

### Ombres PNAVIM

| Classe | Usage |
|--------|-------|
| `shadow-pnavim-primary` | Boutons primary, CTA principaux |
| `shadow-pnavim-secondary` | Boutons secondary, validations |
| `shadow-pnavim-warning` | Alertes, avertissements |
| `shadow-pnavim-muted` | Cartes standard |

### Effets Glow

| Classe | Usage |
|--------|-------|
| `shadow-glow-primary` | Halo lumineux orange (actions principales) |
| `shadow-glow-secondary` | Halo lumineux vert (succès, validations) |
| `shadow-glow-warning` | Halo lumineux jaune (attention) |
| `shadow-glow-destructive` | Halo lumineux rouge (danger) |

```tsx
// Bouton avec glow
<Button className="shadow-glow-primary hover:shadow-glow-primary" />

// Carte avec ombre subtile
<Card className="shadow-pnavim-muted" />
```

---

## 🔲 Border Radius

| Token | Valeur | Usage |
|-------|--------|-------|
| `rounded-sm` | 4px | Badges, petits éléments |
| `rounded-md` | 6px | Inputs, boutons standards |
| `rounded-lg` | 8px | Cartes, modales |
| `rounded-xl` | 12px | Grandes cartes, boutons CTA |
| `rounded-2xl` | 16px | Boutons tactiles inclusifs |
| `rounded-3xl` | 24px | Éléments arrondis proéminents |
| `rounded-full` | 50% | Avatars, boutons icônes |

---

## 🧩 Composants Standards

### Boutons

```tsx
// Bouton Primary (action principale)
<Button className="bg-primary text-primary-foreground min-h-[48px]">
  Valider
</Button>

// Bouton Secondary
<Button variant="secondary" className="min-h-[48px]">
  Annuler
</Button>

// Bouton Outline
<Button variant="outline" className="min-h-[48px]">
  Options
</Button>

// Bouton Destructive
<Button variant="destructive" className="min-h-[48px]">
  Supprimer
</Button>
```

### États des Composants

| État | Classe/Style |
|------|--------------|
| **Default** | Style de base |
| **Hover** | Légèrement plus foncé, `scale(1.02)` |
| **Active/Pressed** | `scale(0.95)`, couleur plus saturée |
| **Focus** | Outline primary 3px |
| **Disabled** | `opacity-50`, `cursor-not-allowed` |
| **Loading** | Spinner + texte "Chargement..." |
| **Error** | Border destructive |
| **Success** | Border/bg secondary |

### Composants State

```tsx
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateComponents';

// Chargement
<LoadingState message="Chargement des données..." />

// Erreur avec retry
<ErrorState 
  title="Erreur de connexion"
  message="Impossible de charger les données"
  onRetry={() => refetch()}
/>

// Vide
<EmptyState
  title="Aucun produit"
  description="Ajoutez votre premier produit"
  actionLabel="Ajouter"
  onAction={() => navigate('/add')}
/>
```

---

## 🎬 Animations

### Animations Standard

| Classe | Durée | Usage |
|--------|-------|-------|
| `animate-fade-in` | 0.3s | Apparition d'éléments |
| `animate-slide-up` | 0.4s | Montée de modales/sheets |
| `animate-scale-in` | 0.2s | Apparition avec zoom |
| `animate-pulse-ring` | 1.5s | Bouton micro, notifications |
| `animate-bounce-gentle` | 2s | Appel à l'action subtil |

### Micro-interactions KPATA

```css
/* Défini dans index.css */
.kpata-interactive {
  @apply transition-all duration-150 ease-out;
}
.kpata-interactive:hover { transform: scale(1.02); }
.kpata-interactive:active { transform: scale(0.95); }
```

---

## 📱 Breakpoints

| Nom | Min-width | Usage |
|-----|-----------|-------|
| `sm` | 640px | Téléphones paysage |
| `md` | 768px | Tablettes |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Grand desktop |
| `2xl` | 1400px | Très grand écran |

### Conteneur Responsive

```tsx
<div className="container max-w-md mx-auto px-4 sm:max-w-lg md:max-w-2xl">
  {/* Contenu */}
</div>
```

---

## ⚠️ Règles Interdites

### NE PAS UTILISER

```tsx
// ❌ Couleurs Tailwind natives pour identité PNAVIM
bg-orange-500, text-green-600, border-yellow-400

// ❌ Shadows legacy
shadow-africa, shadow-forest, shadow-gold
glow-orange, glow-green, glow-gold

// ❌ Variables CSS legacy
var(--orange), var(--green), var(--gold), var(--earth)
var(--terre-battue), var(--orange-sanguine), var(--sable)
var(--charbon), var(--vert-manioc)
```

### UTILISER À LA PLACE

```tsx
// ✅ Tokens PNAVIM
bg-pnavim-primary, text-pnavim-secondary, border-pnavim-border

// ✅ Shadows PNAVIM
shadow-pnavim-primary, shadow-pnavim-secondary

// ✅ Variables shadcn (mappées vers PNAVIM)
bg-primary, text-secondary, border-border
```

---

## 📦 Fichiers de Référence

| Fichier | Contenu |
|---------|---------|
| `src/styles/design-tokens.ts` | Tokens TypeScript (couleurs, spacing, typo) |
| `tailwind.config.ts` | Configuration Tailwind avec tokens PNAVIM |
| `src/index.css` | Variables CSS, animations, classes utilitaires |
| `src/components/ui/*` | Composants shadcn/ui |
| `src/components/shared/*` | Composants PNAVIM partagés |

---

## 🔄 Migration depuis Legacy

Si vous trouvez du code utilisant les anciennes classes :

| Legacy | PNAVIM |
|--------|--------|
| `shadow-africa` | `shadow-pnavim-primary` |
| `shadow-forest` | `shadow-pnavim-secondary` |
| `shadow-gold` | `shadow-pnavim-warning` |
| `glow-orange` | `shadow-glow-primary` |
| `glow-green` | `shadow-glow-secondary` |
| `bg-orange` | `bg-pnavim-primary` |
| `bg-green` | `bg-pnavim-secondary` |

---

*Dernière mise à jour : Phase 4 du refactoring PNAVIM*
