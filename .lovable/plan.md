

# Document de Presentation - Plateforme IFN / PNAVIM-CI

## Creation d'un document de presentation complet

Le plan consiste a creer un fichier Markdown `docs/PRESENTATION-IFN-PNAVIM.md` contenant la documentation de presentation de la plateforme.

---

## Contenu du document

### 1. Page de couverture
- Titre : **Plateforme IFN - Inclusion Financiere Numerique**
- Sous-titre : Programme National d'Appui aux Vivriers de Cote d'Ivoire (PNAVIM)
- Slogan : "Formaliser, Proteger, Prosperer"
- Contexte institutionnel : Ministere du Commerce, de l'Industrie et de la Promotion des PME

### 2. Le Probleme
- 500 000+ marchands de vivriers dans le secteur informel
- Aucune tracabilite des ventes
- Pas de protection sociale (CMU)
- Exclusion financiere massive
- Barriere de l'alphabetisation

### 3. La Solution - Plateforme IFN
Application web mobile-first avec 5 portails :

| Portail | Public cible | Fonctionnalites cles |
|---------|-------------|---------------------|
| Marchand | Vendeurs de vivriers | Vente vocale, stock, caisse, factures, CMU |
| Agent | Agents terrain PNAVIM | Enrolement, suivi marchands, validation |
| Cooperative | Cooperatives agricoles | Gestion membres, commandes, producteurs |
| Producteur | Agriculteurs | Recoltes, commandes, profil |
| Admin | Administrateurs | Tableau de bord, statistiques, documentation |

### 4. Design System Julaba
- **Philosophie** : Voice-First, Zero Text, XXL Touch, Feedback sensoriel
- **Signification** : "Julaba" - "Ton dje est bien gere" (ton argent est bien gere)
- **Accessibilite** : Interface utilisable par des personnes non-alphabetisees
- **Bilingue** : Francais et Dioula
- **Composants** : Boutons geants (56px min), pictogrammes, retour haptique/audio

### 5. Fonctionnalites detaillees par portail

**Marchand (16 pages)** :
- Enregistrement vocal des ventes (Speech-to-Text)
- Gestion de stock avec alertes
- Caisse et cloture journaliere
- Factures conformes FNE (Facture Normalisee Electronique)
- Scanner code-barres / QR
- Historique des transactions (mode hors-ligne)
- Inscription CMU automatique (prelevement 1%)
- KYC progressif
- Marketplace
- Aide contextuelle avec mascotte "Tantie"
- Authentification vocale et par empreinte

**Agent (5 pages)** :
- Tableau de bord avec statistiques d'enrolement
- Wizard d'enrolement en 5 etapes
- Liste et suivi des marchands
- Profil et notifications
- Synchronisation hors-ligne

**Cooperative (7 pages)** :
- Dashboard avec graphiques (revenus, commandes)
- Gestion des membres
- Gestion des producteurs
- Commandes et suivi
- Profil cooperatif
- Export PDF

**Producteur (4 pages)** :
- Dashboard avec statistiques
- Gestion des recoltes
- Suivi des commandes
- Profil et certifications

**Admin** :
- Dashboard global
- Generation de documentation PDF
- Statistiques consolidees

### 6. Architecture Technique

```text
+--------------------------------------------------+
|              Frontend (React + Vite)              |
|  TypeScript | Tailwind CSS | Framer Motion        |
+--------------------------------------------------+
|           Design System Julaba                    |
|  Boutons | Cartes | Navigation | Formulaires      |
+--------------------------------------------------+
|              Lovable Cloud (Backend)              |
|  Auth | Database | Edge Functions | Storage       |
+--------------------------------------------------+
```

- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS
- **UI** : Design System Julaba + shadcn/ui
- **Backend** : Lovable Cloud (authentification, base de donnees, fonctions serverless)
- **Architecture** : Feature-First (vertical slices)
- **Animations** : Framer Motion
- **Cartographie** : Leaflet / React-Leaflet
- **Graphiques** : Recharts
- **PDF** : jsPDF + jspdf-autotable
- **QR Codes** : qrcode.react
- **Audio** : ElevenLabs (synthese vocale)

### 7. Securite et Authentification
- Protocole a 4 couches pour inclusion
- OTP par telephone
- Authentification sociale (Google OAuth)
- Authentification vocale
- Questions culturelles de securite
- Validation par agent (peer validation)
- Empreinte digitale (Device Fingerprint)
- Score de confiance (Trust Score)
- RLS (Row Level Security) sur toutes les tables

### 8. Mode Hors-Ligne
- File d'attente des operations hors-ligne
- Synchronisation automatique au retour du reseau
- Indicateur visuel du statut de connexion
- Stockage local des donnees critiques

### 9. Accessibilite et Inclusion
- Interface pictographique (zero texte obligatoire)
- Boutons XXL (minimum 56px)
- Enregistrement vocal des ventes
- Feedback haptique et audio
- Support du mode "mouvement reduit"
- Mascotte "Tantie" pour guidance
- Bilingue francais / dioula

### 10. Impact attendu
- Formalisation de 500 000+ marchands
- Couverture CMU automatique
- Tracabilite fiscale (RSTI)
- Inclusion financiere numerique
- Acces au credit facilite par l'historique de ventes

---

## Details techniques de mise en oeuvre

Le document sera cree sous forme de fichier Markdown riche dans `docs/PRESENTATION-IFN-PNAVIM.md` avec :
- Tableaux recapitulatifs
- Diagrammes en texte ASCII
- Sections structurees pour impression ou conversion PDF
- Informations de contact et mentions legales

