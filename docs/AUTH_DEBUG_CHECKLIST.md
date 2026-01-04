# Checklist QA - Authentification Vocale PNAVIM

## 🔊 Audio (Anti-superposition)

### Tests à effectuer
- [ ] **Un seul audio à la fois** : Cliquer rapidement sur "Écouter" plusieurs fois → UNE seule voix joue
- [ ] **Bouton STOP fonctionne** : Pendant la lecture, le bouton STOP arrête immédiatement
- [ ] **Changement de page** : Naviguer ailleurs pendant la lecture → L'audio s'arrête
- [ ] **Debounce 700ms** : Double-clic rapide → Ignoré, pas de superposition
- [ ] **Priorité haute** : Message d'erreur interrompt le message en cours

### Fichiers impliqués
- `src/shared/services/voice/voiceQueue.ts`
- `src/shared/hooks/useVoiceQueue.ts`
- `src/shared/hooks/useTts.ts`

---

## 📱 Téléphone - Mode Clavier

### Tests à effectuer
- [ ] **Blocage à 10 chiffres** : Impossible de saisir plus de 10 chiffres
- [ ] **Format affiché** : "07 01 02 03 04" (avec espaces)
- [ ] **Stockage brut** : Valeur interne = "0701020304"
- [ ] **Validation préfixe CI** : Alerte si ne commence pas par 01, 05, 07
- [ ] **Compteur visible** : "8/10 chiffres" ou "2 chiffres restants"
- [ ] **Bouton effacer** : Supprime 1 chiffre à la fois
- [ ] **Bouton effacer tout** : Réinitialise le champ
- [ ] **Feedback haptique** : Vibration légère à chaque touche

### Fichiers impliqués
- `src/components/shared/PhoneNumPad.tsx`
- `src/components/shared/PhoneInput.tsx`

---

## 🎤 Téléphone - Mode Vocal

### Tests à effectuer
- [ ] **Mode guidé par 2 chiffres** : "Dis zéro sept" → "J'ai noté 07. Continue."
- [ ] **Répétition après chaque paire** : Le système lit les chiffres captés
- [ ] **Affichage progressif** : Les chiffres apparaissent à l'écran au fur et à mesure
- [ ] **Commande "répète"** : Le système relit les chiffres actuels
- [ ] **Commande "corrige"** : Supprime les 2 derniers chiffres
- [ ] **Commande "efface"** : Réinitialise tout
- [ ] **Commande "stop"** : Bascule vers le clavier
- [ ] **Fallback automatique** : Si STT échoue 3 fois → Propose le clavier

### Fichiers impliqués
- `src/features/auth/hooks/useVoiceTranscription.ts`
- `src/features/auth/config/voicePhoneScripts.ts`

---

## ⚠️ Gestion des Erreurs

### Tests à effectuer

#### Micro refusé (AUTH-01)
- [ ] **Détection** : Refuser le micro → Message explicite
- [ ] **Action** : Bouton "Mode clavier" visible et fonctionnel
- [ ] **Code incident** : "AUTH-01" affiché

#### Réseau coupé (AUTH-02)
- [ ] **Détection** : Couper le WiFi → Message "Pas de connexion internet"
- [ ] **Action** : Bouton "Réessayer" visible
- [ ] **Code incident** : "AUTH-02" affiché

#### Timeout 12s (AUTH-03)
- [ ] **Détection** : Simuler réseau lent → Message après 12s
- [ ] **Action** : Boutons "Réessayer" et "Annuler" visibles
- [ ] **Code incident** : "AUTH-03" affiché

#### Numéro non reconnu (AUTH-04)
- [ ] **Détection** : Saisir numéro inexistant → Message clair
- [ ] **Action** : Bouton "Réessayer" + "Appeler support"
- [ ] **Code incident** : "AUTH-04" affiché

#### Erreur serveur (AUTH-05)
- [ ] **Détection** : Erreur 500 → Message "Erreur serveur"
- [ ] **Action** : Bouton "Réessayer"
- [ ] **Code incident** : "AUTH-05" affiché

### Fichiers impliqués
- `src/components/shared/AuthErrorBanner.tsx`
- `src/features/auth/hooks/useSocialAuth.ts`

---

## 🔄 États et Transitions

### Tests à effectuer
- [ ] **Loading visible** : Spinner + texte pendant le chargement
- [ ] **Bouton Annuler** : Toujours accessible pendant le loading
- [ ] **Pas d'écran figé** : Maximum 12s avant message d'erreur
- [ ] **Retour possible** : Bouton retour fonctionne à chaque étape

---

## 📝 Codes d'erreur

| Code | Type | Message |
|------|------|---------|
| AUTH-01 | Micro | Micro non autorisé |
| AUTH-02 | Réseau | Pas de connexion internet |
| AUTH-03 | Timeout | Réseau trop lent (>12s) |
| AUTH-04 | Validation | Numéro non reconnu |
| AUTH-05 | Serveur | Erreur serveur |

---

## ✅ Validation Finale

- [ ] Flow complet testé sur mobile (Chrome Android)
- [ ] Flow complet testé sur Safari iOS
- [ ] Aucune superposition audio observée
- [ ] Tous les messages d'erreur sont explicites
- [ ] Le mode clavier fonctionne comme fallback fiable
