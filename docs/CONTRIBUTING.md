# Guide de Contribution P.NA.VIM

## 🎯 Principes Fondamentaux

### Anti-Vibe-Coding

Ce projet suit une approche **anti-vibe-coding** stricte:

1. **Pas de code dupliqué** - DRY (Don't Repeat Yourself)
2. **Typage strict** - Éviter `any`, utiliser des interfaces
3. **Composants focalisés** - Une responsabilité par composant
4. **Tests obligatoires** - Smoke tests pour les routes

### Architecture Feature-First

Chaque nouvelle fonctionnalité doit être dans `src/features/`:

```
features/nouvelle-feature/
├── components/
├── hooks/
├── pages/
└── index.ts        # Exports publics
```

## 📝 Checklist Avant PR

- [ ] Code typé (pas de `any` non justifié)
- [ ] Imports via barrel exports (`@/shared/ui`)
- [ ] Named exports (pas de `export default`)
- [ ] Tests smoke si nouvelle route
- [ ] Couleurs via design tokens

## 🎨 Design System

### ✅ Correct

```tsx
import { StatCard, SearchInput } from '@/shared/ui';

const MyComponent = () => (
  <div className="bg-background text-foreground">
    <StatCard title="Ventes" value={42} />
  </div>
);

export { MyComponent };
```

### ❌ À Éviter

```tsx
import StatCard from '@/components/shared/StatCard';

export default function MyComponent() {
  return (
    <div className="bg-white text-gray-900">
      <StatCard title="Ventes" value={42} />
    </div>
  );
}
```

## 🔧 Commandes Utiles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run test         # Tests
npm run lint         # Linting
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - Structure du projet
- [Sitemap](../src/app/router/sitemap.ts) - Routes disponibles
