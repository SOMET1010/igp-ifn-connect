# 📡 Documentation API PNAVIM

Cette documentation décrit les Edge Functions et endpoints disponibles dans l'application PNAVIM.

---

## 🔑 Authentification

Toutes les requêtes authentifiées doivent inclure le header :
```
Authorization: Bearer <access_token>
```

Le token est obtenu via Supabase Auth après connexion.

---

## 📦 Edge Functions

### 1. `send-push-notification`

Envoie une notification push à un utilisateur.

**Endpoint** : `POST /functions/v1/send-push-notification`

**Body** :
```json
{
  "userId": "uuid",
  "title": "string",
  "body": "string",
  "data": {
    "type": "string",
    "url": "string"
  }
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Notification sent"
}
```

---

### 2. `validate-otp`

Valide un code OTP pour l'authentification.

**Endpoint** : `POST /functions/v1/validate-otp`

**Body** :
```json
{
  "phone": "+225XXXXXXXXXX",
  "code": "123456"
}
```

**Réponse** :
```json
{
  "valid": true,
  "merchant_id": "uuid"
}
```

---

### 3. `generate-invoice`

Génère une facture normalisée pour une transaction.

**Endpoint** : `POST /functions/v1/generate-invoice`

**Body** :
```json
{
  "transaction_id": "uuid",
  "customer_name": "string (optional)",
  "customer_phone": "string (optional)"
}
```

**Réponse** :
```json
{
  "invoice_number": "FAC-2024-000001",
  "qr_code_data": "string",
  "signature_hash": "string"
}
```

---

## 🗄️ Tables Principales (via Supabase Client)

### Merchants
```typescript
// Récupérer un marchand par user_id
const { data } = await supabase
  .from('merchants')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Transactions
```typescript
// Créer une transaction
const { data } = await supabase
  .from('transactions')
  .insert({
    merchant_id: merchantId,
    amount: 5000,
    transaction_type: 'sale'
  });
```

### Stocks (Marchand)
```typescript
// Récupérer le stock d'un marchand
const { data } = await supabase
  .from('merchant_stocks')
  .select(`
    *,
    product:products(name, unit)
  `)
  .eq('merchant_id', merchantId);
```

---

## 🔄 Realtime

Les tables suivantes supportent les mises à jour en temps réel :

| Table | Événements |
|-------|------------|
| `transactions` | INSERT, UPDATE |
| `notifications` | INSERT |
| `merchant_stocks` | UPDATE |
| `orders` | INSERT, UPDATE |

**Exemple d'abonnement** :
```typescript
const channel = supabase
  .channel('transactions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions',
      filter: `merchant_id=eq.${merchantId}`
    },
    (payload) => {
      console.log('Nouvelle transaction:', payload.new);
    }
  )
  .subscribe();
```

---

## ❌ Codes d'Erreur

| Code | Signification |
|------|---------------|
| `MERCHANT_NOT_FOUND` | Numéro de téléphone non enregistré |
| `OTP_EXPIRED` | Code OTP expiré |
| `OTP_INVALID` | Code OTP incorrect |
| `INSUFFICIENT_STOCK` | Stock insuffisant |
| `SESSION_NOT_OPEN` | Session de caisse non ouverte |

---

## 🔒 Rate Limiting

| Endpoint | Limite |
|----------|--------|
| OTP | 3 tentatives / 5 min |
| Push Notifications | 100 / heure / user |
| Transactions | Illimité |
