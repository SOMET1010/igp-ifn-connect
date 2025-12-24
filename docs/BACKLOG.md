# 📋 BACKLOG PLATEFORME IFN

> Dernière mise à jour: 2025-12-24
> Lead: AI Engineer + Product Owner + QA

---

## 🔴 P0 — Stabilisation (Sprint 1)

| ID | Tâche | État | Effort |
|----|-------|------|--------|
| P0-1 | Refactoriser CooperativeProfile (519→107 lignes) | ✅ TERMINÉ | M |
| P0-2 | Extraire service MerchantTransactions | ✅ TERMINÉ | S |
| P0-3 | Intégrer validation téléphone dans formulaires | ⬜ TODO | S |

---

## 🟡 P1 — Complétion (Sprint 2)

| ID | Tâche | État | Effort |
|----|-------|------|--------|
| P1-1 | Flux commande Marchand → Coopérative | ⬜ TODO | L |
| P1-2 | Dashboard Cooperative avec vraies stats | ⬜ TODO | M |
| P1-3 | Audit + fix MerchantPromotions | ⬜ TODO | M |
| P1-4 | Audit + fix MerchantInvoices | ⬜ TODO | M |
| P1-5 | AdminReports avec export | ⬜ TODO | M |

---

## 🟢 P2 — Polish (Sprint 3)

| ID | Tâche | État | Effort |
|----|-------|------|--------|
| P2-1 | Recherche/filtres AdminMerchants | ⬜ TODO | S |
| P2-2 | Page membres coopérative | ⬜ TODO | M |
| P2-3 | Notifications push triggers | ⬜ TODO | M |
| P2-4 | Tests E2E flux critiques | ⬜ TODO | L |

---

## 📊 Légende

- ⬜ TODO
- 🔄 EN COURS
- ✅ TERMINÉ
- ❌ BLOQUÉ

---

## 🗒️ Notes de Sprint

### Sprint 1 - P0-1: CooperativeProfile Refactoring

**Problèmes identifiés:**
- Fichier de 519 lignes (max autorisé: 250)
- Appels Supabase directs dans le composant
- Pas de hook métier séparé
- Validation manuelle (pas de Zod)

**Plan de refactoring:**
1. Créer `src/features/cooperative/services/profileService.ts`
2. Créer `src/features/cooperative/hooks/useCooperativeProfile.ts`
3. Créer `src/features/cooperative/components/profile/` avec:
   - `CooperativeProfileHeader.tsx`
   - `CooperativeProfileEditForm.tsx`
   - `CooperativeProfileView.tsx`
4. Créer `src/features/cooperative/types/profile.types.ts`
5. Réduire `CooperativeProfile.tsx` à <120 lignes (orchestration)

---

## 📁 Architecture Feature-Based

```
src/features/cooperative/
├── components/
│   ├── dashboard/
│   └── profile/          ← À CRÉER
│       ├── CooperativeProfileHeader.tsx
│       ├── CooperativeProfileEditForm.tsx
│       ├── CooperativeProfileView.tsx
│       └── index.ts
├── hooks/
│   ├── useCooperativeDashboard.ts
│   ├── useCooperativeProfile.ts  ← À CRÉER
│   └── ...
├── services/
│   ├── cooperativeService.ts
│   ├── profileService.ts         ← À CRÉER
│   └── ...
└── types/
    ├── cooperative.types.ts
    ├── profile.types.ts          ← À CRÉER
    └── ...
```
