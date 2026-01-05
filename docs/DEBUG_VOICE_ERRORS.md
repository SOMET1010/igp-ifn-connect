# 🎤 Guide de débogage des erreurs vocales PNAVIM

## Checklist rapide (2 minutes)

### 1. Environnement
- [ ] **Contexte sécurisé** : `https://` ou `localhost` (pas `http://`)
- [ ] **Hors iframe** : Pas dans l'aperçu Lovable (ouvrir en nouvel onglet)
- [ ] **Navigateur supporté** : Chrome, Firefox, Safari, Edge récent

### 2. Permissions
- [ ] **Micro autorisé** : Cliquer sur 🔒 dans la barre d'adresse → Microphone → Autoriser
- [ ] **Micro non utilisé** : Fermer les autres apps qui utilisent le micro (Zoom, Meet, etc.)

### 3. Matériel
- [ ] **Micro détecté** : Paramètres système → Son → Périphérique d'entrée
- [ ] **Niveau audio** : Parler et vérifier que le niveau bouge

### 4. Service
- [ ] **Token valide** : Vérifier les logs edge function `elevenlabs-scribe-token`
- [ ] **Connexion internet** : Vérifier la connectivité

---

## Table de diagnostic

| Symptôme | Cause probable | Solution |
|----------|----------------|----------|
| "Le micro est bloqué dans l'aperçu" | Iframe Lovable | Ouvrir en nouvel onglet |
| "Autorise le micro" | Permission refusée | Cliquer 🔒 → Autoriser micro |
| "Aucun micro détecté" | Pas de périphérique | Brancher un micro |
| "Service vocal indisponible" | Token ElevenLabs | Vérifier ELEVENLABS_API_KEY |
| Toast "Erreur vocale" générique | Erreur non mappée | Voir console pour détails |
| Barres audio ne bougent pas | Audio non capturé | Vérifier micro système |
| Connexion reste "connecting" | WebSocket échoué | Vérifier réseau/firewall |

---

## États du micro (`voiceState`)

1. `idle` - En attente, prêt à démarrer
2. `requesting_mic` - Demande d'accès au microphone
3. `connecting` - Obtention du token + connexion WebSocket
4. `listening` - Écoute active, transcription en cours
5. `processing` - Numéro détecté, traitement
6. `error` - Erreur (voir `errorMessage`)

---

## Script de diagnostic console

Copier-coller dans la console du navigateur (F12) :

```javascript
(async () => {
  const report = {
    url: location.href,
    isHTTPS: location.protocol === 'https:',
    isSecure: window.isSecureContext,
    isIframe: window.self !== window.top,
    hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
    userAgent: navigator.userAgent.slice(0, 100)
  };
  
  // Permissions
  try {
    const perm = await navigator.permissions.query({ name: 'microphone' });
    report.micPermission = perm.state;
  } catch { report.micPermission = 'unknown'; }
  
  // Devices
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    report.audioInputs = devices.filter(d => d.kind === 'audioinput').length;
  } catch { report.audioInputs = 'error'; }
  
  // Test capture
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    report.captureTest = 'OK';
    stream.getTracks().forEach(t => t.stop());
  } catch (e) {
    report.captureTest = e.name + ': ' + e.message;
  }
  
  console.table(report);
  console.log('Rapport JSON:', JSON.stringify(report, null, 2));
  return report;
})();
```

---

## Mode debug intégré

Triple-clic sur le badge "PNAVIM" pour activer le panneau debug qui affiche :
- État du micro
- Niveau audio en temps réel
- Erreurs normalisées
- Statut scribe ElevenLabs

---

## Contact support

Si le problème persiste après avoir vérifié tous les points :
1. Exécuter le script de diagnostic
2. Copier le rapport JSON
3. Contacter le support avec le rapport
