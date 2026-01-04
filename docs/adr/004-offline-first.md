# ADR-004: Stratégie Offline-First

## Statut

**Accepté**

## Date

2026-01

## Contexte

Les marchands ivoiriens opèrent souvent dans des zones à connectivité limitée :
- Marchés avec réseau instable
- Zones rurales sans 4G
- Coupures fréquentes

L'application doit fonctionner même sans connexion.

## Décision

Implémenter une **capability offline partagée** dans `src/shared/offline/` :

```
src/shared/offline/
├── storage.ts      # IndexedDB pour persistance
├── queues.ts       # Files d'attente pour actions offline
├── syncEngine.ts   # Synchronisation automatique
└── index.ts
```

### Composants

1. **Storage** : Wrapper IndexedDB pour cache local
2. **Queues** : Actions en attente par type (sales, stock, orders)
3. **SyncEngine** : Synchronisation automatique quand online

### Utilisation dans les features

```typescript
import { enqueue, registerSyncHandler } from '@/shared/offline';

// Enregistrer un handler de sync (au démarrage)
registerSyncHandler('sales', async (item) => {
  await salesService.create(item.payload);
});

// Ajouter à la queue (dans un composant)
await enqueue('sales', 'create', saleData);
```

## Alternatives considérées

1. **Offline par feature**
   - Avantages : Encapsulation complète
   - Inconvénients : Duplication du code de sync

2. **Service Worker uniquement**
   - Avantages : Standard web
   - Inconvénients : Limité pour les mutations, complexe à débugger

3. **Library externe (Workbox, SWR)**
   - Avantages : Testé et maintenu
   - Inconvénients : Dépendance supplémentaire, configuration complexe

## Conséquences

### Positives

- Code offline centralisé et réutilisable
- Features appellent simplement `enqueue()`
- Sync automatique au retour online
- Gestion des conflits centralisée

### Négatives

- Complexité de la gestion des conflits
- IndexedDB peut être vidé par l'utilisateur
- Tests offline plus complexes

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Feature (ex: MerchantCashier)                           │
│                                                         │
│   ┌─────────────┐                                       │
│   │ enqueue()   │──────────────────┐                   │
│   └─────────────┘                  │                   │
└────────────────────────────────────│────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────┐
│ src/shared/offline/                                     │
│                                                         │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│   │  queues.ts  │──│  storage.ts │  │ syncEngine  │    │
│   │  (FIFO)     │  │ (IndexedDB) │  │   .ts       │    │
│   └─────────────┘  └─────────────┘  └──────┬──────┘    │
│                                            │           │
└────────────────────────────────────────────│────────────┘
                                             │
                                             │ online event
                                             ▼
┌─────────────────────────────────────────────────────────┐
│ Supabase                                                │
│   ┌─────────────┐                                       │
│   │   API       │                                       │
│   └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## Références

- [Offline Web Applications (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
