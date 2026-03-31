# LogicAI-N8N Instance

Instance N8N personnalisée pour LogicAI avec des nodes supplémentaires et fonctionnalités avancées.

## 🚀 Installation Rapide

### Prérequis

- Docker Desktop (Windows/Mac) ou Docker Engine (Linux)
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/BouBouw/LogicAI-N8N.git
cd LogicAI-N8N
```

### 2. Configurer l'environnement

```bash
cp .env.example .env
nano .env  # Éditer la configuration si nécessaire
```

Variables importantes dans `.env`:
- `N8N_PORT` - Port de l'instance (défaut: 5678)
- `N8N_HOST` - Nom d'hôte ou sous-domaine
- `N8N_PROTOCOL` - http ou https
- `WEBHOOK_URL` - URL pour les webhooks

### 3. Démarrer avec Docker

```bash
docker-compose up -d
```

Ou utiliser le script de déploiement:

```bash
chmod +x deploy-instance.sh
./deploy-instance.sh
```

### 4. Accéder à l'instance

Ouvrir votre navigateur: `http://localhost:5678`

## 📋 Fonctionnalités

### Nodes Personnalisés

- **AI/LLM**: OpenAI, Anthropic, Gemini, Ollama, OpenRouter
- **Automatisation**: HTTP Request, Rate Limiter Bypass, No-Code Browser
- **Data**: MySQL, SQLite, Firebase, S3
- **Social**: Twitch, YouTube, Snapchat, Kick
- **Utilitaires**: Text Formatter, UUID, Date, Loop, If conditions

### Fonctionnalités LogicAI

- ✅ Système d'authentification JWT
- ✅ Collaboration en temps réel (WebSocket)
- ✅ Gestion d'instances multiples (local + cloud)
- ✅ Base de données locale intégrée
- ✅ Système de formulaires
- ✅ Support multilingue (20+ langues)

## 🐳 Gestion Docker

### Démarrer l'instance

```bash
docker-compose up -d
```

### Arrêter l'instance

```bash
docker-compose down
```

### Voir les logs

```bash
docker-compose logs -f
```

### Redémarrer

```bash
docker-compose restart
```

### Supprimer l'instance

```bash
docker-compose down -v  # -v supprime aussi les volumes
```

## 🔧 Scripts Disponibles

### `deploy-instance.sh`

Script de déploiement automatisé qui:
1. Vérifie Docker
2. Build l'image
3. Démarre le conteneur
4. Affiche les logs

```bash
chmod +x deploy-instance.sh
./deploy-instance.sh
```

## 🔐 Configuration Avancée

### Base de données

L'instance utilise Prisma + PostgreSQL par défaut. Pour changer:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/n8n"
```

### WebSocket

Pour la collaboration temps réel:

```env
WEBSOCKET_PORT=5679
WEBSOCKET_ENABLED=true
```

### Authentification

```env
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
```

## 🐛 Dépannage

### Port déjà utilisé

```bash
# Changer le port dans .env
N8N_PORT=5679

# Ou tuer le processus
lsof -ti:5678 | xargs kill -9
```

### Permissions refusées

```bash
chmod +x deploy-instance.sh
sudo docker-compose up -d
```

### Container ne démarre pas

```bash
docker-compose logs
# Vérifier les logs pour les erreurs
```

## 📚 Documentation Complémentaire

- [N8N Official Docs](https://docs.n8n.io/)
- [Docker Documentation](https://docs.docker.com/)
- [LogicAI Main Repo](https://github.com/BouBouw/LogicAI)

## 🤝 Contribution

Contributions welcome! Fork le projet et submit une PR.

## 📄 Licence

MIT License

---

**LogicAI** - Automation Platform for Everyone 🚀
