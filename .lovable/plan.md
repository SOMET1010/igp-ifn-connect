

# Renommage de la Plateforme : PNAVIM-CI --> JULABA

## Contexte

La plateforme change de nom. Toutes les references visibles "PNAVIM-CI" et "PNAVIM" doivent devenir "JULABA" (ou "JULABA" selon le contexte). Le design system Julaba existe deja -- c'est le nom de la plateforme elle-meme qui s'aligne dessus.

## Scope de l'intervention

L'audit du codebase revele **125 fichiers** contenant "PNAVIM". Le renommage se fera en plusieurs couches, par priorite.

---

## Phase 1 : Branding visible (utilisateur final)

Fichiers modifies :
- **`index.html`** : titre, meta tags, OG tags, loader text, SEO keywords
- **`public/manifest.json`** : name, short_name, description
- **`src/pages/Home.tsx`** : textes d'accueil
- **`src/shared/ui/InstitutionalHeader.tsx`** : titre "PNAVIM-CI" -> "JULABA"
- **`src/shared/ui/InstitutionalFooter.tsx`** : copyright
- **`src/shared/ui/SimpleLoginPage.tsx`** : branding login
- **`src/shared/ui/DemoBanner.tsx`** : si mention PNAVIM
- **`src/features/public/components/pnavim/PnavimInstitutionalHeader.tsx`** : "PNAVIM-CI" -> "JULABA", sous-titre adapte
- **`src/features/auth/pages/AuthPage.tsx`** : branding authentification
- **`src/features/onboarding/OnboardingFlow.tsx`** : messages de bienvenue
- **`src/features/merchant/pages/MerchantVoiceRegister.tsx`** : branding inscription
- **`src/features/cooperative/pages/CooperativeDashboard.tsx`** : sous-titre
- **`src/features/admin/pages/AdminDocumentation.tsx`** : texte admin

## Phase 2 : Design tokens et configuration

- **`src/styles/design-tokens.ts`** : renommer `PNAVIM_COLORS`, `PNAVIM_HSL`, `PNAVIM_SHADOWS`, `PNAVIM_SPACING`, `PNAVIM_TYPOGRAPHY`, `PNAVIM_BREAKPOINTS`, `PNAVIM_ANIMATIONS` et les types associes en `JULABA_*`
- **`tailwind.config.ts`** : import `JULABA_HSL`, namespace couleurs `julaba.*` au lieu de `pnavim.*`, shadows `julaba-*`
- **`src/shared/config/voiceConfig.ts`** : `PNAVIM_VOICES` -> `JULABA_VOICES`, type `PnavimVoiceId` -> `JulabaVoiceId`

## Phase 3 : Composants Pnavim -> Julaba (renommage fichiers)

Le dossier `src/features/public/components/pnavim/` contient 10 composants prefixes "Pnavim". Ils seront renommes :
- `PnavimButton` -> `JulabaPublicButton`
- `PnavimCard` -> `JulabaPublicCard`
- `PnavimHelpButton` -> `JulabaHelpButton`
- `PnavimHeroCard` -> `JulabaHeroCard`
- `PnavimInstitutionalHeader` -> `JulabaInstitutionalHeader`
- `PnavimPillButton` -> `JulabaPillButton`
- `PnavimStat` -> `JulabaStat`
- `PnavimVoiceFab` -> `JulabaVoiceFab`
- `PnavimWaxCurve` -> `JulabaWaxCurve`
- Mise a jour de l'index d'export et de tous les imports dans ~20 fichiers consommateurs

## Phase 4 : Classes CSS Tailwind

Toutes les classes `pnavim-*` (couleurs, ombres) seront renommees `julaba-*` dans :
- `tailwind.config.ts` (definition)
- ~30 fichiers TSX utilisant `text-pnavim-*`, `bg-pnavim-*`, `border-pnavim-*`, `shadow-pnavim-*`

## Phase 5 : Services et hooks

- **`src/shared/services/tts/elevenlabsTts.ts`** : `PNAVIM_VOICES` -> `JULABA_VOICES`
- **`src/shared/hooks/useTts.ts`** : imports et types
- **`src/shared/ui/AudioButton.tsx`** : imports
- **`src/shared/ui/LanguageSelector.tsx`** : imports
- **`src/shared/audio/tts/TTSManager.ts`** : imports
- **`src/features/auth/config/personas.ts`** : imports
- **`src/features/auth/components/VoiceSocialAuth.tsx`** : type cast
- **`src/features/auth/components/HumanFallback.tsx`** : texte support
- **`src/shared/services/logger.ts`** : nom fichier export logs

## Phase 6 : Documentation

- **`docs/PRESENTATION-IFN-PNAVIM.md`** -> `docs/PRESENTATION-JULABA.md` (renomme + contenu mis a jour)
- **`docs/REPONSES-JURY-IFN-PNAVIM.md`** -> `docs/REPONSES-JURY-JULABA.md`
- **`docs/manuels/README.md`** : references PNAVIM -> JULABA
- **`docs/manuels/marchand/GUIDE-MARCHAND.md`** : contenu

## Phase 7 : LocalStorage et constantes internes

- `pnavim_onboarding_complete` -> `julaba_onboarding_complete` (avec migration de la cle existante pour ne pas casser les sessions actives)
- `pnavim-logs-*` -> `julaba-logs-*`

---

## Ce qui ne change PAS

- Les routes (`/marchand`, `/agent`, `/cooperative`, etc.) restent identiques
- La logique metier, les tables de base de donnees, les edge functions ne sont pas impactes
- Le design system Julaba (`src/shared/ui/julaba/`) garde son nom (il est deja correct)

## Strategie d'implementation

L'implementation sera decoupee en 3-4 messages successifs pour rester dans les limites de taille, en commencant par les fichiers les plus visibles (Phase 1 + 2), puis les composants (Phase 3 + 4), puis les services et docs (Phase 5 + 6 + 7).

