# LogicAI Trigger Node - Guide d'utilisation

## 📦 Installation

1. **Installer les dépendances dans docker-instance/server:**
   ```bash
   cd docker-instance/server
   npm install
   ```

2. **Le nœud est automatiquement disponible** dans l'interface docker-instance après redémarrage du serveur.

## 🎯 Qu'est-ce que le LogicAI Trigger Node ?

Le **LogicAI Trigger Node** permet de déclencher un workflow sur une **autre instance LogicAI** depuis votre workflow actuel. C'est utile pour:

- 🔗 Créer des workflows distribués sur plusieurs instances
- 🔄 Orchestrer des processus complexes entre différentes instances
- 🚀 Réutiliser des workflows existants comme des micro-services
- 📡 Créer une architecture event-driven entre instances

## ⚙️ Configuration

### Variables d'environnement (recommandé)

Créez un fichier `.env` dans `docker-instance/server/`:

```env
LOGICAI_API_URL=http://localhost:3000
LOGICAI_TOKEN=votre-jwt-token-ici
```

### Configuration dans le nœud

Le nœud LogicAI Trigger possède les paramètres suivants:

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| **API URL** | string | Non | URL de l'API LogicAI (défaut: `http://localhost:3000`) |
| **Token** | string | Oui | Token JWT d'authentification |
| **Instance UUID** | string | Oui | UUID de l'instance cible |
| **Mode** | select | Oui | `webhook` ou `workflowId` |
| **Webhook Path** | string | Conditionnel | Chemin du webhook (si mode = webhook) |
| **Workflow ID** | string | Conditionnel | ID du workflow (si mode = workflowId) |
| **HTTP Method** | select | Non | Méthode HTTP (défaut: POST) |
| **Data** | json | Non | Données JSON à envoyer |
| **Custom Headers** | json | Non | En-têtes HTTP personnalisés |
| **Timeout** | number | Non | Timeout en ms (défaut: 30000) |

## 📖 Exemples d'utilisation

### Exemple 1: Déclencher un workflow via webhook

```
Workflow source:
┌──────────────┐     ┌────────────────────┐     ┌──────────┐
│ Form Trigger │────▶│ LogicAI Trigger    │────▶│ Set Var  │
└──────────────┘     └────────────────────┘     └──────────┘
                     Configuration:
                     - instanceUuid: "abc-123"
                     - mode: "webhook"
                     - webhookPath: "contact-form"
                     - data: {"name": "{{$json.name}}", "email": "{{$json.email}}"}
```

**Configuration du nœud:**
```json
{
  "apiUrl": "http://localhost:3000",
  "token": "votre-jwt-token",
  "instanceUuid": "abc-123-def-456",
  "mode": "webhook",
  "webhookPath": "contact-form",
  "method": "POST",
  "data": {
    "name": "{{$json.name}}",
    "email": "{{$json.email}}",
    "subject": "{{$json.subject}}",
    "message": "{{$json.message}}"
  }
}
```

### Exemple 2: Orchestration multi-instances

```
Instance A (Traitement):
┌──────────────┐     ┌────────────────────┐
│ Webhook      │────▶│ Code: Process Data │
└──────────────┘     └────────────────────┘
                     │
                     ▼
                     ┌────────────────────┐
                     │ LogicAI Trigger    │───▶ Instance B
                     └────────────────────┘
                     Configuration:
                     - instanceUuid: "instance-b-uuid"
                     - webhookPath: "send-email"

Instance B (Notification):
┌──────────────┐     ┌────────────────────┐
│ Webhook      │────▶│ Email Node         │
└──────────────┘     └────────────────────┘
```

### Exemple 3: Avec le SDK directement dans le code

Si vous utilisez le **Code Node**, vous pouvez aussi utiliser le SDK directement:

```javascript
// Dans un Code Node
const { LogicAIClient } = require('logicai-sdk');

const client = new LogicAIClient({
  apiUrl: process.env.LOGICAI_API_URL,
  token: process.env.LOGICAI_TOKEN
});

// Déclencher un workflow
const result = await client.workflows.webhook({
  instanceUuid: 'abc-123-def-456',
  webhookPath: 'process-order',
  data: {
    orderId: $json.orderId,
    amount: $json.amount,
    customer: $json.customer
  }
});

return { result };
```

## 🔐 Sécurité

### Obtenir un token JWT

1. **Connectez-vous à votre instance LogicAI**
2. **Récupérez le token** depuis le localStorage du navigateur:
   ```javascript
   localStorage.getItem('token')
   ```
3. **Ou utilisez l'API** pour obtenir un token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password"}'
   ```

### Bonnes pratiques

- ✅ **Stockez le token dans les variables d'environnement** (`.env`)
- ✅ **Ne commitez jamais le token** dans le code source
- ✅ **Utilisez des tokens avec des permissions limitées** si possible
- ✅ **Renouvelez les tokens régulièrement**
- ❌ **N'exposez pas les tokens** dans les logs ou réponses

## 🔍 Dépannage

### Erreur: "Token d'authentification manquant"

**Solution:** Configurez le paramètre `token` ou la variable `LOGICAI_TOKEN`.

### Erreur: "Instance non trouvée"

**Solution:** Vérifiez que l'UUID de l'instance est correct avec:
```bash
curl http://localhost:3000/api/instances \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Erreur: "Instance n'est pas en cours d'exécution"

**Solution:** Démarrez l'instance cible:
```bash
curl -X POST http://localhost:3000/api/instances/{uuid}/start \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Erreur: "Endpoint non trouvé"

**Solution:** Vérifiez que le webhook existe dans l'instance cible. Le chemin doit correspondre à un nœud Webhook dans le workflow cible.

### SDK non installé

Si vous voyez des erreurs liées au SDK, réinstallez les dépendances:
```bash
cd docker-instance/server
npm install
```

## 🚀 Cas d'usage avancés

### 1. Pipeline de traitement distribué

```
Instance 1: Ingestion
  ↓
Instance 2: Processing
  ↓
Instance 3: Storage
  ↓
Instance 4: Notification
```

### 2. Load balancing

Utilisez plusieurs instances pour distribuer la charge:

```javascript
const instances = ['uuid-1', 'uuid-2', 'uuid-3'];
const selectedInstance = instances[Math.floor(Math.random() * instances.length)];

// Trigger sur l'instance sélectionnée
```

### 3. Fallback / Retry

Si une instance échoue, basculer vers une autre:

```
Try Instance A
  ↓ (if error)
Try Instance B
  ↓ (if error)
Send alert
```

## 📚 Ressources

- **Documentation du SDK**: Voir `/package/README.md`
- **API Reference**: Voir `/package/QUICKSTART.md`
- **Exemples**: Voir `/package/examples/`

## 💡 Conseils

- Utilisez des **noms descriptifs** pour vos webhooks
- **Documentez** les données attendues par chaque webhook
- **Testez** d'abord avec des données fictives
- **Activez les logs** pour déboguer les problèmes
- **Utilisez des timeouts appropriés** selon la complexité du workflow cible

---

**Créé pour LogicAI** - Node personnalisé pour l'orchestration multi-instances 🚀
