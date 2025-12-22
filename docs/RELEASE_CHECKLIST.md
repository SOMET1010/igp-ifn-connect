# RELEASE CHECKLIST - IFN MVP → RC1

## Go/No-Go Criteria

### 🔴 Bloquants (P0) - Tous doivent être ✅

| # | Critère | Status | Notes |
|---|---------|--------|-------|
| 1 | ErrorBoundary global | ⏳ | À implémenter |
| 2 | Gestion erreurs réseau | ⏳ | À implémenter |
| 3 | Pas de crash écran blanc | ⏳ | Dépend de #1 |
| 4 | Auth fonctionne (login/logout) | ✅ | Testé |
| 5 | RLS sécurisé | ✅ | Audit fait |
| 6 | Build production OK | ⏳ | À vérifier |

### 🟡 Importants (P1) - 80% minimum

| # | Critère | Status | Notes |
|---|---------|--------|-------|
| 1 | Navigation sans reload | ⏳ | Fix Link |
| 2 | Formulaires validation Zod | ✅ | Implémenté |
| 3 | Loading states cohérents | ✅ | Présents partout |
| 4 | Boutons disabled pendant submit | ✅ | Audité OK |
| 5 | Messages toast/erreur FR | ✅ | Présents |
| 6 | Mode offline basique | ✅ | Fonctionne |
| 7 | Charts avec vraies données | ⏳ | Mock à remplacer |

### 🟢 Nice-to-have (P2)

| # | Critère | Status | Notes |
|---|---------|--------|-------|
| 1 | Lazy loading routes | ⏳ | Optimisation |
| 2 | Memoisation contexts | ⏳ | Performance |
| 3 | Empty catch blocks fixés | ⏳ | Qualité code |

---

## Smoke Tests (Manuel)

### Parcours Agent
- [ ] Login agent avec OTP
- [ ] Dashboard agent s'affiche
- [ ] Créer un enrôlement (5 étapes)
- [ ] Voir liste marchands
- [ ] Logout

### Parcours Marchand
- [ ] Login marchand
- [ ] Dashboard avec ventes du jour
- [ ] Encaisser un paiement
- [ ] Voir historique transactions
- [ ] Générer une facture
- [ ] Logout

### Parcours Coopérative
- [ ] Login coopérative
- [ ] Dashboard stocks
- [ ] Voir commandes
- [ ] Logout

### Parcours Admin
- [ ] Login admin
- [ ] Dashboard statistiques
- [ ] Voir carte
- [ ] Voir monitoring
- [ ] Exporter rapport
- [ ] Logout

### Cas limites
- [ ] Mode offline (couper réseau)
- [ ] Erreur réseau pendant submit
- [ ] Session expirée (token)
- [ ] Accès refusé (mauvais rôle)

---

## Environnements

| Env | URL | Status |
|-----|-----|--------|
| Preview | Lovable preview | ✅ |
| Production | À configurer | ⏳ |

---

## Approbations

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Dev Lead | - | - | - |
| QA Lead | - | - | - |
| Product Owner | - | - | - |

---

## Décision Go/No-Go

**Date review:** ___________

**Décision:** ☐ GO  ☐ NO-GO

**Conditions (si Go conditionnel):**
- 

**Bloquants restants (si No-Go):**
- 
