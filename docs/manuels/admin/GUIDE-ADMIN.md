# ⚙️ Guide Administrateur PNAVIM

Documentation complète pour l'administration du portail PNAVIM.

---

## 🎯 Responsabilités Admin

En tant qu'administrateur, vous gérez :

1. **Utilisateurs** - Agents, marchands, coopératives
2. **Configuration** - Paramètres système
3. **Sécurité** - Rôles et permissions
4. **Monitoring** - Tableaux de bord et alertes
5. **Support** - Résolution des problèmes

---

## 📊 Tableau de Bord Principal

```
┌─────────────────────────────────────────────────┐
│  PNAVIM Administration                          │
│  ───────────────────────────────────────────── │
│                                                 │
│  📈 Vue d'Ensemble                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│  │  1,234  │ │    56   │ │    12   │ │  98%  ││
│  │Marchands│ │ Agents  │ │  Coops  │ │ Actif ││
│  └─────────┘ └─────────┘ └─────────┘ └───────┘│
│                                                 │
│  🔔 Alertes (3)                                 │
│  ├─ ⚠️ 5 marchands en attente de validation    │
│  ├─ 🔴 2 demandes d'agent à examiner           │
│  └─ 🟡 Mise à jour disponible                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 👥 Gestion des Utilisateurs

### Vue Liste Utilisateurs

| Filtre | Options |
|--------|---------|
| Rôle | Tous, Marchands, Agents, Coopératives, Admins |
| Statut | Actif, Inactif, En attente, Bloqué |
| Recherche | Nom, Téléphone, Email |

### Actions sur Utilisateur

```
┌─────────────────────────────────────────────────┐
│  👤 Aminata Coulibaly                           │
│  ───────────────────────────────────────────── │
│                                                 │
│  📱 +225 07 12 34 56 78                        │
│  🏷️ Rôle : Marchand                            │
│  📍 Marché : Adjamé                             │
│  📅 Inscrit : 15/01/2024                        │
│  ✅ Statut : Actif                              │
│                                                 │
│  Actions                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │ Modifier│ │ Bloquer │ │Supprimer│          │
│  └─────────┘ └─────────┘ └─────────┘          │
│                                                 │
│  Historique                                     │
│  ├─ 15/01 - Création compte                    │
│  ├─ 16/01 - Première vente                     │
│  └─ 20/01 - 50 transactions                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Gestion des Rôles (RBAC)

### Profils Disponibles

| Profil | Description | Permissions clés |
|--------|-------------|------------------|
| `super_admin` | Accès total | Toutes |
| `admin` | Administration standard | Utilisateurs, Config |
| `agent_supervisor` | Supervision agents | Lecture agents/marchands |
| `support` | Support technique | Lecture, déblocage comptes |

### Créer un Nouveau Profil

1. Aller dans **Sécurité > Profils RBAC**
2. Cliquer sur **"Nouveau profil"**
3. Définir les permissions par ressource

```
┌─────────────────────────────────────────────────┐
│  Nouveau Profil                                 │
│  ───────────────────────────────────────────── │
│                                                 │
│  Nom : superviseur_regional                     │
│  Description : Supervision des agents par zone │
│                                                 │
│  Permissions                                    │
│  ┌────────────────────────────────────────────┐│
│  │ Ressource        │ Voir │ Créer │ Modifier ││
│  │──────────────────│──────│───────│──────────││
│  │ Marchands        │  ✅  │  ❌   │    ❌    ││
│  │ Agents           │  ✅  │  ❌   │    ✅    ││
│  │ Transactions     │  ✅  │  ❌   │    ❌    ││
│  │ Rapports         │  ✅  │  ✅   │    ❌    ││
│  └────────────────────────────────────────────┘│
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📋 Demandes en Attente

### Demandes Agent

Les utilisateurs peuvent demander à devenir agent :

```
┌─────────────────────────────────────────────────┐
│  Demande Agent #123                             │
│  ───────────────────────────────────────────── │
│                                                 │
│  👤 Kouadio Jean                                │
│  📱 +225 05 11 22 33 44                        │
│  🏢 Organisation : ANADER                       │
│  📍 Zone souhaitée : Bouaké                     │
│                                                 │
│  Motivation :                                   │
│  "Je travaille sur le terrain avec les         │
│  agriculteurs depuis 5 ans..."                  │
│                                                 │
│  ┌──────────────┐ ┌──────────────┐             │
│  │  ✅ Approuver │ │  ❌ Rejeter  │             │
│  └──────────────┘ └──────────────┘             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Marchands en Attente

