# 🚀 Guide d'Installation PNAVIM

Ce guide décrit comment installer et lancer le projet PNAVIM en environnement de développement.

---

## 📋 Prérequis

| Outil | Version Minimum | Vérification |
|-------|-----------------|--------------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | 2.x | `git --version` |

---

## ⬇️ Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/votre-org/pnavim-app.git
cd pnavim-app
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configuration Environnement

Le projet utilise Lovable Cloud (Supabase intégré). Les variables d'environnement sont automatiquement configurées :

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
```

Pour les secrets additionnels (optionnels) :
- `ELEVENLABS_API_KEY` - Pour la synthèse vocale
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` - Pour les notifications push

---

## 🏃 Lancement

### Mode Développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

### Mode Production (Build)

```bash
npm run build
npm run preview
```

---

## 🧪 Tests

### Lancer les Tests

```bash
npm run test
```

### Tests avec Couverture

```bash
npm run test:coverage
```

---

## 📁 Structure du Projet

```
src/
├── components/        # Composants UI réutilisables
├── features/          # Modules métier (vertical slices)
│   ├── auth/          # Authentification
│   ├── cashier/       # Caisse marchand
│   ├── stock/         # Gestion stock
│   ├── voice-assistant/ # Assistant vocal
│   └── ...
├── hooks/             # Hooks React globaux
├── integrations/      # Intégrations externes (Supabase)
├── lib/               # Utilitaires
├── pages/             # Pages de l'application
└── styles/            # Styles globaux
```

---

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lancement en développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm run test` | Lancement des tests |
| `npm run lint` | Vérification du code |

---

## 🐛 Dépannage

### Erreur "Module not found"

```bash
rm -rf node_modules
npm install
```

### Erreur de connexion Supabase

Vérifier que les variables d'environnement sont correctement configurées dans `.env`.

### Port 5173 déjà utilisé

```bash
npm run dev -- --port 3000
```

---

## 📚 Ressources

- [Documentation Vite](https://vitejs.dev/)
- [Documentation React](https://react.dev/)
- [Documentation Supabase](https://supabase.com/docs)
