# 📐 Documentation Technique PNAVIM

Cette section contient toute la documentation technique destinée aux développeurs et équipes DevOps.

---

## 📁 Contenu

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Architecture système, patterns, choix techniques |
| [API.md](./API.md) | Documentation des Edge Functions et endpoints |
| [INSTALLATION.md](./INSTALLATION.md) | Guide d'installation et déploiement |
| [CONFIGURATION.md](./CONFIGURATION.md) | Variables d'environnement et secrets |
| [DATABASE.md](./DATABASE.md) | Schéma base de données, tables, relations |
| [SECURITY.md](./SECURITY.md) | Sécurité, RLS, authentification multi-couches |

---

## 🏗️ Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| État | TanStack Query |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Auth | Supabase Auth + OTP + Validation communautaire |
| Notifications | Web Push (VAPID) |
| Voix | ElevenLabs TTS + Web Speech API |

---

## 📊 Décisions d'Architecture

Les décisions d'architecture importantes sont documentées dans les [ADR (Architecture Decision Records)](../adr/).

| ADR | Sujet |
|-----|-------|
| [001](../adr/001-vertical-slices.md) | Organisation en vertical slices |
| [002](../adr/002-edge-functions-naming.md) | Convention de nommage Edge Functions |
| [003](../adr/003-rbac-centralized.md) | RBAC centralisé |
| [004](../adr/004-offline-first.md) | Stratégie offline-first |

---

## 🔗 Liens Utiles

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