Marchands inscrits via le flux simplifié :

| Marchand | Téléphone | Marché | Inscrit | Action |
|----------|-----------|--------|---------|--------|
| Fatou D. | 01 23 45 67 | Cocody | Il y a 2h | [Assigner] |
| Amadou T. | 05 67 89 01 | Abobo | Hier | [Assigner] |

**Action "Assigner"** : Attribue le marchand à un agent pour validation terrain.

---

## 📊 Rapports et Statistiques

### Rapports Disponibles

| Rapport | Fréquence | Contenu |
|---------|-----------|---------|
| Activité journalière | Quotidien | Transactions, inscriptions |
| Performance agents | Hebdo | Enrôlements, validations |
| CMU Collectée | Mensuel | Montants, répartition |
| Croissance | Mensuel | Évolution utilisateurs |

### Générer un Rapport

```
┌─────────────────────────────────────────────────┐
│  Générer Rapport                                │
│  ───────────────────────────────────────────── │
│                                                 │
│  Type : Activité journalière                    │
│  Période : 01/01/2024 - 31/01/2024             │
│  Format : ○ PDF  ● Excel  ○ CSV                │
│                                                 │
│  Filtres                                        │
│  □ Par région                                   │
│  ☑ Par type d'activité                         │
│  □ Par agent                                    │
│                                                 │
│  ┌─────────────────────┐                       │
│  │   📥 Télécharger    │                       │
│  └─────────────────────┘                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ⚙️ Configuration Système

### Paramètres Généraux

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| Taux CMU | 1% | Pourcentage prélevé sur ventes |
| Taux RSTI | 0.5% | Redevance statistique |
| OTP Expiration | 5 min | Durée validité code |
| Session Timeout | 30 min | Déconnexion auto |

### Marchés

Gérer la liste des marchés :

1. Aller dans **Configuration > Marchés**
2. Ajouter/Modifier les marchés
3. Définir les coordonnées GPS

---

## 🔒 Sécurité

### Journaux d'Audit

Toutes les actions sensibles sont enregistrées :

```
┌─────────────────────────────────────────────────┐
│  Journal d'Audit                                │
│  ───────────────────────────────────────────── │
│                                                 │
│  10:45 | admin@pnavim.ci                       │
│         Utilisateur bloqué : #1234              │
│         Raison : Activité suspecte              │
│                                                 │
│  10:30 | superviseur@pnavim.ci                 │
│         Rapport généré : activite_janvier.pdf  │
│                                                 │
│  09:15 | admin@pnavim.ci                       │
│         Profil RBAC modifié : agent_terrain    │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Alertes Sécurité

| Type | Seuil | Action |
|------|-------|--------|
| Tentatives OTP | 3 échecs | Blocage 30 min |
| Connexions suspectes | Score < 50 | Validation requise |
| Transactions anormales | > 500k FCFA | Revue manuelle |

---

## 🆘 Support Technique

### Débloquer un Compte

1. Rechercher l'utilisateur
2. Cliquer sur **"Débloquer"**
3. Choisir la raison
4. L'utilisateur est notifié

### Réinitialiser l'Authentification

1. Rechercher l'utilisateur
2. Cliquer sur **"Réinitialiser auth"**
3. L'utilisateur devra reconfigurer ses questions

---

## 📞 Contacts Escalade

| Niveau | Contact | Délai |
|--------|---------|-------|
| Support L1 | support@pnavim.ci | < 4h |
| Support L2 | tech@pnavim.ci | < 24h |
| Urgence | +225 XX XX XX XX | Immédiat |

---

*Une bonne administration = un programme qui fonctionne ! 🛡️*
