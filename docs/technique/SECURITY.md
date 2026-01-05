# 🔒 Sécurité PNAVIM

Ce document décrit l'architecture de sécurité de l'application PNAVIM.

---

## 🏰 Architecture Multi-Couches

L'authentification PNAVIM utilise 4 couches de sécurité adaptées au contexte des marchands de vivriers :

```
┌─────────────────────────────────────────────────┐
│  Couche 4 : Contexte (GPS, horaires, device)    │
├─────────────────────────────────────────────────┤
│  Couche 3 : Validation Communautaire            │
├─────────────────────────────────────────────────┤
│  Couche 2 : Questions de Sécurité               │
├─────────────────────────────────────────────────┤
│  Couche 1 : OTP Téléphone                       │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Couche 1 : OTP Téléphone

### Principe
- Code à 6 chiffres envoyé par SMS
- Validité : 5 minutes
- Maximum 3 tentatives

### Implémentation
```typescript
// Génération OTP
const code = Math.floor(100000 + Math.random() * 900000).toString();

// Stockage hashé
await supabase.from('otp_codes').insert({
  phone: normalizedPhone,
  code: hashCode(code),
  expires_at: new Date(Date.now() + 5 * 60 * 1000)
});
```

---

## 🔐 Couche 2 : Questions de Sécurité

### Questions Contextuelles
- "Quel est le prénom de votre premier enfant ?"
- "Dans quel village êtes-vous né(e) ?"
- "Quel est le nom de votre premier marché ?"

### Caractéristiques
- Réponses normalisées (minuscules, sans accents)
- Hashées en base de données
- Disponibles en audio (Dioula)

---

## 🔐 Couche 3 : Validation Communautaire

### Types de Validateurs
| Type | Qui | Cas d'usage |
|------|-----|-------------|
| `peer` | Autre marchand du marché | Validation quotidienne |
| `family` | Membre de la famille | Récupération de compte |
| `agent` | Agent PNAVIM | Enrôlement, déblocage |

### Flux
1. Demande de validation générée
2. Code unique envoyé au validateur
3. Validateur confirme l'identité
4. Accès accordé

---

## 🔐 Couche 4 : Contexte

### Facteurs Analysés
- **Localisation GPS** : Proximité du marché habituel
- **Horaires** : Connexion aux heures habituelles
- **Appareil** : Empreinte du device

### Score de Confiance
```typescript
interface TrustScore {
  location: number;  // 0-100
  time: number;      // 0-100
  device: number;    // 0-100
  total: number;     // Moyenne pondérée
}
```

### Seuils d'Action
| Score | Action |
|-------|--------|
| > 80 | Accès direct |
| 50-80 | Question de sécurité |
| < 50 | Validation communautaire requise |

---

## 🛡️ Row Level Security (RLS)

### Politique Marchands
```sql
-- Les marchands ne voient que leurs propres données
CREATE POLICY "Merchants can view own data"
ON merchants FOR SELECT
USING (auth.uid() = user_id);

-- Les agents peuvent voir leurs marchands enrôlés
CREATE POLICY "Agents can view enrolled merchants"
ON merchants FOR SELECT
USING (
  enrolled_by IN (
    SELECT id FROM agents WHERE user_id = auth.uid()
  )
);
```

### Politique Transactions
```sql
-- Marchands : leurs transactions uniquement
CREATE POLICY "Merchants own transactions"
ON transactions FOR ALL
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);
```

### Politique Stocks
```sql
-- Accès au stock du marchand
CREATE POLICY "Merchant stock access"
ON merchant_stocks FOR ALL
USING (
  merchant_id IN (
    SELECT id FROM merchants WHERE user_id = auth.uid()
  )
);
```

---

## 🔑 Gestion des Rôles

### Rôles Applicatifs
| Rôle | Permissions |
|------|-------------|
| `merchant` | CRUD sur ses données, ventes |
| `agent` | Enrôlement, validation, consultation |
| `cooperative` | Gestion stock, commandes |
| `admin` | Accès complet, configuration |

### Attribution des Rôles
```sql
-- Table user_roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  role app_role NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🚨 Détection des Risques

### Événements Surveillés
- Tentatives OTP répétées
- Connexions depuis nouvel appareil
- Transactions inhabituelles
- Accès depuis zone non habituelle

### Actions Automatiques
```typescript
if (failedAttempts >= 3) {
  await blockAccount(merchantId, '30_MINUTES');
  await notifyAgent(merchantId, 'SUSPICIOUS_ACTIVITY');
}
```

---

## 📋 Audit Trail

### Logs de Sécurité
```sql
CREATE TABLE auth_context_logs (
  id UUID PRIMARY KEY,
  phone TEXT,
  decision TEXT,  -- 'ALLOW', 'CHALLENGE', 'BLOCK'
  trust_score NUMERIC,
  factors JSONB,
  created_at TIMESTAMP
);
```

### Rétention
- Logs d'authentification : 90 jours
- Logs de transactions : 5 ans
- Logs d'erreurs : 30 jours

---

## ✅ Checklist Sécurité

- [ ] RLS activé sur toutes les tables
- [ ] Secrets stockés dans Lovable Cloud
- [ ] Validation des entrées utilisateur
- [ ] Rate limiting sur endpoints sensibles
- [ ] Logs d'audit activés
- [ ] Rotation des clés API planifiée
