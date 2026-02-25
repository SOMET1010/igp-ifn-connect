

# Ce que représentent les cercles entourés

Les éléments cerclés dans le header sont les **boutons de sélection de langue**. Ils affichent les 3 premières langues définies dans le système :

1. 🇫🇷 — Français
2. 🟡 — Dioula (Julakan)
3. Le cercle vert — probablement Baoulé ou Bété

Le problème : ces symboles (emoji cercles colorés) ne sont **pas du tout explicites** pour l'utilisateur. Un cercle jaune et un cercle vert ne communiquent pas "changer de langue".

## Amélioration proposée

Remplacer les symboles emoji génériques par des labels textuels courts plus compréhensibles dans le header compact :

| Actuel | Proposé |
|--------|---------|
| 🟡 | **DJ** (Dioula) |
| cercle vert | **BA** (Baoulé) |

Ou bien ajouter un **tooltip/label** sous chaque bouton, ou utiliser le format `LanguageToggle` (variante pill) qui affiche le nom natif dans un dropdown — plus clair pour les utilisateurs peu lettrés.

### Fichiers concernés
- `src/shared/lib/translations.ts` — modifier les `symbol` pour utiliser des abréviations ou drapeaux plus parlants
- `src/features/public/components/julaba/JulabaInstitutionalHeader.tsx` — optionnel : ajouter un label textuel à côté des boutons

### Détail technique
Le tableau `LANGUAGES` dans `translations.ts` définit le `symbol` de chaque langue. Actuellement Dioula utilise `'🟡'` et les autres langues ivoiriennes utilisent probablement `'🇨🇮'` ou des cercles colorés. On remplacerait par des abréviations 2 lettres (DJ, BA, BT, SE) qui restent lisibles à petite taille dans le header.

