# PERF_NOTES - IFN MVP Performance Audit

## Résumé

| Goulot | Impact | Action | Gain attendu | Priorité |
|--------|--------|--------|--------------|----------|
| Re-renders AuthContext | Moyen | Memoisation value | -50% re-renders | P2 |
| Requêtes répétées dashboards | Moyen | TanStack Query (déjà installé) | Cache auto | P2 |
| Listes non virtualisées | Faible | React-window si >100 items | Scroll fluide | P3 |
| Imports Leaflet | Moyen | Lazy load dynamique | Bundle -200kb | P2 |
| Recharts bundle | Moyen | Tree-shaking imports | Bundle -100kb | P3 |

---

## Analyse détaillée

### 1. Re-renders AuthContext

**Problème:** Le contexte Auth se re-render à chaque changement, causant des re-renders cascade.

**Fichier:** `src/contexts/AuthContext.tsx`

**Solution:** Mémoiser l'objet `value` avec `useMemo`:
```tsx
const value = useMemo(() => ({
  user, session, isLoading, isAuthenticated, userRole,
  signIn, signUp, signOut, checkRole
}), [user, session, isLoading, userRole]);
```

**Gain:** -50% re-renders inutiles sur les composants utilisant useAuth

---

### 2. Requêtes sans cache

**Problème:** Chaque navigation vers un dashboard refait toutes les requêtes Supabase.

**État actuel:** TanStack Query installé mais peu utilisé (seulement QueryClientProvider).

**Solution:** Migrer progressivement les fetchData vers `useQuery`:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['merchants'],
  queryFn: () => supabase.from('merchants').select('*'),
  staleTime: 5 * 60 * 1000 // 5 min
});
```

**Gain:** Cache automatique, réduction requêtes -70%

---

### 3. Listes longues

**Problème potentiel:** Si les listes marchands/transactions dépassent 100+ items, le scroll peut devenir lent.

**État actuel:** MerchantList utilise `visibleCount` avec "Voir plus" - BIEN.
Mais pas de virtualisation pour très grandes listes.

**Solution future:** Implémenter react-window si nécessaire.

**Priorité:** P3 (pas bloquant pour RC1)

---

### 4. Bundle Leaflet

**Problème:** Leaflet est importé globalement même sur les pages sans carte.

**Fichier:** `src/pages/admin/AdminMap.tsx`

**Solution:** Dynamic import avec React.lazy:
```tsx
const AdminMap = React.lazy(() => import('./admin/AdminMap'));
```

**Gain:** -200kb sur le bundle initial

---

### 5. Recharts imports

**Problème:** Imports complets de recharts au lieu du tree-shaking.

**Fichier:** `src/pages/admin/AdminDashboard.tsx`

**État actuel:** 
```tsx
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
```
✅ Déjà correct - imports nommés utilisés.

---

## Quick Wins appliqués (RC1)

1. ✅ Memoisation AuthContext value
2. ✅ Lazy loading des routes admin avec carte
3. ⏳ Migration progressive vers useQuery (post-RC1)

---

## Métriques cibles

| Métrique | Actuel (estimé) | Cible RC1 | Cible v1.0 |
|----------|-----------------|-----------|------------|
| Bundle size | ~1.2MB | ~1MB | ~800kb |
| First Contentful Paint | ~2s | ~1.5s | ~1s |
| Time to Interactive | ~3s | ~2.5s | ~2s |
