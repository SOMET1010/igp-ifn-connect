

# Renommage PNAVIM → JÙLABA : Complétion Phases 1-2

## Constat

Les Phases 1 et 2 ont ete partiellement implementees. L'audit revele encore **77 fichiers** avec des references "PNAVIM". Les headers/footers et index.html sont deja mis a jour. Voici les modifications restantes.

---

## Batch 1 : Textes visibles par l'utilisateur

### `src/shared/lib/translations.ts`
- Ligne 1-5 : commentaire "Traductions PNAVIM" → "Traductions JÙLABA"
- Ligne 33 : `platform_title: "PNAVIM"` → `platform_title: "JÙLABA"`

### `src/features/auth/config/loginConfigs.ts`
- Ligne 64 : `@pnavim.ci` → `@julaba.ci`
- Ligne 126 : `"Administration PNAVIM-CI"` → `"Administration JÙLABA"`
- Ligne 129 : `"Portail d'administration PNAVIM-CI"` → `"Portail d'administration JÙLABA"`

### `src/shared/ui/UnifiedLoginPage.tsx`
- Ligne 87 : `"PNAVIM-CI"` → `"JÙLABA"`

### `src/features/cooperative/pages/CooperativeRegister.tsx`
- Ligne 199 : `"Plateforme PNAVIM"` → `"Plateforme JÙLABA"`

---

## Batch 2 : Imports et references internes

### `src/shared/ui/LanguageSelector.tsx`
- Ligne 9 : `PNAVIM_VOICES` → `JULABA_VOICES`
- Ligne 24 : commentaire "voix PNAVIM" → "voix JÙLABA"
- Ligne 29 : `PNAVIM_VOICES.DEFAULT` → `JULABA_VOICES.DEFAULT`

### `src/shared/hooks/useTts.ts`
- Ligne 13 : `PNAVIM_VOICES, type PnavimVoiceId` → `JULABA_VOICES, type JulabaVoiceId`
- Ligne 29 : `PnavimVoiceId` → `JulabaVoiceId`
- Ligne 89 : `PNAVIM_VOICES.GBAIRAI` / `PNAVIM_VOICES.DEFAULT` → `JULABA_VOICES.*`
- Commentaires lignes 1-4, 64, 68 : "PNAVIM" → "JÙLABA"

### `src/features/public/components/pnavim/PnavimHeroCard.tsx`
- Ligne 8 : `PNAVIM_VOICES` → `JULABA_VOICES`
- Ligne 126 : `PNAVIM_VOICES.DEFAULT` → `JULABA_VOICES.DEFAULT`

---

## Batch 3 : Identifiants techniques

### `src/features/auth/hooks/useDeviceFingerprint.ts`
- Lignes 50-52 : `'PNAVIM 🇨🇮'` → `'JULABA 🇨🇮'`

### `src/pages/public/HealthPage.tsx`
- Lignes 66, 71 : `'pnavim_test'` → `'julaba_test'`

### `src/shared/services/logger.ts`
- Ligne 320 : `pnavim-logs-` → `julaba-logs-`

### `src/features/admin/pages/AdminCardsSearch.tsx`
- Ligne 77 : `pnavim_cartes_` → `julaba_cartes_`

---

## Batch 4 : Classes CSS `pnavim-*` → `julaba-*`

Les classes Tailwind `pnavim-*` fonctionnent grace aux alias dans `tailwind.config.ts`, mais doivent etre mises a jour pour coherence. Fichiers concernes (19 fichiers) :

- `PnavimButton.tsx` : lignes 25-29, 69 (`bg-pnavim-primary`, `text-pnavim-*`, `ring-pnavim-primary`)
- `PnavimCard.tsx` : lignes 24-28, 69, 93-94, 99, 104 (`border-pnavim-border`, `bg-pnavim-primary/10`, etc.)
- `PnavimStat.tsx` : lignes 28-31, 49, 77, 83, 89 (`bg-pnavim-primary/10`, `text-pnavim-foreground`, etc.)
- `HelpSectionContent.tsx` : lignes 101, 104, 119, 121-122 (`border-pnavim-secondary`, etc.)
- `CMUSectionContent.tsx` : ligne 86 (`border-pnavim-secondary`)
- `AddPromotionDialog.tsx` : ligne 90 (`shadow-pnavim-primary`)
- `PhotoCapture.tsx` : ligne 56 (`shadow-pnavim-secondary`)
- `StepProgress.tsx` : lignes 24, 26 (`shadow-pnavim-secondary`, `shadow-pnavim-primary`)

Remplacement systematique : `pnavim-primary` → `julaba-primary`, `pnavim-secondary` → `julaba-secondary`, etc.

---

## Batch 5 : Commentaires et documentation en code

Mise a jour des commentaires JSDoc et headers dans :
- `src/features/producer/types/producer.types.ts` : "PNAVIM" → "JÙLABA"
- `src/features/producer/services/producerService.ts` : "PNAVIM" → "JÙLABA"
- `src/features/producer/pages/ProducerDashboard.tsx` : "PNAVIM" → "JÙLABA"
- `src/features/auth/hooks/useSocialAuth.ts` : "PNAVIM" → "JÙLABA"
- `src/features/auth/components/PersonaSelector.tsx` : "PNAVIM" → "JÙLABA"
- `src/shared/ui/UnifiedLoginPage.tsx` : "PNAVIM" → "JÙLABA"
- `src/features/public/components/pnavim/index.ts` : "PNAVIM" → "JÙLABA"
- `src/features/public/components/pnavim/PnavimPillButton.tsx` : "PNAVIM" → "JÙLABA"
- `src/features/public/components/pnavim/PnavimVoiceFab.tsx` : "PNAVIM" → "JÙLABA"
- `src/features/public/index.ts` : "PNAVIM" → "JÙLABA"

---

## Ce qui ne change PAS dans cette phase

- Les noms de fichiers `Pnavim*.tsx` (Phase 3 ulterieure)
- Les exports `PnavimButton`, `PnavimCard`, etc. (Phase 3)
- Les alias deprecated dans `design-tokens.ts` (restent pour compatibilite)
- Les routes applicatives

## Estimation

~35 fichiers modifies, ~80 remplacements de texte. Aucun changement de logique metier.

