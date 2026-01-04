# Architecture Decision Records

Ce dossier contient les ADR (Architecture Decision Records) du projet IFN.

## Format

Chaque ADR suit le format :

1. **Titre** : Description courte de la décision
2. **Statut** : Proposé / Accepté / Déprécié / Remplacé
3. **Contexte** : Pourquoi cette décision est nécessaire
4. **Décision** : Ce qui a été décidé
5. **Conséquences** : Impact positif et négatif

## Index

| ADR | Titre | Statut | Date |
|-----|-------|--------|------|
| [001](./001-vertical-slices.md) | Architecture Vertical Slices | Accepté | 2026-01 |
| [002](./002-edge-functions-naming.md) | Convention nommage Edge Functions | Accepté | 2026-01 |
| [003](./003-rbac-centralized.md) | RBAC centralisé | Accepté | 2026-01 |
| [004](./004-offline-first.md) | Stratégie Offline-First | Accepté | 2026-01 |

## Comment ajouter un ADR

1. Copier `template.md` vers `XXX-titre-court.md`
2. Remplir les sections
3. Mettre à jour l'index ci-dessus
4. Faire valider par l'équipe
