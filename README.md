# LogicAI-N8N - Node-Based Automation Tool (n8n Clone)

MVP d'un outil d'automatisation "Node-Based" inspiré de n8n, construit avec React Flow pour le frontend et Node.js/Express pour le backend.

## 🚀 Stack Technique

### Frontend
- **React 19** avec TypeScript
- **Vite** pour le build
- **TailwindCSS v4** pour le styling
- **Lucide-React** pour les icônes
- **React Flow** (@xyflow/react) pour le canvas de nœuds
- **React Router v7** pour le routing
- **React Bits** pour les animations
- **Axios** pour les appels API

### Backend
- **Node.js** avec TypeScript
- **Express** pour le serveur HTTP
- **Prisma** comme ORM pour MySQL
- **crypto** (Node.js built-in) pour le chiffrement AES-256

## 📁 Structure du Projet

```
LogicAI-N8N/
├── web/                          # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── canvas/
│   │   │   │   ├── CustomNode.tsx       # Nœud personnalisé React Flow
│   │   │   │   └── WorkflowCanvas.tsx   # Canvas principal
│   │   │   └── sidebar/
│   │   │       └── NodeSidebar.tsx      # Panneau de configuration
│   │   ├── lib/
│   │   │   ├── api.ts                  # Client API
│   │   │   └── variableParser.ts       # Parser {{ $json.variable }}
│   │   ├── types/                      # Types TypeScript
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Dashboard principal
│   │   │   └── WorkflowEditor.tsx      # Éditeur de workflow
│   │   ├── router.tsx                  # Routes React Router
│   │   └── App.tsx
│   └── package.json
│
├── server/                       # Backend Node.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── workflowController.ts   # CRUD Workflows
│   │   │   └── webhookController.ts    # Webhooks dynamiques
│   │   ├── engine/
│   │   │   ├── WorkflowEngine.ts       # Moteur d'exécution principal
│   │   │   └── topologicalSort.ts      # Algorithme de tri topologique
│   │   ├── nodes/
│   │   │   ├── base/
│   │   │   │   └── BaseNode.ts         # Classe de base pour tous les nœuds
│   │   │   ├── implementations/
│   │   │   │   ├── WebhookNode.ts      # Nœud Webhook
│   │   │   │   ├── HttpRequestNode.ts  # Nœud HTTP Request
│   │   │   │   ├── SetVariableNode.ts  # Nœud Set Variable
│   │   │   │   └── ConditionNode.ts    # Nœud Condition
│   │   │   └── NodeRegistry.ts         # Registre des nœuds disponibles
│   │   ├── services/
│   │   │   ├── encryptionService.ts    # Chiffrement AES-256
│   │   │   └── databaseService.ts      # Connexion Prisma
│   │   ├── routes/
│   │   │   ├── workflows.ts
│   │   │   └── webhooks.ts
│   │   ├── app.ts                      # Application Express
│   │   └── server.ts                   # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma               # Schéma de base de données
│   └── package.json
│
└── README.md
```

## 🎯 Fonctionnalités Implémentées (MVP)

### Backend
- ✅ Moteur d'exécution de workflows avec tri topologique (Kahn's algorithm)
- ✅ Système de nœuds extensibles avec classe de base `BaseNode`
- ✅ 4 types de nœuds implémentés :
  - **WebhookNode** : Point d'entrée HTTP
  - **HttpRequestNode** : Requêtes HTTP sortantes
  - **SetVariableNode** : Manipulation de variables
  - **ConditionNode** : Branchement conditionnel
- ✅ Résolution de variables `{{ $json.* }}`, `{{ $workflow.* }}`, `{{ $node.* }}`
- ✅ API REST complète pour les workflows
- ✅ Webhooks dynamiques (`/webhook/:workflowId`)
- ✅ Chiffrement AES-256-GCM pour les credentials
- ✅ Base de données MySQL avec Prisma

### Frontend
- ✅ Canvas React Flow avec drag & drop
- ✅ CustomNode stylisé avec TailwindCSS (dark mode)
- ✅ Icônes Lucide dynamiques selon le type de nœud
- ✅ Sidebar de configuration des nœuds
- ✅ Dashboard avec liste des workflows
- ✅ Éditeur de workflow complet
- ✅ Activation/désactivation de workflows
- ✅ Exécution manuelle de workflows

## 🚦 Démarrage Rapide

### Prérequis
- Node.js 18+
- MySQL 8+
- npm ou yarn

### 1. Configuration de la Base de Données

```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE logicai_n8n;
exit;
```

### 2. Backend

```bash
cd server

# Installer les dépendances
npm install

# Configuration de l'environnement
cp .env.example .env
# Éditer .env avec vos credentials MySQL

# Générer le client Prisma
npx prisma generate

# Exécuter les migrations
npx prisma migrate dev --name init

# Démarrer le serveur
npm run dev
```

Le serveur démarrera sur `http://localhost:3001`

### 3. Frontend

