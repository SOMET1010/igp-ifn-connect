

# Problème identifié : la page d'accueil est en mode institutionnel

La route `/` est listée dans `INSTITUTIONAL_ROUTES` (ligne 16 de `DesignModeContext.tsx`), et le mode est persisté dans localStorage. Si vous avez testé le mode institutionnel, il reste bloqué dessus.

La cible principale de JÙLABA = marchands du vivrier, vendeuses, agents terrain. L'interface institutionnelle (bleu ANSUT, Montserrat, cartes blanches sobres) n'est pas adaptée à ce public.

## Corrections

### 1. Retirer `/` des routes institutionnelles

Dans `DesignModeContext.tsx` ligne 16, retirer `/` de `INSTITUTIONAL_ROUTES` pour que la page d'accueil utilise le mode terrain par défaut :

```typescript
const INSTITUTIONAL_ROUTES = ['/admin', '/presentation'];
```

### 2. Activer le forçage automatique par route

Le tableau `INSTITUTIONAL_ROUTES` existe mais n'est **jamais utilisé** dans le code. Ajouter la logique qui force le mode selon la route courante :
- `/admin`, `/presentation` → mode institutionnel automatique
- Toutes les autres routes → mode terrain (marchands)

Utiliser `useLocation()` de react-router pour détecter la route et appliquer le mode correspondant.

### 3. Résultat

- La page d'accueil `/` affichera toujours le mode **terrain** : fond immersif marché, couleurs chaudes (orange/vert), Nunito, texte inclusif
- Les pages admin/présentation garderont le mode ANSUT institutionnel
- Le switch reste possible manuellement pour les démos

### Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `src/shared/contexts/DesignModeContext.tsx` | Retirer `/` de `INSTITUTIONAL_ROUTES`, activer le forçage par route via `useLocation()` |

1 fichier, ~10 lignes modifiées.

