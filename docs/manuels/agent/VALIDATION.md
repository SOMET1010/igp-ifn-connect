# ⏳ Validation des Marchands en Attente

Guide pour valider les marchands qui se sont inscrits eux-mêmes via le flux simplifié.

---

## 🔄 Comprendre le Flux

Quand un numéro de téléphone n'est pas reconnu, le marchand peut s'inscrire lui-même avec des informations minimales :

```
Marchand non reconnu
        ↓
Inscription simplifiée (nom, activité, marché)
        ↓
Statut : "En attente de validation"
        ↓
Agent notifié
        ↓
Validation sur le terrain
        ↓
Marchand actif ✅
```

---

## 📋 Accéder aux Demandes

1. Ouvrez l'application PNAVIM Agent
2. Sur l'écran d'accueil, appuyez sur **"En Attente"**
3. Vous voyez la liste filtrée par votre zone

```
┌─────────────────────────────┐
│  Marchands en attente (3)   │
│  ─────────────────────────  │
│                             │
│  ┌─────────────────────┐   │
│  │ 👤 Fatou Diarra     │   │
│  │ 📞 01 23 45 67 89   │   │
│  │ 🏪 Légumes          │   │
│  │ 📍 Marché Cocody    │   │
│  │ 📅 Il y a 2 heures  │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ 👤 Amadou Traoré    │   │
│  │ 📞 05 67 89 01 23   │   │
│  │ 🏪 Céréales         │   │
│  │ 📍 Marché Abobo     │   │
│  │ 📅 Hier             │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## ✅ Procédure de Validation

### Étape 1 : Préparer la Visite

Avant de vous déplacer :
1. Notez le marché indiqué
2. Appelez le marchand pour confirmer sa présence
3. Préparez le matériel (téléphone chargé)

### Étape 2 : Sur le Terrain

1. **Trouvez** le marchand à l'emplacement indiqué
2. **Vérifiez** son identité :
   - Demandez sa carte CMU
   - Confirmez le numéro de téléphone
3. **Complétez** les informations manquantes :
   - Photo CMU
   - Photo emplacement
   - Questions de sécurité

### Étape 3 : Dans l'Application

Appuyez sur la fiche du marchand :

```
┌─────────────────────────────┐
│  Fatou Diarra               │
│  ─────────────────────────  │
│                             │
│  📞 +225 01 23 45 67 89     │
│  🏪 Légumes                 │
│  📍 Marché Cocody           │
│                             │
│  ⚠️ Informations à compléter│
│  ─────────────────────────  │
│  □ Numéro CMU               │
│  □ Photo CMU                │
│  □ Photo emplacement        │
│  □ Questions de sécurité    │
│                             │
│  ┌─────────────────────┐   │
│  │ Compléter et valider│   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

Cliquez sur **"Compléter et valider"** et remplissez :

1. **Numéro CMU** (obligatoire)
2. **Photo CMU** (obligatoire)
3. **Photo emplacement** (obligatoire)
4. **Questions de sécurité** (2 questions minimum)

### Étape 4 : Confirmer la Validation

```
┌─────────────────────────────┐
│  Validation                 │
│  ─────────────────────────  │
│                             │
│  ✅ Toutes les informations │
│     sont complètes          │
│                             │
│  ┌─────────────────────┐   │
│  │   ✅ VALIDER        │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   ❌ REJETER        │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

---

## ❌ Rejeter une Demande

Si le marchand ne répond pas aux critères :

1. Appuyez sur **"Rejeter"**
2. Sélectionnez la raison :

| Raison | Cas d'usage |
|--------|-------------|
| Informations fausses | Nom incorrect, faux numéro |
| Marchand introuvable | Pas présent au marché |
| Doublon | Déjà inscrit avec autre numéro |
| Hors zone PNAVIM | Marché non couvert |
| Autre | Préciser dans les notes |

3. Ajoutez un commentaire si nécessaire
4. Confirmez le rejet

⚠️ Le marchand sera notifié du rejet.

---

## ⏰ Délais de Validation

| Priorité | Délai recommandé |
|----------|------------------|
| Inscription < 24h | Valider sous 48h |
| Inscription > 24h | Valider sous 72h |
| Inscription > 7j | Contact urgent |

---

## 📊 Tableau de Bord

Suivez vos validations :

```
┌─────────────────────────────┐
│  Mes validations ce mois    │
│  ─────────────────────────  │
│                             │
│  ✅ Validés     : 12        │
│  ❌ Rejetés     : 2         │
│  ⏳ En attente  : 3         │
│                             │
│  ⏱️ Temps moyen : 1.5 jours │
│                             │
└─────────────────────────────┘
```

---

## 💡 Bonnes Pratiques

1. **Réactivité** : Validez rapidement pour ne pas faire attendre les marchands
2. **Rigueur** : Vérifiez toujours l'identité sur le terrain
3. **Pédagogie** : Profitez de la visite pour former le marchand
4. **Communication** : Prévenez avant de vous déplacer

---

## 🆘 Cas Particuliers

### Le marchand a changé de marché

1. Mettez à jour le marché dans le formulaire
2. Capturez la nouvelle position GPS
3. Validez normalement

### Le marchand n'a pas de CMU

1. Demandez une pièce d'identité alternative
2. Notez "CMU en cours" dans les commentaires
3. Validez avec suivi à 30 jours

### Le marchand refuse la photo

1. Expliquez l'importance (sécurité, identification)
2. Si refus persistant, rejetez la demande

---

*Une validation rigoureuse = un réseau de confiance !* 🛡️
