# STABILITY PLAN - IFN RC1

## Priorités de stabilisation

### 🔴 P0 - Critiques (Avant release)
*Estimation totale: 2-3h*

| Item | Module | Action | Est. | Status |
|------|--------|--------|------|--------|
| ErrorBoundary | Global | Créer composant + intégrer App.tsx | 30min | ⏳ |
| Erreurs réseau | Dashboards | Ajouter try/catch + états error | 1h | ⏳ |
| Build prod | Global | Vérifier build sans erreurs | 15min | ⏳ |

### 🟡 P1 - Importants (RC1)
*Estimation totale: 2-3h*

| Item | Module | Action | Est. | Status |
|------|--------|--------|------|--------|
| Link vs a | ProtectedRoute | Remplacer href par Link | 10min | ⏳ |
| Chart data | AdminDashboard | Requêter vraies données | 45min | ⏳ |
| AuthContext memo | Context | useMemo sur value | 15min | ⏳ |
| Lazy AdminMap | Routes | React.lazy + Suspense | 20min | ⏳ |

### 🟢 P2 - Nice-to-have (Post-RC1)
*Estimation totale: 4-6h*

| Item | Module | Action | Est. | Status |
|------|--------|--------|------|--------|
| Empty catch | MerchantScanner | Ajouter logging | 15min | ⏳ |
| useQuery migration | Dashboards | Migrer fetch → useQuery | 2h | ⏳ |
| Offline robustesse | Sync | Améliorer retry logic | 2h | ⏳ |
| Tests unitaires | Utils | Ajouter tests critiques | 2h | ⏳ |

---

## Plan d'exécution

### Sprint RC1 (Jour 1-2)

**Jour 1 - Matin:**
1. ✅ Audit sécurité terminé
2. ⏳ Créer ErrorBoundary
3. ⏳ Intégrer dans App.tsx

**Jour 1 - Après-midi:**
4. ⏳ Fix gestion erreurs dashboards
5. ⏳ Fix Link dans ProtectedRoute
6. ⏳ Memoisation AuthContext

**Jour 2 - Matin:**
7. ⏳ Lazy loading AdminMap
8. ⏳ Fix chart AdminDashboard

**Jour 2 - Après-midi:**
9. ⏳ Smoke tests manuels
10. ⏳ Build production
11. ⏳ Tag RC1

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Régression post-fix | Moyenne | Haut | Smoke tests après chaque fix |
| Edge cases offline | Faible | Moyen | Documenter limitations |
| Performance mobile | Faible | Moyen | Tests sur device réel |

---

## Définition of Done (RC1)

- [ ] Tous les P0 corrigés
- [ ] 80%+ des P1 corrigés
- [ ] Smoke tests passent
- [ ] Build production sans erreurs
- [ ] Docs à jour (BUGLOG, CHANGELOG)
- [ ] Review code effectuée
