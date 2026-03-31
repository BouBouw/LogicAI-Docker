# Architecture de Sécurité - API Z.ai

## Vue d'ensemble

La fonctionnalité `/logik` utilise une architecture sécurisée où les clés API ne sont **jamais exposées au front-end**. Toutes les requêtes vers Z.ai passent par le serveur backend.

## Flux de données

```
┌──────────────────────────────────────────────────────────┐
│                    Client (Browser)                       │
│  - Workflow Editor                                         │
│  - ChatPanel avec commande /logik                         │
│  - Token JWT dans localStorage                            │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ POST /api/ai/generate-workflow
                        │ Headers: { Authorization: Bearer <jwt> }
                        │ Body: { messages: [...] }
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│              Backend API (port 3000)                      │
│  - Middleware d'authentification (authMiddleware)        │
│  - Route: /api/ai/generate-workflow                      │
│  - Controller: aiController.js                           │
│  - Variable d'environnement: ZAI_API_KEY                 │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ POST https://api.z.ai/v1/chat/completions
                        │ Headers: { Authorization: Bearer <zai_key> }
                        │ Body: { model: 'glm-4-flash', messages, ... }
                        │
                        ▼
┌──────────────────────────────────────────────────────────┐
│                    Z.ai API                               │
│  - Model: GLM 4.7 (glm-4-flash)                          │
│  - Génération de workflows en JSON                       │
└──────────────────────────────────────────────────────────┘
```

## Fichiers concernés

### Backend (server/)

1. **server/.env**
   ```env
   ZAI_API_KEY=your_zai_api_key_here
   ZAI_API_URL=https://api.z.ai/v1/chat/completions
   ```

2. **server/src/routes/ai.js**
   - Route: `POST /api/ai/generate-workflow`
   - Middleware: `authMiddleware` (authentification requise)
   - Route: `GET /api/ai/health` (health check)

3. **server/src/controllers/aiController.js**
   - `generateWorkflow()`: Appelle Z.ai et retourne la réponse
   - `healthCheck()`: Vérifie que le service est configuré
   - Gestion d'erreurs complète

4. **server/src/index.js**
   - Import de `aiRoutes`
   - Mount: `app.use('/api/ai', aiRoutes)`

### Frontend (docker-instance/web/)

1. **docker-instance/web/src/lib/zai.ts**
   - `generateWorkflow()`: Appelle le backend au lieu de Z.ai directement
   - Récupère le token JWT depuis localStorage
   - Headers: `Authorization: Bearer <jwt>`
   - URL: `${API_BASE_URL}/api/ai/generate-workflow`

2. **docker-instance/web/src/pages/WorkflowEditor.tsx**
   - Utilise `generateWorkflow()` lors de la commande `/logik`
   - Passe `NODE_TYPES_METADATA` pour contraindre l'IA

## Sécurité

### ✅ Avantages

1. **Clé API protégée**: Jamais exposée au client
2. **Authentification requise**: Seuls les utilisateurs connectés peuvent utiliser `/logik`
3. **Contrôle centralisé**: Possibilité d'ajouter rate limiting, logs, monitoring
4. **Rotation facile**: Changement de clé sans rebuild du front-end
5. **Multi-tenant**: Possibilité d'utiliser différentes clés par utilisateur/plan

### 🔒 Mesures de sécurité

- JWT vérifié par `authMiddleware` avant chaque appel
- Validation des inputs (`messages` array check)
- Gestion des erreurs sans exposer les détails sensibles
- Logs côté serveur pour audit

## Configuration

### 1. Obtenir une clé Z.ai

1. S'inscrire sur https://z.ai
2. Créer une clé API depuis le dashboard
3. Copier la clé (format: `zai_xxxxxxxxxxxx`)

### 2. Configurer le backend

```bash
cd server
```

Éditer `.env`:
```env
ZAI_API_KEY=zai_votre_clé_ici
ZAI_API_URL=https://api.z.ai/v1/chat/completions
```

Redémarrer:
```bash
npm run dev
```

### 3. Tester

```bash
# Health check
curl http://localhost:3000/api/ai/health

# Devrait retourner:
# {
#   "success": true,
#   "message": "AI service is running",
#   "configured": true,
#   "model": "glm-4-flash",
#   "provider": "Z.ai"
# }
```

### 4. Utiliser dans l'application

1. Se connecter à l'application
2. Ouvrir un workflow
3. Ouvrir le ChatPanel
4. Taper: `/logik créer un workflow simple`

## Monitoring et Logs

### Logs backend

Le serveur log les erreurs dans la console:
```javascript
console.error('Error calling Z.ai API:', error.response?.data || error.message);
```

### Métriques à surveiller

- Nombre de requêtes `/api/ai/generate-workflow`
- Taux de succès/échec
- Temps de réponse moyen
- Coût API Z.ai

### Rate limiting (futur)

Possibilité d'ajouter un rate limiting:
```javascript
// Dans ai.js
const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requêtes max par 15 min
  message: 'Too many AI requests, please try again later'
});

router.post('/generate-workflow', authMiddleware, aiRateLimiter, generateWorkflow);
```

## Évolution future

### V2.0 - Fonctionnalités avancées

- [ ] Cache des réponses IA (Redis)
- [ ] Queue de traitement (Bull/RabbitMQ)
- [ ] Analytics des prompts utilisés
- [ ] Fine-tuning du modèle
- [ ] Support multi-modèles (Claude, GPT-4, etc.)
- [ ] Cost tracking par utilisateur
- [ ] Plans avec quotas différents

### V2.1 - Enterprise features

- [ ] Clés API par organisation
- [ ] Webhook pour notifications longues générations
- [ ] Export/import de prompts
- [ ] Templates de workflows prédéfinis
- [ ] Marketplace de workflows communautaires

## Support

### Problèmes courants

**"Authentication required"**
→ L'utilisateur n'est pas connecté. Se connecter d'abord.

**"Z.ai API key not configured on server"**
→ La clé n'est pas dans `server/.env`. L'ajouter et redémarrer.

**"API error: 401 Unauthorized"**
→ Clé Z.ai invalide. Vérifier sur le dashboard Z.ai.

**"API error: 429 Too Many Requests"**
→ Rate limit Z.ai atteint. Attendre ou upgrader le plan Z.ai.

### Debug

1. Vérifier que le serveur tourne:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. Vérifier la config AI:
   ```bash
   curl http://localhost:3000/api/ai/health
   ```

3. Tester avec un token valide:
   ```bash
   TOKEN="votre_jwt_token"
   curl -X POST http://localhost:3000/api/ai/generate-workflow \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"system","content":"Test"},{"role":"user","content":"Test"}]}'
   ```

## Conclusion

Cette architecture assure la sécurité de vos clés API tout en offrant une expérience utilisateur fluide. Le passage par le backend permet également des évolutions futures comme le rate limiting, le caching, et le monitoring.

---

**Version:** 2.0.0 (Sécurisée)  
**Date:** Février 2026  
**Auteur:** LogicAI Team
