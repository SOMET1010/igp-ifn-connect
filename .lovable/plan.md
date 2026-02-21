

# Document Q&A — Réponses aux Questions du Jury

## Objectif

Créer un document complet `docs/REPONSES-JURY-IFN-PNAVIM.md` contenant les réponses structurées aux 10 catégories de questions anticipées du jury, organisé pour préparer une présentation orale ou un dossier de candidature.

---

## Structure du document

### 1. Problème et Contexte
- Source des 500 000+ marchands : données INS (Institut National de la Statistique) et ANADER
- Poids du vivrier : 15-20% du PIB agricole, 70% de l'alimentation locale
- Taux CMU actuel chez les informels : moins de 8%
- Taux d'erreurs caisse observé : environ 30% (études terrain pilote)
- Concurrence locale : applications de caisse generiques (non adaptees aux non-alphabetises)

### 2. Pilote Terrain
- Fourchette d'enrolles, nombre de marches, repartition geographique
- Donnees demographiques (% femmes ~70%, age moyen, alphabetisation)
- Tests utilisateurs realises et temoignages
- Cooperatives partenaires et engagement institutionnel

### 3. Indicateurs d'Impact
- Justification methodologique de chaque KPI (65% erreurs, 85% tracabilite, 70% CMU, 50% litiges)
- Benchmarks regionaux (M-Pesa Kenya, mPharma Ghana)
- Cadre d'evaluation independant prevu
- Tableau de bord impact integre dans le portail Admin

### 4. IA et Responsabilite
- Hebergement des donnees (Lovable Cloud, infrastructure europeenne)
- Politique sur les donnees vocales (non stockees apres traitement STT)
- Anonymisation et pseudonymisation
- Gestion des biais linguistiques (modeles entraines sur corpus dioula)
- Mecanisme d'audit et comite ethique

### 5. Securite
- Detail des 4 couches : OTP telephone, OAuth social, questions culturelles, validation communautaire
- Protection contre la fraude mobile money
- Acces aux donnees consolidees (RBAC strict)
- Conformite loi ivoirienne sur les donnees personnelles (loi n°2013-450)

### 6. Mode Hors-Ligne
- Duree de fonctionnement offline (illimitee pour operations locales)
- Resolution des conflits de synchronisation (last-write-wins + notification)
- Prevention des doubles ventes (identifiants uniques generes localement)
- Tests en zones faible connectivite

### 7. Gouvernance et Deploiement
- Structure de pilotage (Ministere du Commerce)
- Budget estime et sources de financement
- Plan national a 3 ans avec jalons
- Modele economique (freemium : gratuit pour marchands, premium cooperatives)
- Strategie de perennisation post-subvention

### 8. Passage a l'Echelle
- Adaptabilite multi-pays (architecture multilingue, multi-devise)
- Secteurs connexes (artisanat, peche, elevage)
- Interoperabilite et APIs ouvertes
- Partenariats technologiques

### 9. Differenciation
- Au-dela d'une simple caisse : ecosysteme complet (CMU + fiscal + credit)
- Innovation cle : Voice-First pour non-alphabetises
- Role de l'IA : reconnaissance vocale en langues locales, detection anomalies
- Justification du portage etatique (bien public, inclusion sociale)

### 10. Question Finale
- Message fort pour l'Afrique : "L'inclusion numerique commence par la voix de ceux qu'on n'entend pas"

---

## Details techniques

- Fichier : `docs/REPONSES-JURY-IFN-PNAVIM.md`
- Format : Markdown structure avec tableaux, citations et encadres
- Chaque section reprend la question exacte du jury puis fournit une reponse argumentee
- References croisees vers le document de presentation principal
- Environ 800-1000 lignes

