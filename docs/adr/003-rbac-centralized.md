# ADR-003: RBAC Centralisé

## Statut

**Accepté**

## Date

2026-01

## Contexte

Le contrôle d'accès était dispersé dans le code :
- Vérifications dans les composants
- Logique dupliquée dans les guards
- Permissions codées en dur dans les routes

Problèmes :
1. Incohérences entre les points de contrôle
2. Difficile à auditer
3. Risque de failles de sécurité

## Décision

Créer une **source unique de vérité** pour le RBAC dans `src/domain/rbac.ts` :

```typescript
// Types de rôles (depuis Supabase)
export type AppRole = 'admin' | 'agent' | 'cooperative' | 'merchant' | 'user';

// Pages autorisées par rôle
export const ROLE_PAGES = {
  merchant: ['dashboard', 'cashier', 'stock', ...],
  agent: ['dashboard', 'merchants', 'enrollment', ...],
  // ...
};

// Actions autorisées par rôle
export const ROLE_ACTIONS = {
  merchant: ['sell', 'view_stock', ...],
  admin: ['*'], // Toutes les actions
  // ...
};

// Helpers
export function hasPermission(role: AppRole, action: string): boolean;
export function canAccessPage(role: AppRole, page: string): boolean;
```

Les routes utilisent le RBAC via le guard `RequireRole` :

```tsx
<Route element={<RequireRole requiredRole="merchant" />}>
  <Route path="/marchand" element={<MerchantDashboard />} />
</Route>
```

## Alternatives considérées

1. **RBAC dans la base de données uniquement**
   - Avantages : Source de vérité unique
   - Inconvénients : Latence, pas de contrôle côté client

2. **RBAC par feature**
   - Avantages : Encapsulation
   - Inconvénients : Duplication, incohérences possibles

## Conséquences

### Positives

- Source unique de vérité auditable
- Helpers typés et testables
- Facile d'ajouter de nouveaux rôles/permissions
- Synchronisé avec l'enum Supabase `app_role`

### Négatives

- Doit rester synchronisé avec les RLS policies
- Le fichier peut devenir volumineux

## Architecture de sécurité

```
┌─────────────────────────────────────────────────────────┐
│ Client                                                   │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│ │ RequireRole │  │ hasPermis-  │  │ canAccess-  │       │
│ │   Guard     │  │ sion()      │  │ Page()      │       │
│ └─────────────┘  └─────────────┘  └─────────────┘       │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                          │                               │
│                ┌─────────▼─────────┐                    │
│                │ src/domain/rbac.ts │                    │
│                │ (source de vérité) │                    │
│                └───────────────────┘                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase                                                 │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│ │ user_roles  │  │ has_role()  │  │ RLS Policies│       │
│ │   table     │  │    RPC      │  │             │       │
│ └─────────────┘  └─────────────┘  └─────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Références

- [Role-Based Access Control](https://en.wikipedia.org/wiki/Role-based_access_control)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
