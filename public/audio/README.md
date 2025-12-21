# 🎙️ Audio Pré-enregistrés pour IFN

Ce dossier contient les fichiers audio pré-enregistrés pour l'accessibilité vocale de l'application.

## 📁 Structure

```
audio/
├── fr/           # Français
│   ├── welcome.mp3
│   ├── payment_success.mp3
│   └── ...
├── dioula/       # Dioula (Jula)
│   ├── welcome.mp3
│   ├── payment_success.mp3
│   └── ...
└── README.md
```

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
