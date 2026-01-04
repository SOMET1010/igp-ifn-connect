# ADR-002: Convention de nommage Edge Functions

## Statut

**Accepté**

## Date

2026-01

## Contexte

Les Edge Functions Supabase étaient nommées de manière incohérente :
- `lafricamobile-stt` (nom du provider)
- `elevenlabs-tts` (nom du provider)
- `check-low-stock` (action)
- `send-push-notification` (action)

Cela rendait difficile :
1. La compréhension du domaine couvert
2. Le regroupement logique des fonctions
3. La maintenance et la documentation

## Décision

Adopter une convention de nommage par **préfixe de domaine** :

```
{domaine}-{action}
```

| Domaine | Fonctions |
|---------|-----------|
| `voice-` | stt, tts, interview, scribe-token |
| `notif-` | push |
| `inventory-` | check-low-stock, import-vivriers |
| `wallet-` | transfer |
| `security-` | questions |

Note : Supabase ne supporte pas les sous-dossiers pour les Edge Functions.
Chaque fonction = 1 dossier à la racine de `supabase/functions/`.

## Alternatives considérées

1. **Nommage par provider**
   - Avantages : Clarté technique
   - Inconvénients : Couplage au provider, change si on switch de service

2. **Nommage plat sans préfixe**
   - Avantages : Plus court
   - Inconvénients : Pas de regroupement, difficile à parcourir

## Conséquences

### Positives

- Fonctions regroupées visuellement dans l'IDE
- Documentation auto-organisée
- Facilite l'ajout de nouvelles fonctions dans un domaine
- README par domaine possible

### Négatives

- Renommage des fonctions existantes requis
- Mise à jour des appels côté client
- Noms plus longs

## Mapping de renommage

| Ancien | Nouveau |
|--------|---------|
| lafricamobile-stt | voice-stt |
| elevenlabs-tts | voice-tts |
| elevenlabs-scribe-token | voice-scribe-token |
| voice-interview | voice-interview ✓ |
| send-push-notification | notif-push |
| check-low-stock | inventory-check-low-stock |
| import-vivriers | inventory-import-vivriers |
| wallet-transfer | wallet-transfer ✓ |
| save-security-questions | security-questions |

## Références

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
