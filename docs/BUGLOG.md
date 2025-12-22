# BUGLOG - IFN MVP Release Candidate

## Tableau de priorisation

| ID | Gravité | Module | Symptôme | Cause | Fix | Status |
|----|---------|--------|----------|-------|-----|--------|
| BUG-001 | **P0** | Global | Crash écran blanc | Pas d'ErrorBoundary | ErrorBoundary global | ✅ |
| BUG-002 | **P0** | Dashboards | Erreurs DB silencieuses | Pas de try/catch | Gestion erreurs + ErrorState | ✅ |
| BUG-003 | **P1** | ProtectedRoute | Page reload | `<a>` au lieu de `<Link>` | Remplacer par Link | ✅ |
| BUG-004 | **P1** | AdminDashboard | Chart fake data | Mock hardcodé | Vraies données DB | ✅ |
| BUG-005 | **P1** | MerchantScanner | Empty catch | Catch vides | Ajout logging | ✅ |
| BUG-006 | **P1** | PriceCompareSheet | Empty catch audio | Catch vide | Ajout logging | ✅ |
| BUG-007 | **P2** | Offline | Conflits sync | Pas de résolution | Documenté | ⏳ |

---

## Historique des corrections

| Date | Bug ID | Fichier | Correction |
|------|--------|---------|------------|
| 2024-12 | BUG-001 | ErrorBoundary.tsx | Composant créé + intégré App.tsx |
| 2024-12 | BUG-002 | *Dashboard.tsx | try/catch + ErrorState + retry |
| 2024-12 | BUG-003 | ProtectedRoute.tsx | Link au lieu de a href |
| 2024-12 | BUG-004 | AdminDashboard.tsx | Requête vraie data + empty state |
| 2024-12 | BUG-005 | MerchantScanner.tsx | console.debug/warn ajoutés |
| 2024-12 | BUG-006 | PriceCompareSheet.tsx | console.debug ajouté |
