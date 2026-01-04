# PNAVIM-CI 🇨🇮

**Plateforme Nationale des Acteurs du Vivrier Marchand**

> Formalisation et inclusion financière des commerçants vivriers en Côte d'Ivoire

[![License](https://img.shields.io/badge/Licence-Propriétaire-orange.svg)](LICENSE)
[![Made in CI](https://img.shields.io/badge/Made%20in-Côte%20d'Ivoire-green.svg)]()

---

## 📋 Description

PNAVIM-CI est une plateforme numérique innovante conçue pour accompagner la formalisation des acteurs du commerce vivrier en Côte d'Ivoire. Le projet est porté par la **Direction Générale de l'Économie (DGE)** et opéré par l'**ANSUT** (Agence Nationale du Service Universel des Télécommunications).

### 🎯 Objectifs

- **Formalisation** des commerçants du secteur informel
- **Inclusion financière** via l'intégration mobile money
- **Couverture sociale** avec inscription automatique à la CMU
- **Traçabilité** des flux commerciaux vivriers

---

## 🛠️ Stack Technologique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **UI Components** | shadcn/ui, Radix UI, Framer Motion |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| **Voice AI** | ElevenLabs TTS, Web Speech API |
| **PWA** | Service Worker, IndexedDB, Mode hors-ligne |

---

## ✨ Fonctionnalités Clés

### 🎙️ Authentification Vocale "Voice-First"
- Personas inclusifs : **Tantie Sagesse** (Marchand) et **Gbairai** (Agent)
- Support multi-dialectes : Français, Nouchi, Dioula
- Reconnaissance vocale du numéro de téléphone

### 📱 Mode Hors-ligne Complet
- Synchronisation différée des transactions
- Cache intelligent des données critiques
- Indicateur de connexion en temps réel

### 💰 Encaissement Mobile
- Intégration Orange Money, MTN, Wave, Moov
- Génération de QR codes de paiement
- Historique des transactions

### 👥 Gestion Multi-Rôles
- **Marchand** : Stock, encaissements, profil CMU
- **Agent Terrain** : Enregistrement, tournées, validation
- **Coopérative** : Membres, commandes groupées
- **Admin** : Supervision, statistiques nationales

---

## 🚀 Installation

```bash
# Cloner le repository
git clone <repository-url>
cd pnavim-ci

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Lancer les tests
npm run test

# Build production
npm run build
```

---

## 🔐 Variables d'Environnement

Les variables d'environnement sont gérées automatiquement via Lovable Cloud :

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase |
| `ELEVENLABS_API_KEY` | Clé API ElevenLabs (Secret) |

---

## 📁 Structure du Projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── shared/          # Composants partagés
│   └── ui/              # Composants shadcn/ui
├── features/            # Fonctionnalités métier
│   ├── auth/            # Authentification
│   ├── merchant/        # Espace Marchand
│   ├── agent/           # Espace Agent
│   ├── cooperative/     # Espace Coopérative
│   └── social-auth/     # Auth vocale
├── hooks/               # Hooks React personnalisés
├── lib/                 # Utilitaires
├── pages/               # Pages de l'application
└── integrations/        # Intégrations externes
```

---

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Couverture de code
npm run test:coverage

# Tests en mode watch
npm run test -- --watch
```

---

## 📊 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run test` | Lancer les tests |
| `npm run lint` | Vérifier le code |

---

## 🌍 Internationalisation

L'application supporte :
- 🇫🇷 **Français** (langue principale)
- 🇨🇮 **Nouchi** (argot ivoirien)
- 🇲🇱 **Dioula** (dialecte commercial)

---

## 📜 Licence

**Propriété de la République de Côte d'Ivoire**

Ce logiciel est la propriété exclusive de l'État de Côte d'Ivoire, représenté par la Direction Générale de l'Économie (DGE). Toute reproduction, distribution ou utilisation non autorisée est strictement interdite.

---

## 🤝 Partenaires

<p align="center">
  <strong>DGE</strong> - Direction Générale de l'Économie<br>
  <strong>ANSUT</strong> - Agence Nationale du Service Universel des Télécommunications<br>
  <strong>CMU</strong> - Couverture Maladie Universelle
</p>

---

<p align="center">
  <sub>🇨🇮 Fait avec ❤️ pour les commerçants de Côte d'Ivoire</sub>
</p>
