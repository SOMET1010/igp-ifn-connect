# Architecture du Projet IFN

## Structure des Dossiers

```
src/
├── assets/              # Images, logos, assets statiques
├── components/          # Composants réutilisables
│   ├── admin/           # Composants spécifiques admin
│   │   └── map/         # Cartographie admin (MapFilters, MapLegend, mapIcons)
│   ├── agent/           # Composants spécifiques agent
│   │   └── enrollment/  # Wizard d'enrôlement (Step1-5)
│   ├── auth/            # Authentification (OTPInput, ProtectedRoute)
│   ├── cooperative/     # Composants coopérative
│   │   ├── orders/      # Gestion commandes (OrderCard, CancelOrderDialog)
│   │   └── stock/       # Gestion stock (StockCard, LowStockAlert, AddStockDialog)
│   ├── ifn/             # Composants institutionnels IFN
│   ├── market/          # Composants marché
│   ├── merchant/        # Composants marchand
│   │   └── stock/       # Gestion stock (StockCard, StockAlerts, dialogs)
│   ├── shared/          # Composants partagés (headers, navs, états)
│   ├── studio/          # Composants enregistrement audio
│   └── ui/              # Composants shadcn/ui
├── contexts/            # Contextes React (Auth, Language)
├── hooks/               # Hooks personnalisés
│   ├── useDataFetching.ts    # Hook générique fetch avec retry
│   ├── useMerchantStock.ts   # Logique stock marchand
│   ├── useCooperativeStock.ts # Logique stock coopérative
│   ├── useCooperativeOrders.ts # Logique commandes coopérative
│   ├── useAdminMapData.ts    # Données cartographie
│   ├── useOfflineSync.ts     # Synchronisation hors-ligne
│   └── ...
├── infra/               # Infrastructure (logger centralisé)
├── integrations/        # Intégrations externes (Supabase client)
├── lib/                 # Utilitaires
│   ├── validationSchemas.ts  # Schémas Zod
│   ├── offlineDB.ts          # IndexedDB pour offline
│   ├── imageCompression.ts   # Compression images
│   └── ...
├── pages/               # Pages de l'application
│   ├── admin/           # Pages admin
│   ├── agent/           # Pages agent
│   ├── cooperative/     # Pages coopérative
│   └── merchant/        # Pages marchand
└── shared/              # Types et constantes partagés
    └── types/           # Types TypeScript (errors, ui, index)
```

## Patterns Utilisés

### 1. Séparation Logique / UI
- **Hooks** contiennent la logique métier (`useMerchantStock`, `useCooperativeOrders`)
- **Components** sont purement présentationnels
- **Pages** orchestrent les composants et hooks

### 2. Gestion des Erreurs
- **AppError** (`src/shared/types/errors.ts`) - classe d'erreur standardisée
- **useDataFetching** - hook avec retry automatique et gestion d'état
- **ErrorBoundary** - capture erreurs React

### 3. Logging Centralisé
- **logger** (`src/infra/logger.ts`) - remplace console.*
- Loggers pré-configurés: `authLogger`, `merchantLogger`, `agentLogger`, `coopLogger`, `adminLogger`, `syncLogger`
- Stockage local pour debug

### 4. Validation
- **Zod** pour validation des formulaires (`src/lib/validationSchemas.ts`)
- Schémas réutilisables: phone, email, password, OTP

### 5. Types Centralisés
- **`src/shared/types/index.ts`** - dérivés du schéma Supabase
- Single Source of Truth pour les types métier

### 6. Authentification
- **AuthContext** - gestion session et rôles
- **ProtectedRoute** - garde les routes protégées
- **Rôles** stockés dans `user_roles` (jamais dans profiles)

### 7. Mode Hors-ligne
- **IndexedDB** pour stockage local
- **useOfflineSync** - queue et synchronisation
- **Service Worker** pour PWA

## Conventions de Nommage

- **Components**: PascalCase (`StockCard.tsx`)
- **Hooks**: camelCase avec prefix `use` (`useMerchantStock.ts`)
- **Pages**: PascalCase (`MerchantDashboard.tsx`)
- **Types**: PascalCase (`MerchantStatus`)
- **Constantes**: SCREAMING_SNAKE_CASE

## Règles de Refactoring

1. **Aucun fichier > 300 lignes** - split en hooks et composants
2. **Un composant = une responsabilité**
3. **Hooks pour la logique réutilisable**
4. **Types dans `shared/types` pour les données métier**
5. **Logger centralisé au lieu de console.**

## Dépendances Clés

- **React 18** + TypeScript
- **Vite** - bundler
- **Tailwind CSS** - styling
- **shadcn/ui** - composants UI
- **Supabase** - backend (via Lovable Cloud)
- **React Query** - cache et synchronisation
- **Zod** - validation
- **Recharts** - graphiques
- **Leaflet** - cartographie
