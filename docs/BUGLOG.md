# BUGLOG - IFN MVP Release Candidate

## Tableau de priorisation

| ID | Gravité | Module | Symptôme | Cause | Fix | Test | Est. |
|----|---------|--------|----------|-------|-----|------|------|
| BUG-001 | **P0** | Global | Crash écran blanc possible | Pas d'ErrorBoundary | Ajouter ErrorBoundary global | Manuel | S |
| BUG-002 | **P0** | Auth | Erreurs DB silencieuses | fetchData sans try/catch complet | Wrapper try/catch + toast | Manuel | S |
| BUG-003 | **P1** | ProtectedRoute | `<a href>` au lieu de `<Link>` | Reload complet de l'app | Remplacer par Link | Manuel | S |
| BUG-004 | **P1** | AdminDashboard | Chart avec données fake | Mock data hardcodé | Utiliser vraies données DB | Manuel | M |
| BUG-005 | **P1** | Formulaires | Double submit possible | Boutons pas toujours disabled | Audit complet boutons | Manuel | M |
| BUG-006 | **P2** | MerchantScanner | Empty catch blocks | Erreurs silencieuses | Ajouter logs/toast | Manuel | S |
| BUG-007 | **P2** | Offline | Conflits sync potentiels | Queue sans gestion erreurs | Améliorer retry logic | Manuel | L |

---

## Détails des bugs

### BUG-001: Pas d'ErrorBoundary global
**Gravité:** P0 (Critique)

**Symptôme:** En cas d'erreur JS non catchée, l'app affiche un écran blanc sans possibilité de récupération.

**Étapes reproduction:**
1. Simuler une erreur JS dans un composant
2. Observer écran blanc

**Attendu:** Message d'erreur user-friendly avec option de retry/reload

**Obtenu:** Écran blanc

**Cause racine:** Aucun ErrorBoundary n'est implémenté dans l'application.

**Correctif:** Créer composant ErrorBoundary et l'ajouter dans App.tsx

**Test:** Vérifier qu'une erreur affiche l'ErrorBoundary

---

### BUG-002: Erreurs DB non gérées
**Gravité:** P0 (Critique)

**Symptôme:** Si une requête Supabase échoue, l'utilisateur ne voit aucun message d'erreur.

**Étapes reproduction:**
1. Couper le réseau pendant le chargement
2. Observer le spinner infini

**Attendu:** Message "Erreur de connexion, réessayer"

**Obtenu:** Spinner infini ou données partielles

**Cause racine:** Les fetchData dans les dashboards n'ont pas de try/catch avec gestion d'erreur UI.

**Correctif:** Ajouter états error + gestion try/catch dans tous les fetchData

**Test:** Vérifier affichage erreur réseau

---

### BUG-003: Lien `<a>` au lieu de `<Link>`
**Gravité:** P1 (Important)

**Symptôme:** En cliquant sur "Retour à l'accueil" depuis la page d'accès refusé, toute l'app recharge.

**Fichier:** `src/components/auth/ProtectedRoute.tsx:85`

**Cause racine:** Utilisation de `<a href="/">` au lieu de `<Link to="/">`

**Correctif:** Remplacer par composant Link de react-router-dom

---

### BUG-004: Chart AdminDashboard avec données fake
**Gravité:** P1 (Important)

**Symptôme:** Le graphique des enrôlements affiche des données aléatoires (mock).

**Fichier:** `src/pages/admin/AdminDashboard.tsx:121-129`

**Cause racine:** `Math.random()` utilisé pour générer les données du chart.

**Correctif:** Requêter les vraies données d'enrôlement par date depuis la table merchants.

---

### BUG-005: Double submit potentiel
**Gravité:** P1 (Important)

**Symptôme:** Certains formulaires pourraient permettre un double clic pendant le submit.

**Audit réalisé:** 10 fichiers avec boutons disabled pendant loading trouvés - OK global, mais vérification nécessaire sur tous les formulaires.

---

### BUG-006: Empty catch blocks
**Gravité:** P2 (Mineur)

**Symptôme:** Erreurs silencieuses dans MerchantScanner.

**Fichier:** `src/pages/merchant/MerchantScanner.tsx:132`

**Cause racine:** `catch {}` vide sans logging ni feedback.

**Correctif:** Ajouter console.error et/ou toast warning.

---

### BUG-007: Sync offline - conflits potentiels
**Gravité:** P2 (Mineur)

**Symptôme:** En mode offline, les items pourraient être dupliqués ou perdus.

**Fichier:** `src/hooks/useOfflineSync.ts`

**Cause racine:** La logique de retry et de résolution de conflits est basique.

**Note:** À améliorer dans une version ultérieure, pas bloquant pour RC1.

---

## Historique des corrections

| Date | Bug ID | Commit | Auteur |
|------|--------|--------|--------|
| - | - | - | - |
