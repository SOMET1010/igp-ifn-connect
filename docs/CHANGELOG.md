# CHANGELOG - IFN (Identifiant Fiscal Numérique)

## [RC1] - 2024-XX-XX (Release Candidate 1)

### 🔒 Sécurité
- Correction RLS: profiles accessible uniquement par propriétaire + admins
- Correction RLS: cooperatives restreint aux propriétaires + admins
- Correction RLS: system_logs et notification_logs INSERT restreint au service role
- Correction RLS: tables publiques restreintes aux utilisateurs authentifiés
- Ajout validation Zod sur tous les formulaires de login

### 🐛 Corrections
- **ErrorBoundary global** pour éviter les écrans blancs sur erreur JS
- **Gestion erreurs réseau** dans MerchantDashboard, AgentDashboard, CooperativeDashboard
- **Gestion erreurs SalesChart** avec état d'erreur et bouton retry
- Remplacement `<a>` par `<Link>` dans ProtectedRoute (navigation SPA)
- **Fix empty catch blocks** dans MerchantScanner (logging explicatif)
- **Fix empty catch block** dans PriceCompareSheet (audio play blocked)
- **Chart AdminDashboard** utilise désormais les vraies données d'enrôlement
- **Empty state chart** quand aucun enrôlement sur 7 jours

### ⚡ Performance
- Memoisation AuthContext value avec useMemo
- Lazy loading route AdminMap avec React.lazy + Suspense

### 📝 Documentation
- Création docs/BUGLOG.md (tracking des bugs et corrections)
- Création docs/PERF_NOTES.md (optimisations et goulots)
- Création docs/RELEASE_CHECKLIST.md (Go/No-Go criteria)
- Création docs/STABILITY_PLAN.md (plan de stabilisation P0/P1/P2)
- Mise à jour docs/CHANGELOG.md

### 🏗️ Composants partagés
- Création `ErrorState` composant réutilisable (erreur + retry)
- Création `EmptyState` composant réutilisable (état vide)
- Création `LoadingState` composant réutilisable (chargement)

---

## [MVP] - 2024-XX-XX (Minimum Viable Product)

### ✨ Fonctionnalités
- **Agent terrain**
  - Login par OTP
  - Enrôlement marchands en 5 étapes
  - Capture photos et GPS
  - Mode offline avec sync

- **Marchand**
  - Login par téléphone
  - Dashboard ventes quotidiennes
  - Encaissement cash/mobile money
  - Gestion stock
  - Génération factures FNE
  - Gestion crédits clients
  - Mode offline

- **Coopérative**
  - Dashboard stocks
  - Gestion commandes
  - Catalogue produits IGP

- **Administration**
  - Dashboard statistiques
  - Carte interactive (Leaflet)
  - Monitoring en temps réel
  - Analytics
  - Export rapports PDF
  - Studio enregistrement audio

### 🏗️ Infrastructure
- React 18.3 + Vite + TypeScript
- TailwindCSS avec design system custom
- Supabase (Auth, DB, Storage, Edge Functions)
- PWA avec Service Worker
- Internationalisation FR/Dioula

---

## Notes de version

### Conventions
- 🔒 Sécurité
- 🐛 Corrections
- ✨ Nouvelles fonctionnalités
- ⚡ Performance
- 📝 Documentation
- 🏗️ Infrastructure
