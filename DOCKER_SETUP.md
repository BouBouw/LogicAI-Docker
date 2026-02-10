# Guide d'Installation Docker - LogicAI-N8N

Ce guide vous explique comment déployer LogicAI-N8N avec Docker pour l'auto-hébergement sur votre PC (Windows, Linux, macOS).

## Prérequis

- **Docker** : [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** : Inclus avec Docker Desktop
- **4 Go de RAM** minimum recommandés
- **2 Go d'espace disque** disponibles

## Architecture

L'application est composée de :
- **Backend API** (Node.js + Express + Prisma + SQLite) : Port 3001
- **Frontend Web** (React + Vite + Nginx) : Port 5174
- **Base de données** : SQLite (fichier-based, dans `./data/dev.db`)

## Installation Rapide

### 1. Cloner le repository

```bash
git clone https://github.com/votre-username/LogicAI-N8N.git
cd LogicAI-N8N
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet (optionnel, des valeurs par défaut sont fournies) :

```env
# Clé de chiffrement (32 bytes hex = 64 caractères)
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Origine CORS (si vous accédez depuis un autre domaine)
CORS_ORIGIN="http://localhost"
```

### 3. Démarrer l'application

```bash
docker-compose up -d
```

Cette commande va :
- Construire les images Docker (quelques minutes au premier lancement)
- Démarrer les containers en arrière-plan
- Initialiser la base de données automatiquement

### 4. Accéder à l'application

Ouvrez votre navigateur : **http://localhost:5174**

L'interface web devrait s'afficher !

## Commandes Docker Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Uniquement le backend
docker-compose logs -f server

# Uniquement le frontend
docker-compose logs -f
```

### Arrêter l'application

```bash
# Arrêter sans supprimer les données
docker-compose down

# Arrêter et supprimer tout (y compris les volumes)
docker-compose down -v
```

### Redémarrer l'application

```bash
docker-compose restart
```

### Mettre à jour l'application

```bash
# Arrêter les containers
docker-compose down

# Mettre à jour le code
git pull

# Reconstruire et redémarrer
docker-compose up -d --build
```

### Vérifier l'état des services

```bash
docker-compose ps
```

Les services devraient afficher "healthy" une fois démarrés.

## Développement avec Hot-Reload

Pour le développement, utilisez `docker-compose.dev.yml` qui permet le hot-reload du code :

```bash
docker-compose -f docker-compose.dev.yml up
```

- **Backend** : http://localhost:3001
- **Frontend** : http://localhost:5173

Les changements de code seront automatiquement rechargés.

## Structure des Données

### Base de données SQLite

La base de données est stockée dans :
- **Chemin** : `./data/dev.db`
- **Format** : SQLite (fichier unique)
- **Backup** : Il suffit de copier ce fichier !

### Volumes persistants

Les données sont persistées dans le volume Docker `data`. Même si vous supprimez les containers, vos données sont conservées.

## Gestion de la Base de Données

### Ouvrir Prisma Studio (Interface graphique)

```bash
cd server
npm run db:studio
```

Prisma Studio s'ouvrira sur http://localhost:5555 et vous permettra de :
- Voir et éditer les workflows
- Voir l'historique des exécutions
- Modifier les données directement

### Réinitialiser la base de données

```bash
cd server
npm run db:reset
```

⚠️ **Attention** : Cela supprime toutes les données !

## Résolution de Problèmes

### Le frontend ne se charge pas

**Vérifier que les containers sont démarrés :**
```bash
docker-compose ps
```

**Vérifier les logs :**
```bash
docker-compose logs web
```

**Solution :** Recréer le container
```bash
docker-compose up -d --build web
```

### Le backend ne démarre pas

**Vérifier les logs :**
```bash
docker-compose logs server
```

**Problèmes courants :**
- Port 3001 déjà utilisé : Changez le port dans `docker-compose.yml`
- Permissions sur le dossier `data/` : Vérifiez que Docker a les droits d'écriture

### Erreur de connexion à la base de données

**Vérifier que le fichier de base de données existe :**
```bash
ls -la data/dev.db
```

**Recréer la base de données :**
```bash
cd server
npx prisma db push
```

### Les containers ne sont pas "healthy"

**Attendre plus longtemps :**
Les health checks ont une période de démarrage de 40 secondes.

**Vérifier les logs d'health check :**
```bash
docker inspect logicai-n8n-server | grep -A 10 Health
```

## Performance et Scalabilité

### Utilisation actuelle

- **RAM** : ~200-500 MB par container (400 MB - 1 GB total)
- **CPU** : Faible utilisation au repos
- **Disque** : La base SQLite croît avec le nombre de workflows/exécutions

### Optimisations

1. **Nettoyer les anciennes exécutions** :
   - Via Prisma Studio
   - Ou en créant un script de nettoyage

2. **Backup régulier** :
   ```bash
   cp data/dev.db data/dev.db.backup.$(date +%Y%m%d)
   ```

3. **Monitoring** :
   ```bash
   docker stats
   ```

## Sécurité en Production

Si vous exposez l'application sur internet :

### 1. Changer la clé de chiffrement

```env
ENCRYPTION_KEY="votre_clé_aleatoire_de_64_caractères_hexadecimaux"
```

Générez une clé sécurisée :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Utiliser HTTPS

Ajoutez un reverse proxy (traefik, nginx) avec SSL/TLS.

### 3. Limiter l'accès

- Configurez le firewall
- Utilisez l'authentification de l'application
- Changez les ports par défaut si nécessaire

### 4. Sauvegardes automatiques

Créez un cron job pour sauvegarder `data/dev.db` régulièrement.

## Plateformes Spécifiques

### Windows

Docker Desktop pour Windows est recommandé. Les commandes sont les mêmes dans PowerShell ou CMD.

### Linux

Installer Docker Engine :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### macOS

Docker Desktop pour macOS fonctionne parfaitement. Les performances sont optimales.

## Support

- **Issues** : https://github.com/votre-username/LogicAI-N8N/issues
- **Documentation** : https://github.com/votre-username/LogicAI-N8N/wiki
- **Discussions** : https://github.com/votre-username/LogicAI-N8N/discussions

## Licence

MIT - Voir le fichier LICENSE pour plus de détails.
