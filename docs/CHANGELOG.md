# CHANGELOG - IFN (Identifiant Fiscal Numérique)

## [RC1] - 2024-XX-XX (Release Candidate 1)

### 🔒 Sécurité
- Correction RLS: profiles accessible uniquement par propriétaire + admins
- Correction RLS: cooperatives restreint aux propriétaires + admins
- Correction RLS: system_logs et notification_logs INSERT restreint au service role
- Correction RLS: tables publiques restreintes aux utilisateurs authentifiés
- Ajout validation Zod sur tous les formulaires de login

### 🐛 Corrections
- Ajout ErrorBoundary global pour éviter les écrans blancs
- Gestion erreurs réseau avec messages utilisateur
- Remplacement `<a>` par `<Link>` dans ProtectedRoute
- Fix empty catch blocks dans MerchantScanner

### ⚡ Performance
- Memoisation AuthContext value
- Lazy loading route AdminMap

### 📝 Documentation
- Création docs/BUGLOG.md
- Création docs/PERF_NOTES.md
- Création docs/RELEASE_CHECKLIST.md
- Création docs/STABILITY_PLAN.md

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
