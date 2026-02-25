

# Phase 2 : Refonte Header institutionnel + Landing page

Phase 1 (Design Tokens dual-mode) est en place. Phase 2 cible les deux éléments les plus visibles : le **header** et la **page d'accueil**.

---

## A. Header institutionnel ANSUT — `JulabaInstitutionalHeader.tsx`

### Problèmes actuels
- Logo "J" avec gradient orange → pas ANSUT
- Texte "Ton djè est bien géré · par ICONE" → jargon terrain, pas institutionnel
- Couleurs hardcodées (`bg-vert-manioc`, `bg-orange-sanguine`) → ignorent le mode
- Ligne tricolore orange/blanc/vert → drapeau CI, pas ANSUT
- Pas de réaction au `useDesignMode()`

### Corrections

1. **Intégrer `useDesignMode()`** pour basculer automatiquement entre styles terrain et institutionnel
2. **Mode institutionnel** :
   - Logo : carré bleu ANSUT `bg-primary` au lieu du gradient orange
   - Titre : "JÙLABA" en `text-primary` (bleu) + sous-titre "Plateforme Nationale · ANSUT"
   - Bouton connexion : `bg-primary` (bleu ANSUT) au lieu d'orange
   - Ligne sous header : dégradé bleu ANSUT → orange accent (au lieu du tricolore)
   - Font : Montserrat via `font-[var(--font-body)]`
3. **Mode terrain** : garde le style actuel (orange chaud, Nunito)
4. **Commun** : utiliser les CSS variables (`bg-primary`, `text-primary`, `bg-accent`) au lieu de couleurs hardcodées

### ~40 lignes modifiées dans 1 fichier

---

## B. Landing page Home — `src/pages/Home.tsx`

### Problèmes actuels
- Couleurs hardcodées partout (`bg-jaune-sahel`, `text-charbon`, `bg-orange-sanguine/25`, `bg-terre-battue/25`)
- Hero glassmorphism `bg-white/15` → pas institutionnel
- Section "Pourquoi Jùlaba" avec couleurs custom → ignore le mode
- Boutons secondaires avec couleurs hardcodées (`bg-green-600/90`, `bg-blue-600/90`)
- Aucune réactivité au design mode

### Corrections

1. **Intégrer `useDesignMode()`** pour adapter le rendu
2. **Mode institutionnel** :
   - Hero : fond `bg-card/90 backdrop-blur-lg` (blanc propre) au lieu de `bg-white/15`
   - Titre greeting : `text-primary` (bleu ANSUT) au lieu de `text-white`
   - Bouton "Écouter" : `bg-accent text-accent-foreground` au lieu de `bg-jaune-sahel`
   - Cartes rôle : utiliser les CSS variables pour les gradients
   - Boutons secondaires : `bg-primary/10 text-primary border-primary/20` (style pill sobre)
   - Section étymologie : fond `bg-card` avec bordure `border-border`, ombres légères
   - Footer : fond `bg-muted` propre
3. **Mode terrain** : style actuel préservé (chaud, coloré, expressif)
4. **Remplacer les couleurs hardcodées** par des classes CSS variables dans les deux modes

### ~60 lignes modifiées dans 1 fichier

---

## C. Composant JulabaHeroCard — adaptation mode

### Correction légère
- Ajouter une variante de style pour le mode institutionnel : gradients plus sobres, ombres `shadow-institutional`, radius réduit (`rounded-xl` au lieu de `rounded-[2rem]`)
- ~15 lignes modifiées

---

## Résumé des fichiers

| Fichier | Action |
|---------|--------|
| `JulabaInstitutionalHeader.tsx` | Adapter au dual-mode via `useDesignMode()` |
| `src/pages/Home.tsx` | Remplacer couleurs hardcodées, adapter au dual-mode |
| `JulabaHeroCard.tsx` | Variante institutionnelle sobre |

3 fichiers modifiés, ~115 lignes touchées. Aucun nouveau fichier. Le mode terrain reste identique visuellement.

