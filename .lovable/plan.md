

# Section "Pourquoi Jùlaba ?" sur la page d'accueil

## Emplacement

Insertion entre les boutons secondaires (Cooperative/Producteur/Carte, ligne ~470) et le footer institutionnel (ligne ~472). Position naturelle : l'utilisateur a vu les cartes de role, les boutons secondaires, puis decouvre l'identite culturelle avant les logos institutionnels.

## Design

Section glassmorphism coherente avec le reste de la page (`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20`), avec animation framer-motion en fade-in au scroll.

### Contenu

```text
┌─────────────────────────────────────────┐
│  ✦ Pourquoi « Jùlaba » ?               │
│                                         │
│  ┌───────────┐    ┌───────────┐         │
│  │   Jùla    │ +  │    Ba     │         │
│  │ commerçant│    │   grand   │         │
│  │  marchand │    │respectable│         │
│  └───────────┘    └───────────┘         │
│                                         │
│  = "Grand commerçant"                   │
│                                         │
│  En bambara, Jùlaba designe un          │
│  marchand respecte. Cette plateforme    │
│  porte ce nom parce que chaque          │
│  vendeuse, chaque marchand merite       │
│  d'etre reconnu.                        │
│                                         │
│  ── bande decorative wax ──             │
└─────────────────────────────────────────┘
```

### Elements visuels
- Deux "pilules" cote a cote pour `Jùla` et `Ba` avec fond orange/terre cuite semi-transparent
- Signe `+` entre les deux, `=` en dessous avec le resultat en gras
- Texte explicatif court (3 lignes max), langage simple et inclusif
- Petite bande decorative horizontale en gradient wax (jaune → orange → terre) en bas de section
- Animation stagger : les deux pilules apparaissent l'une apres l'autre

### Technique
- Modification uniquement de `src/pages/Home.tsx` (insertion ~25 lignes de JSX)
- Utilisation des composants `motion.div` existants
- Couleurs du design system : `jaune-sahel`, `orange-sanguine`, `terre-battue`
- Responsive : empile verticalement sur mobile si necessaire (mais les deux pilules restent en ligne)

