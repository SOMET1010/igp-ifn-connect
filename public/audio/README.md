# 🎙️ Audio Pré-enregistrés pour IFN

Ce dossier contient les fichiers audio pré-enregistrés pour l'accessibilité vocale de l'application.

## 📁 Structure

```
audio/
├── fr/           # Français
│   ├── welcome.mp3
│   ├── listen.mp3
│   ├── wait.mp3
│   ├── confirm.mp3
│   ├── success.mp3
│   ├── error_noise.mp3
│   ├── error_unknown.mp3
│   └── ...
├── nouchi/       # Nouchi (Français ivoirien "soft")
│   ├── welcome.mp3      → "Salut la famille ! Pour rentrer dans ton coin..."
│   ├── listen.mp3       → "Vas-y, on t'écoute. Donne ton numéro chap-chap."
│   ├── wait.mp3         → "Attends un peu, on regarde si c'est bon..."
│   ├── confirm.mp3      → "J'ai entendu {phone}. C'est le bon way ?"
│   ├── success.mp3      → "C'est validé ! Tu es en place."
│   ├── error_noise.mp3  → "Y'a trop de bruit, on n'a pas entendu."
│   ├── error_unknown.mp3 → "Ah, on connait pas ce numéro là."
│   └── ...
├── dioula/       # Dioula (Jula)
│   ├── welcome.mp3
│   └── ...
└── README.md
```

---

## 🔥 Voice Design Nouchi (PRIORITAIRE)

### Casting vocal recommandé
- **Ton**: "Grand Frère" rassurant, pas formel
- **Voix**: Masculine ou féminine, ivoirienne authentique
- **Rythme**: Posé mais dynamique
- **Énergie**: Bienveillante, jamais administrative

### Scripts Nouchi complets

| Clé | Script Nouchi |
|-----|---------------|
| `welcome` | "Salut la famille ! Pour rentrer dans ton coin, appuie sur le bouton orange là, et puis tu parles." |
| `listen` | "Vas-y, on t'écoute. Donne ton numéro de téléphone chap-chap." |
| `wait` | "Attends un peu, on regarde si c'est bon..." |
| `confirm` | "J'ai entendu {phone}. C'est le bon way ? Dis OUI ou bien NON." |
| `success` | "C'est validé ! Tu es en place." |
| `error_noise` | "Y'a trop de bruit, on n'a pas entendu. Pardon, faut reprendre." |
| `error_unknown` | "Ah, on connait pas ce numéro là. Tu veux créer ton compte ou bien ?" |
| `fallback_hint` | "Si tu veux, tu peux aussi écrire ton numéro en bas là." |

---

## 🎯 Fichiers Audio Prioritaires

### Clés à enregistrer en priorité

| Clé | Contexte | Script Dioula suggéré |
|-----|----------|----------------------|
| `welcome` | Page d'accueil | "Aw ni sɔgɔma" (Bonjour) |
| `audio_dashboard` | Dashboard marchand | "I ni sɔgɔma. Bi jula ye..." |
| `audio_cashier_input` | Saisie montant caisse | "Hakɛ sɛbɛn ani wari cogo sugandi" |
| `audio_cashier_confirm` | Confirmation paiement | "I ka wari ta sɛbɛn" |
| `audio_cashier_success` | Succès transaction | "Baara kɛra! Jula marala" |
| `payment_success` | Paiement réussi | "Wari tara! A bɛn." |
| `offline_notice` | Mode hors-ligne | "Réseau tɛ kɛ. A bɛ sigi, a bɛ taa kɔfɛ." |

## 🎧 Spécifications Techniques

- **Format**: MP3
- **Bitrate**: 128 kbps minimum
- **Fréquence**: 44.1 kHz
- **Durée**: 2-10 secondes par fichier
- **Voix**: Féminine recommandée (meilleure acceptation marché)

## 📝 Instructions d'Enregistrement

1. **Environnement**: Endroit calme, sans écho
2. **Micro**: Qualité smartphone OK, micro externe préférable
3. **Ton**: Calme, clair, rythme modéré
4. **Format de nom**: `{cle}.mp3` (ex: `welcome.mp3`)

## 🌍 Sources de Voix Dioula

- Radio locale (animateurs)
- ONG linguistiques
- Institut de langues nationales
- Étudiants Dioula natifs

## ⚡ Fallback

Si un fichier audio n'existe pas pour une langue:
1. L'app essaie le français
2. Si absent aussi → TTS dynamique (LAFRICAMOBILE pour Dioula, Web Speech API pour français)

## 📱 Usage Offline

Les fichiers audio fonctionnent **sans connexion internet** une fois l'app chargée.
