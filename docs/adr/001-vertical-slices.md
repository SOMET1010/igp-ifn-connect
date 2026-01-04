# ADR-001: Architecture Vertical Slices

## Statut

**Accepté**

## Date

2026-01

## Contexte

Le projet IFN avait une architecture classique avec séparation horizontale :
- `src/pages/` - Pages par rôle
- `src/components/` - Composants par rôle
- `src/features/` - Logique métier

Cette structure créait plusieurs problèmes :
1. **Duplication** : Code similaire dans pages/, components/ et features/
2. **Navigation difficile** : Un dev doit chercher dans 3 endroits pour une feature
3. **Couplage** : Difficile d'isoler une feature pour tests ou délégation

## Décision

Adopter une architecture **Vertical Slices** où chaque feature contient tout son code :

```
src/features/merchant/
├── pages/           # Pages de la feature
├── components/      # Composants UI
├── hooks/           # Hooks React
├── services/        # API et logique métier
├── types/           # Types TypeScript
└── index.ts         # API publique
```

Nouveaux dossiers de support :
- `src/app/` - Bootstrap, providers, guards, layouts
- `src/routes/` - Définition des routes par rôle
- `src/domain/` - Types métier et règles pures (sans React)
- `src/shared/` - Utilitaires et composants non-métier

## Alternatives considérées

1. **Clean Architecture**
   - Avantages : Séparation stricte des couches
   - Inconvénients : Trop complexe pour une app React, beaucoup de boilerplate

2. **Atomic Design**
   - Avantages : Bonne organisation des composants UI
   - Inconvénients : Ne résout pas le problème métier, focus UI uniquement

## Conséquences

### Positives

- Un dev trouve tout d'une feature au même endroit
- Features isolables pour tests et délégation
- Imports clairs via index.ts public
- Réduction de 63% des fichiers dupliqués

### Négatives

- Migration progressive requise
- Courbe d'apprentissage pour l'équipe
- Certains composants vraiment partagés doivent aller dans shared/

## Références

- [Vertical Slice Architecture - Jimmy Bogard](https://www.jimmybogard.com/vertical-slice-architecture/)
- [Feature-Sliced Design](https://feature-sliced.design/)
