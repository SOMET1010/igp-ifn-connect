

# Fix: Audio superposition dans OnboardingTutorial

## Problème identifié

Dans `OnboardingTutorial.tsx`, le bouton "Écouter" vérifie uniquement `isSpeaking` pour décider si on arrête ou on lance l'audio :

```typescript
if (isSpeaking) {
  stop();
} else {
  speak(step.audioText); // ← se lance même pendant le chargement
}
```

Quand l'utilisateur clique plusieurs fois pendant le chargement (avant que l'audio ne commence), `isSpeaking` est encore `false` mais `isLoading` est `true`. Chaque clic lance donc un nouvel appel ElevenLabs TTS. Quand les réponses arrivent, tous les audios jouent en même temps → superposition.

## Solution

Deux corrections complémentaires :

### 1. `OnboardingTutorial.tsx` - Vérifier `isLoading` en plus de `isSpeaking`

```typescript
const { speak, isSpeaking, isLoading, stop } = useTts();

const handlePlayAudio = useCallback(() => {
  if (isSpeaking || isLoading) {
    stop();
  } else {
    speak(step.audioText);
  }
}, [step, speak, isSpeaking, isLoading, stop]);
```

Et mettre à jour le bouton pour refléter l'état de chargement (spinner ou texte "Chargement...").

### 2. `useTts.ts` - Guard anti-doublon dans `speakWithElevenLabs`

Ajouter un `useRef` qui empêche deux appels concurrents à `generateSpeech`. Si un appel est déjà en cours, le nouveau annule l'ancien avant de continuer. Cela protège contre tous les composants, pas seulement OnboardingTutorial.

### Fichiers modifiés
- `src/shared/ui/OnboardingTutorial.tsx` (3 lignes changées)
- `src/shared/hooks/useTts.ts` (ajout guard ref ~5 lignes)

