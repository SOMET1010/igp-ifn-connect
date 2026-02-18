# 🌾 Plateforme IFN — Inclusion Financière Numérique

## Programme National d'Appui aux Vivriers de Côte d'Ivoire (PNAVIM)

**"Formaliser, Protéger, Prospérer"**

---

> **Ministère du Commerce, de l'Industrie et de la Promotion des PME**  
> République de Côte d'Ivoire

---

## 📋 Table des matières

1. [Le Problème](#1--le-problème)
2. [La Solution — Plateforme IFN](#2--la-solution--plateforme-ifn)
3. [Design System Jùlaba](#3--design-system-jùlaba)
4. [Fonctionnalités par Portail](#4--fonctionnalités-par-portail)
5. [Architecture Technique](#5--architecture-technique)
6. [Sécurité & Authentification](#6--sécurité--authentification)
7. [Mode Hors-Ligne](#7--mode-hors-ligne)
8. [Accessibilité & Inclusion](#8--accessibilité--inclusion)
9. [Impact Attendu](#9--impact-attendu)
10. [Contacts](#10--contacts)

---

## 1 — Le Problème

La Côte d'Ivoire compte plus de **500 000 marchands de vivriers** opérant dans le secteur informel. Ces acteurs économiques essentiels font face à des défis majeurs :

| Défi | Impact |
|------|--------|
| 🚫 Aucune traçabilité des ventes | Impossible de prouver ses revenus |
| 🏥 Pas de protection sociale | Exclusion de la CMU (Couverture Maladie Universelle) |
| 🏦 Exclusion financière | Pas d'accès au crédit bancaire |
| 📝 Barrière de l'alphabétisation | Interfaces numériques inaccessibles |
| 📊 Pas de données fiables | Politiques publiques sans base factuelle |

**Constat** : Les outils numériques existants ne sont pas conçus pour des utilisateurs non-alphabétisés, excluant de fait la majorité des marchands de vivriers.

---

## 2 — La Solution — Plateforme IFN

La Plateforme IFN est une **application web mobile-first** qui permet la formalisation progressive des marchands de vivriers à travers **5 portails spécialisés** :

```
┌─────────────────────────────────────────────────────────┐
│                   PLATEFORME IFN                        │
│              "Ton djè est bien géré"                    │
├─────────┬──────────┬───────────┬───────────┬────────────┤
│ 🛒      │ 👤       │ 🏢        │ 🌿        │ ⚙️         │
│ Marchand│ Agent    │ Coopéra-  │ Producteur│ Admin      │
│         │          │ tive      │           │            │
│ 16 pages│ 5 pages  │ 7 pages   │ 4 pages   │ Dashboard  │
└─────────┴──────────┴───────────┴───────────┴────────────┘
```

| Portail | Public cible | Fonctionnalités clés |
|---------|-------------|---------------------|
| **🛒 Marchand** | Vendeurs de vivriers | Vente vocale, stock, caisse, factures FNE, CMU |
| **👤 Agent** | Agents terrain PNAVIM | Enrôlement, suivi marchands, validation |
| **🏢 Coopérative** | Coopératives agricoles | Gestion membres, commandes, producteurs |
| **🌿 Producteur** | Agriculteurs | Récoltes, commandes, profil, certifications |
| **⚙️ Admin** | Administrateurs | Tableau de bord, statistiques, documentation |

---

## 3 — Design System Jùlaba

### Philosophie

**Jùlaba** signifie *"Ton djè est bien géré"* (ton argent est bien géré) en Dioula.

Le Design System repose sur **4 piliers fondamentaux** :

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  🎙️ VOICE    │  │  🖼️ ZERO     │  │  👆 XXL      │  │  📳 FEEDBACK │
│  FIRST       │  │  TEXT         │  │  TOUCH       │  │  SENSORIEL   │
│              │  │              │  │              │  │              │
│ Parler pour  │  │ Pictogrammes │  │ Boutons      │  │ Haptique     │
│ vendre       │  │ universels   │  │ ≥ 56px       │  │ + Audio      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Principes de design

| Principe | Implémentation |
|----------|---------------|
| Voice-First | Enregistrement vocal des ventes (Speech-to-Text) |
| Zero Text | Interface 100% pictographique, aucun texte obligatoire |
| XXL Touch | Boutons géants (minimum 56px), zones de tap larges |
| Feedback sensoriel | Vibrations, sons de confirmation, animations |
| Bilingue | Français et Dioula (audio + texte) |
| Mascotte | "Tantie" — guide contextuel animé |

### Composants Jùlaba

- **JulabaButton** : Boutons avec émojis, variantes hero/outline/ghost
- **JulabaCard** : Cartes avec dégradés et ombres
- **JulabaStatCard** : Statistiques avec émojis et couleurs
- **JulabaHeader** : En-tête avec navigation audio
- **JulabaBottomNav** : Navigation basse par pictogrammes
- **JulabaInput** : Champs avec émojis et aide vocale
- **JulabaPageLayout** : Mise en page responsive avec fond dégradé
- **AudioButton** : Lecture vocale contextuelle (ElevenLabs)

---

## 4 — Fonctionnalités par Portail

### 🛒 Portail Marchand (16 pages)

| Page | Fonctionnalité | Accessibilité |
|------|---------------|---------------|
| Dashboard | Vue d'ensemble des ventes du jour | 🎙️ Audio + 🖼️ Pictogrammes |
| Vente vocale | Enregistrement vocal : *"3 bassines de tomates à 2000"* | 🎙️ Speech-to-Text |
| Stock | Gestion des quantités avec alertes de seuil bas | 🖼️ Pictogrammes produits |
| Caisse | Ouverture/clôture journalière, solde de caisse | 👆 Boutons XXL |
| Factures FNE | Factures Normalisées Électroniques conformes | 📱 QR Code |
| Scanner | Lecture code-barres et QR code | 📷 Caméra |
| Historique | Transactions avec mode hors-ligne | 📳 Sync auto |
| CMU | Inscription automatique (prélèvement 1%) | 🏥 Automatique |
| KYC | Vérification progressive de l'identité | 👤 Multi-niveaux |
| Marketplace | Achat auprès des coopératives | 🛍️ Panier |
| Wallet | Porte-monnaie électronique | 💰 Transferts |
| Promotions | Offres spéciales et réductions | 🏷️ Codes promo |
| Crédit clients | Suivi des crédits accordés | 📝 Relances |
| Profil | Informations personnelles et paramètres | ⚙️ Éditable |
| Aide | Mascotte Tantie + FAQ vocale | 🎙️ Audio |
| Notifications | Alertes et rappels | 🔔 Push |

### 👤 Portail Agent (5 pages)

| Page | Fonctionnalité |
|------|---------------|
| Dashboard | Statistiques d'enrôlement, objectifs |
| Enrôlement | Wizard en 5 étapes (identité → photo → marché → activité → validation) |
| Liste marchands | Recherche, filtres, suivi des marchands enrôlés |
| Profil | Informations agent, zone d'affectation |
| Notifications | Alertes, validations en attente |

### 🏢 Portail Coopérative (7 pages)

| Page | Fonctionnalité |
|------|---------------|
| Dashboard | Revenus, commandes, graphiques (Recharts) |
| Membres | Liste, ajout, statistiques des membres |
| Producteurs | Gestion des producteurs affiliés |
| Commandes | Suivi des commandes marchands |
| Commandes producteurs | Approvisionnement auprès des producteurs |
| Profil | Informations coopérative, certification IGP |
| Export | Génération de rapports PDF |

### 🌿 Portail Producteur (4 pages)

| Page | Fonctionnalité |
|------|---------------|
| Dashboard | Statistiques de production et revenus |
| Récoltes | Enregistrement des récoltes, qualité, prix |
| Commandes | Suivi des commandes coopératives |
| Profil | Certifications, spécialités, localisation |

### ⚙️ Portail Admin

| Page | Fonctionnalité |
|------|---------------|
| Dashboard | Statistiques consolidées nationales |
| Documentation | Générateur de documentation PDF |
| RBAC | Gestion des rôles et permissions |
| Directions | Structure organisationnelle |

---

## 5 — Architecture Technique

### Stack technologique

```
+──────────────────────────────────────────────────────+
│                 FRONTEND                              │
│  React 18 · TypeScript · Vite · Tailwind CSS          │
│  Framer Motion · Recharts · Leaflet · jsPDF           │
+──────────────────────────────────────────────────────+
│              DESIGN SYSTEM JÙLABA                     │
│  Boutons · Cartes · Navigation · Formulaires          │
│  shadcn/ui · AudioButton · Pictogrammes               │
+──────────────────────────────────────────────────────+
│              LOVABLE CLOUD (Backend)                  │
│  Auth (OTP + OAuth) · PostgreSQL · Edge Functions     │
│  Storage · Row Level Security · Realtime              │
+──────────────────────────────────────────────────────+
│              SERVICES EXTERNES                        │
│  ElevenLabs (TTS) · Web Speech API (STT)              │
│  Web Push (VAPID) · Géolocalisation                   │
+──────────────────────────────────────────────────────+
```

### Détail des technologies

| Couche | Technologie | Usage |
|--------|------------|-------|
| Frontend | React 18 + TypeScript | Application SPA |
| Bundler | Vite | Build rapide, HMR |
| CSS | Tailwind CSS | Styles utilitaires |
| UI | shadcn/ui + Jùlaba | Composants accessibles |
| État | TanStack Query | Cache, sync serveur |
| Animations | Framer Motion | Transitions fluides |
| Cartographie | Leaflet + React-Leaflet | Cartes marchés |
| Graphiques | Recharts | Visualisation données |
| PDF | jsPDF + jspdf-autotable | Export documents |
| QR Codes | qrcode.react | Factures FNE |
| Audio TTS | ElevenLabs | Synthèse vocale bilingue |
| Audio STT | Web Speech API | Reconnaissance vocale |
| Backend | Lovable Cloud | BDD, Auth, Functions |
| Notifications | Web Push (VAPID) | Alertes temps réel |

### Architecture applicative

```
src/
├── features/           # Vertical slices par domaine
│   ├── merchant/       # 🛒 Portail Marchand
│   │   ├── pages/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── types/
│   ├── agent/          # 👤 Portail Agent
│   ├── cooperative/    # 🏢 Portail Coopérative
│   ├── producer/       # 🌿 Portail Producteur
│   ├── admin/          # ⚙️ Portail Admin
│   └── auth/           # 🔐 Authentification
├── shared/             # Composants et hooks partagés
│   ├── components/     # Design System Jùlaba
│   ├── hooks/          # Hooks réutilisables
│   └── contexts/       # Contextes React
├── infra/              # Infrastructure (logger, offline)
└── integrations/       # Clients API
```

---

## 6 — Sécurité & Authentification

### Protocole d'authentification à 4 couches

L'authentification est conçue pour l'**inclusion** — les marchands non-alphabétisés doivent pouvoir se connecter en toute sécurité.

```
┌─────────────────────────────────────────────────┐
│           COUCHE 1 — OTP Téléphone              │
│  SMS ou appel vocal avec code à 6 chiffres      │
├─────────────────────────────────────────────────┤
│           COUCHE 2 — OAuth Social               │
│  Google OAuth pour les utilisateurs connectés    │
├─────────────────────────────────────────────────┤
│           COUCHE 3 — Questions Culturelles       │
│  "Quel est le nom de votre premier enfant ?"    │
│  Questions personnalisées en dioula              │
├─────────────────────────────────────────────────┤
│           COUCHE 4 — Validation Communautaire    │
│  Pair du marché ou agent PNAVIM confirme         │
│  l'identité du marchand                          │
└─────────────────────────────────────────────────┘
```

### Mécanismes de sécurité

| Mécanisme | Description |
|-----------|------------|
| **Device Fingerprint** | Identification unique de l'appareil |
| **Trust Score** | Score de confiance basé sur l'historique |
| **RLS** | Row Level Security sur toutes les tables |
| **KYC Progressif** | 3 niveaux de vérification |
| **Audit Log** | Traçabilité complète des actions RBAC |
| **Géolocalisation** | Vérification du lieu habituel de connexion |

### Niveaux KYC

| Niveau | Vérification | Limite |
|--------|-------------|--------|
| **Basique** | Téléphone vérifié | Ventes < 500 000 F/mois |
| **Intermédiaire** | + Pièce d'identité | Ventes < 2 000 000 F/mois |
| **Complet** | + Selfie + Validation agent | Illimité |

---

## 7 — Mode Hors-Ligne

Les marchés de Côte d'Ivoire n'ont pas toujours une connexion internet fiable. La plateforme est conçue **offline-first** :

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ Marchand │────▶│ File locale   │────▶│ Serveur  │
│ (action) │     │ (IndexedDB)  │     │ (sync)   │
└──────────┘     └──────────────┘     └──────────┘
                       │
                  ┌────┴────┐
                  │ Réseau  │
                  │ détecté │
                  └────┬────┘
                       │
                  Synchronisation
                  automatique
```

| Fonctionnalité | Détail |
|---------------|--------|
| File d'attente | Opérations stockées localement en attente de réseau |
| Sync automatique | Envoi au retour de la connexion |
| Indicateur visuel | Statut réseau affiché en permanence |
| Données critiques | Stock, ventes du jour, factures en cache local |
| Résolution conflits | Dernière écriture gagne + notification |

---

## 8 — Accessibilité & Inclusion

### Conception universelle

La plateforme est conçue pour être utilisée par **toute personne**, quel que soit son niveau d'alphabétisation :

| Principe | Implémentation |
|----------|---------------|
| 🖼️ Pictogrammes | Chaque action est représentée par un émoji/icône universel |
| 👆 Boutons XXL | Minimum 56px de hauteur, zones de tap larges |
| 🎙️ Commande vocale | Enregistrement des ventes par la voix |
| 🔊 Retour audio | Chaque écran peut être lu à voix haute |
| 📳 Retour haptique | Vibrations de confirmation sur mobile |
| 🎭 Mascotte Tantie | Guide animé qui accompagne l'utilisateur |
| 🌍 Bilingue | Français + Dioula (audio et texte) |
| ♿ Mouvement réduit | Support `prefers-reduced-motion` |

### Parcours utilisateur type (marchand non-alphabétisé)

```
1. 🎙️ "J'ai vendu 3 bassines de tomates à 2000 francs"
   ↓
2. 🖼️ L'application affiche : [🍅 x3] [💰 6000 F] [✅ Valider]
   ↓
3. 👆 Le marchand appuie sur le gros bouton vert ✅
   ↓
4. 📳 Vibration + 🔊 "Vente enregistrée ! 6000 francs"
   ↓
5. 💰 Le solde du jour se met à jour automatiquement
```

---

## 9 — Impact Attendu

### Objectifs quantitatifs

| Indicateur | Objectif |
|------------|---------|
| Marchands formalisés | 500 000+ |
| Couverture CMU | 100% des marchands enrôlés |
| Traçabilité fiscale | Conformité RSTI |
| Agents déployés | 5 000+ sur tout le territoire |
| Coopératives connectées | 200+ |

### Bénéfices par acteur

| Acteur | Bénéfice |
|--------|---------|
| **Marchand** | Visibilité sur ses revenus, CMU automatique, accès au crédit |
| **État** | Données fiables sur le secteur informel, fiscalité élargie |
| **Banques** | Historique de ventes comme garantie de crédit |
| **Coopératives** | Gestion optimisée de la chaîne d'approvisionnement |
| **Producteurs** | Accès direct aux marchands, traçabilité des récoltes |

### Chaîne de valeur numérisée

```
🌿 Producteur ──▶ 🏢 Coopérative ──▶ 🛒 Marchand ──▶ 👥 Consommateur
     │                   │                  │
     │                   │                  ├── 📊 Données de vente
     │                   │                  ├── 🏥 CMU automatique
     │                   │                  └── 💳 Accès crédit
     │                   │
     │                   └── 📦 Commandes optimisées
     │
     └── 🌾 Traçabilité IGP
```

---

## 10 — Contacts

| | |
|---|---|
| 📧 Email | contact@pnavim.ci |
| 🌐 Site web | www.pnavim.ci |
| 📱 Application | [igp-ifn-connect.lovable.app](https://igp-ifn-connect.lovable.app) |

---

### Mentions légales

**PNAVIM** — Programme National d'Appui aux Vivriers de Côte d'Ivoire  
Ministère du Commerce, de l'Industrie et de la Promotion des PME  
République de Côte d'Ivoire

En partenariat avec :
- Ministère de la Santé et de l'Hygiène Publique (CMU)
- Direction Générale des Impôts (RSTI)

---

*Document généré le 18 février 2026*  
*Version 1.0*

*🌾 PNAVIM — Ensemble, valorisons nos vivriers !*
