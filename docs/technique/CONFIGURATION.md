# ⚙️ Configuration PNAVIM

Ce document décrit les variables d'environnement et secrets nécessaires au fonctionnement de l'application.

---

## 🔐 Variables d'Environnement

### Variables Automatiques (Lovable Cloud)

Ces variables sont automatiquement configurées par Lovable Cloud :

| Variable | Description | Obligatoire |
|----------|-------------|:-----------:|
| `VITE_SUPABASE_URL` | URL du projet Supabase | ✅ |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publique Supabase | ✅ |
| `VITE_SUPABASE_PROJECT_ID` | ID du projet | ✅ |

⚠️ **Ne jamais modifier** le fichier `.env` manuellement.

---

## 🔑 Secrets (Edge Functions)

Les secrets sont configurés via l'interface Lovable Cloud et accessibles dans les Edge Functions.

### Secrets Requis

| Secret | Description | Usage |
|--------|-------------|-------|
| `ELEVENLABS_API_KEY` | Clé API ElevenLabs | Synthèse vocale TTS |
| `VAPID_PUBLIC_KEY` | Clé publique VAPID | Notifications push |
| `VAPID_PRIVATE_KEY` | Clé privée VAPID | Notifications push |

### Secrets Optionnels

| Secret | Description | Usage |
|--------|-------------|-------|
| `SMS_API_KEY` | Clé API SMS | Envoi OTP par SMS |
| `SENTRY_DSN` | DSN Sentry | Monitoring erreurs |

---

## 📱 Configuration Notifications Push

### Génération des Clés VAPID

```bash
npx web-push generate-vapid-keys
```

Résultat :
```
Public Key: BNxR...
Private Key: 4h8s...
```

### Configuration dans Lovable

1. Aller dans **Settings > Secrets**
2. Ajouter `VAPID_PUBLIC_KEY`
3. Ajouter `VAPID_PRIVATE_KEY`

---

## 🎤 Configuration ElevenLabs

### Obtenir une Clé API

1. Créer un compte sur [elevenlabs.io](https://elevenlabs.io)
2. Aller dans **Profile > API Keys**
3. Copier la clé

### Voix Disponibles

| Voice ID | Nom | Langue |
|----------|-----|--------|
| `21m00Tcm4TlvDq8ikWAM` | Rachel | Français |
| `AZnzlk1XvdvUeBnXmlld` | Domi | Français |

---

## 🌍 Configuration Multi-Langue

### Langues Supportées

```typescript
const SUPPORTED_LANGUAGES = {
  fr: 'Français',
  dioula: 'Dioula'
};
```

### Configuration TTS par Langue

| Langue | Provider | Voice |
|--------|----------|-------|
| Français | ElevenLabs | Rachel |
| Dioula | Web Speech API | Default |

---

## 🔒 Sécurité des Secrets

### Bonnes Pratiques

- ✅ Utiliser les secrets Lovable Cloud, jamais en dur dans le code
- ✅ Différencier les secrets dev/prod
- ✅ Rotation régulière des clés API
- ❌ Ne jamais commiter de secrets dans Git
- ❌ Ne jamais exposer les clés privées côté client

### Vérification des Secrets

```typescript
// Dans une Edge Function
const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
if (!apiKey) {
  throw new Error('ELEVENLABS_API_KEY not configured');
}
```

---

## 📊 Monitoring

### Variables de Monitoring (Optionnel)

| Variable | Description |
|----------|-------------|
| `SENTRY_DSN` | URL Sentry pour tracking erreurs |
| `ANALYTICS_ID` | ID Google Analytics |

---

## 🔄 Mise à Jour des Secrets

1. Aller dans **Lovable > Settings > Secrets**
2. Modifier la valeur
3. Les Edge Functions redémarrent automatiquement

⚠️ Les changements de secrets prennent effet immédiatement.