```bash
cd web

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🔮 Variables d'Environnement

### Backend ([server/.env](server/.env))
```env
DATABASE_URL="mysql://user:password@localhost:3306/logicai_n8n"
PORT=3001
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend ([web/.env](web/.env))
```env
VITE_API_URL="http://localhost:3001"
```

## 📚 API REST

### Workflows

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/workflows` | Lister tous les workflows |
| GET | `/api/workflows/:id` | Récupérer un workflow |
| POST | `/api/workflows` | Créer un workflow |
| PUT | `/api/workflows/:id` | Mettre à jour un workflow |
| DELETE | `/api/workflows/:id` | Supprimer un workflow |
| POST | `/api/workflows/:id/execute` | Exécuter un workflow |
| GET | `/api/workflows/:id/executions` | Historique d'exécution |

### Webhooks

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST/GET | `/webhook/:workflowId` | Déclencher un workflow via webhook |

## 🧪 Tests et Exemples

### Exemple de Workflow

```json
{
  "nodes": [
    {
      "id": "webhook-1",
      "type": "webhook",
      "data": {
        "label": "Webhook Trigger",
        "config": {
          "method": "POST",
          "path": "/incoming-data"
        }
      }
    },
    {
      "id": "set-var-1",
      "type": "setVariable",
      "data": {
        "label": "Add Timestamp",
        "config": {
          "key": "processedAt",
          "value": "{{ new Date().toISOString() }}"
        }
      }
    },
    {
      "id": "http-1",
      "type": "httpRequest",
      "data": {
        "label": "Send Notification",
        "config": {
          "url": "https://api.example.com/notify",
          "method": "POST",
          "body": {
            "data": "{{ $json }}",
            "timestamp": "{{ $json.processedAt }}"
          }
        }
      }
    }
  ],
  "edges": [
    { "source": "webhook-1", "target": "set-var-1", "id": "e1" },
    { "source": "set-var-1", "target": "http-1", "id": "e2" }
  ]
}
```

## 🗺️ Roadmap - Prochaines Fonctionnalités

### Phase 2: Nœuds Supplémentaires

#### Nœuds Core (Logique & Données)
- [ ] Edit Fields (Set) - Manipulation de champs
- [ ] Code - Exécution JavaScript/Python
- [ ] Filter - Filtrage de données
- [ ] Switch - Branchement multiple
- [ ] Merge - Fusion de flux
- [ ] Split In Batches - Division de données
- [ ] Wait - Pause temporelle
- [ ] Limit - Limitation du nombre d'items
- [ ] Sort - Tri de données

#### Nœuds Trigger
- [ ] Schedule - Exécution récurrente (Cron)
- [ ] Form Trigger - Formulaire intégré
- [ ] On Success/Failure - Déclencheurs globaux

#### Nœuds HTTP & Data
- [ ] HTML Extract - Web scraping
- [ ] RSS Read - Lecteur de flux
- [ ] FTP - Transfert de fichiers

#### Nœuds Base de Données
- [ ] MySQL/PostgreSQL - Requêtes SQL
- [ ] MongoDB - Opérations NoSQL
- [ ] Redis - Cache clé-valeur

#### Nœuds Communication
- [ ] Email Send/Read - SMTP/IMAP
- [ ] Slack - Messages et fichiers
- [ ] Discord - Webhooks et bots

#### Nœuds Cloud Productivity
- [ ] Google Sheets - Tableurs
- [ ] Google Drive - Fichiers
- [ ] Notion - Pages et bases de données

#### Nœuds AI/LLM
- [ ] OpenAI - ChatGPT, GPT-4
- [ ] AI Agent - Orchestration LLM
- [ ] Vector Store - Pinecone/ChromaDB

## 📝 Architecture

### Moteur d'Exécution

Le `WorkflowEngine` utilise l'algorithme de **Kahn** pour le tri topologique :

1. Construction du graphe depuis les nœuds et edges
2. Calcul du degré entrant de chaque nœud
3. Exécution séquentielle selon l'ordre topologique
4. Passage de `$json` entre les nœuds
5. Gestion des erreurs avec rollback partiel

### Système de Variables

Les expressions `{{ $json.* }}` sont résolues à l'exécution :

```javascript
// Template
"Hello {{ $json.user.name }}!"

// Contexte
{ $json: { user: { name: "Alice" } } }

// Résultat
"Hello Alice!"
```

## 🔒 Sécurité

- Chiffrement AES-256-GCM pour les credentials
- Validation des inputs avec Prisma
- CORS configuré
- Pas de logging des données sensibles

## 📄 Licence

MIT

## 👥 Contributeurs

Projet créé pour démonstration des capacités d'architecture Full Stack.

---

**Note** : Ceci est un MVP. Pour une utilisation en production, il faudrait ajouter :
- Authentification des utilisateurs
- Tests unitaires et E2E
- Monitoring et logging
- Rate limiting
- Documentation Swagger/OpenAPI
- CI/CD pipeline
- Dockerisation
