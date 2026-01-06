# src/shared/ - Architecture Guide

## 📁 Structure

```
src/shared/
├── contexts/       # React Contexts (Auth, Language, Audio)
├── hooks/          # Custom React hooks
├── lib/            # Utilitaires, services, validations
├── services/       # Services métier (logger, etc.)
├── types/          # Types TypeScript partagés
└── ui/             # Composants UI réutilisables
```

## 🔧 Imports

### Recommandé (Barrel Exports)

```typescript
// Hooks
import { useToast, useMobile, useOnlineStatus } from '@/shared/hooks';

// Contexts
import { useAuth, useLanguage, AuthProvider } from '@/shared/contexts';

// Lib utilities
import { cn, formatXOF, translations } from '@/shared/lib';

// Types
import { RBACPermission, RBACProfile } from '@/shared/types';

// Services
import { logger, authLogger, merchantLogger } from '@/shared/services/logger';
```

### Éviter (Legacy - Déprécié)

```typescript
// ❌ Ne plus utiliser
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// ✅ Utiliser à la place
import { cn } from '@/shared/lib';
import { useAuth } from '@/shared/contexts';
import { useToast } from '@/shared/hooks';
```

## 📦 Modules Disponibles

### Contexts (`@/shared/contexts`)
- `AuthProvider`, `useAuth` - Authentification
- `LanguageProvider`, `useLanguage` - Internationalisation
- `AudioProvider`, `useAudio` - Feedback audio

### Hooks (`@/shared/hooks`)
- `useToast` - Notifications toast
- `useMobile`, `useIsMobile` - Détection mobile
- `useOnlineStatus` - État de connexion
- `useOfflineSync` - Synchronisation offline
- `useSensoryFeedback` - Feedback haptique/audio
- `useButtonFeedback` - Feedback boutons
- `useReducedMotion` - Accessibilité animations
- `useDemoMode` - Mode démonstration
- `useMascotImage` - Images mascotte

### Lib (`@/shared/lib`)
- `cn` - Merge classNames (tailwind-merge)
- `formatXOF`, `formatNumber` - Formatage nombres
- `translations`, `LANGUAGES` - i18n
- `validateIvorianPhone` - Validation téléphone
- `compressImage` - Compression images
- `safeFetch` - Fetch avec retry
- `getOfflineQueue`, `addToOfflineQueue` - Queue offline
- `showSensoryToast` - Toast avec feedback

### Types (`@/shared/types`)
- `RBACPermission`, `RBACProfile`, `RBACResource` - Types RBAC
- Types auth (login, steps, roles)

### Services (`@/shared/services`)
- `logger` - Logger générique
- `authLogger`, `merchantLogger`, `agentLogger`, etc. - Loggers contextuels

## 🏗️ Architecture Feature-First

```
src/
├── features/           # Modules métier isolés
│   ├── auth/
│   ├── merchant/
│   ├── admin/
│   └── ...
├── shared/             # Code partagé (source of truth)
├── app/                # Configuration app (routes, providers)
├── pages/              # Pages/écrans
└── components/ui/      # Composants shadcn/ui
```

## ⚠️ Règles d'Import

1. **Features** importent depuis `@/shared/` uniquement
2. **Shared** n'importe jamais depuis `@/features/`
3. **Pages** peuvent importer depuis `@/features/` et `@/shared/`
4. **Components/ui** sont des composants de base sans logique métier

## 🔄 Migration

Les anciens chemins (`@/hooks/`, `@/lib/`, `@/contexts/`) sont encore supportés via re-exports mais sont **dépréciés**. Migrer progressivement vers `@/shared/`.
