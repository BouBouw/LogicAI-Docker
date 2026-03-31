# Déploiement des Instances LogicAI-N8N

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              Serveur Global (Port 4000)              │
│         Gestion des utilisateurs + Instances               │
└─────────────────────────────────────────────────────────────┘
                          │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   Instance 1        Instance 2       Instance 3
   (Port 5678)      (Port 5679)      (Port 5680)
   Workflows locaux  Workflows locaux  Workflows locaux
   Auth → Global   Auth → Global    Auth → Global
```

## Variables d'environnement

Lors de la création d'une instance Docker, vous devez spécifier l'URL de l'API globale :

```bash
docker run -d \
  --name logicai-instance-1 \
  -p 5678:3000 \
  -e INSTANCE_ID=uuid-unique \
  -e INSTANCE_NAME="Mon Instance" \
  -e EXTERNAL_PORT=5678 \
  -e GLOBAL_API_URL=http://localhost:4000 \
  -v logicai-data-uuid-unique:/app/data \
  logicai-n8n:latest
```

### Variables disponibles

- **INSTANCE_ID** : Identifiant unique de l'instance (UUID)
- **INSTANCE_NAME** : Nom d'affichage de l'instance
- **EXTERNAL_PORT** : Port mappé sur l'hôte (ex: 5678)
- **GLOBAL_API_URL** : URL de l'API globale pour l'authentification (défaut: `http://localhost:4000`)

## Flux d'authentification

### Inscription
```
Utilisateur → Frontend Instance (/register)
            ↓
    POST /api/auth/register (vers API globale)
            ↓
   API globale → Crée utilisateur dans BDD globale
            ↓
   Retourne token JWT
            ↓
   Token stocké dans localStorage
            ↓
   Redirection vers Dashboard
```

### Connexion
```
Utilisateur → Frontend Instance (/login)
            ↓
    POST /api/auth/login (vers API globale)
            ↓
   API globale → Vérifie identifiants
            ↓
   Retourne token JWT
            ↓
   Token stocké dans localStorage
            ↓
   Redirection vers Dashboard
```

### Utilisation
```
Utilisateur → Dashboard Instance
            ↓
    GET /api/workflows (vers API locale)
            ↓
   API locale → Retourne workflows de cette instance
```

## Ports

| Service | Port interne | Port externe |
|----------|--------------|---------------|
| API Globale | 4000 | 4000 |
| Instance 1 | 3000 | 5678 |
| Instance 2 | 3000 | 5679 |
| Instance N | 3000 | 5678+N |

## Build de l'image

Avec URL de l'API globale personnalisée :

```bash
docker build \
  --build-arg GLOBAL_API_URL=https://api.logicai.fr \
  -t logicai-n8n:latest .
```

## Configuration CORS

L'API globale doit autoriser les origines des instances :

```javascript
// server/src/app.ts (API globale)
app.use(cors({
  origin: [
    'http://localhost:4000',
    'http://localhost:5678',  // Instance 1
    'http://localhost:5679',  // Instance 2
    // ... ajouter chaque instance
  ],
  credentials: true,
}));
```
