# Guide d'Installation Docker - LogicAI-N8N

Ce guide vous explique comment déployer LogicAI-N8N avec Docker pour l'auto-hébergement sur votre PC (Windows, Linux, macOS).

## Prérequis

- **Docker** : [Télécharger Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **4 Go de RAM** minimum recommandés
- **2 Go d'espace disque** disponibles
- **Git** : Pour cloner le repository

## Architecture

L'application utilise désormais une **architecture à conteneur unique** qui intègre tous les composants :

- **Backend API** (Node.js + Express + Prisma + SQLite) : Port 3001
- **Frontend Web** (React + Vite + Nginx) : Port 5174
- **Base de données** : SQLite (fichier-based, stockée dans `./data/instances/{nom}/database.db`)

Cette architecture simplifiée permet :
- Un déploiement plus simple avec un seul conteneur
- Une meilleure gestion des ressources
- La possibilité de déployer plusieurs instances indépendantes avec des bases de données séparées

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

### 3. Déployer l'application

Le déploiement utilise le script `deploy-instance.sh` qui crée automatiquement :
- Une nouvelle instance avec son identifiant unique
- Un conteneur Docker avec tous les composants intégrés
- Une base de données SQLite dédiée pour cette instance

**Sur Linux/macOS :**
```bash
chmod +x deploy-instance.sh
./deploy-instance.sh
```

**Sur Windows (PowerShell ou Git Bash) :**
```bash
./deploy-instance.sh
```

Cette commande va :
- Construire l'image Docker (quelques minutes au premier lancement)
- Créer une instance avec un ID unique (ex: `logicai-instance-abc123`)
- Démarrer le conteneur en arrière-plan
- Initialiser la base de données automatiquement
- Afficher l'URL d'accès

### 4. Accéder à l'application

Le script affichera l'URL d'accès, par exemple : **http://localhost:5174**

L'interface web devrait s'afficher !

## Commandes Utiles

Le script `manage-instances.sh` centralise toutes les opérations de gestion :

### Lister les instances

```bash
./manage-instances.sh list
```

Affiche toutes les instances déployées avec leur statut.

### Voir les logs

```bash
# Tous les containers
./manage-instances.sh logs

# Logs d'une instance spécifique
./manage-instances.sh logs logicai-instance-abc123

# Suivre les logs en temps réel
./manage-instances.sh logs logicai-instance-abc123 --follow
```

### Arrêter une instance

```bash
./manage-instances.sh stop logicai-instance-abc123
```

### Redémarrer une instance

```bash
./manage-instances.sh restart logicai-instance-abc123
```

### Supprimer une instance

```bash
# Supprimer une instance ( conserve les données)
./manage-instances.sh remove logicai-instance-abc123

# Supprimer une instance et ses données
./manage-instances.sh remove logicai-instance-abc123 --delete-data
```

### Mettre à jour une instance

```bash
# Mettre à jour le code
git pull

# Mettre à jour et reconstruire une instance spécifique
./manage-instances.sh update logicai-instance-abc123

# Mettre à jour toutes les instances
./manage-instances.sh update-all
```

### Vérifier l'état des instances

```bash
./manage-instances.sh status
```

Affiche l'état détaillé de toutes les instances (actives, arrêtées, en erreur).

## Persistance des Données

### Base de données SQLite

Chaque instance possède sa propre base de données :
- **Chemin** : `./data/instances/{instance-id}/database.db`
- **Format** : SQLite (fichier unique)
- **Backup** : Il suffit de copier ce fichier !

Exemple :
```
data/
└── instances/
    ├── logicai-instance-abc123/
    │   └── database.db
    └── logicai-instance-def456/
        └── database.db
```

### Volumes persistants

Les données sont persistées dans le répertoire `./data/instances/`. Même si vous supprimez un container, vos données sont conservées tant que vous n'utilisez pas l'option `--delete-data`.

### Backup des données

Pour sauvegarder une instance :
```bash
# Créer une archive de l'instance
cp -r data/instances/logicai-instance-abc123 data/instances/logicai-instance-abc123.backup.$(date +%Y%m%d)
```

## Gestion de la Base de Données

### Ouvrir Prisma Studio (Interface graphique)

Pour accéder à la base de données d'une instance spécifique :

```bash
# Se placer dans le répertoire server
cd server

# Lancer Prisma Studio
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

⚠️ **Attention** : Cela supprime toutes les données de la base de données de développement !

Pour une instance spécifique, vous pouvez supprimer son fichier de base de données :
```bash
# Arrêter l'instance d'abord
./manage-instances.sh stop logicai-instance-abc123

# Supprimer la base de données
rm data/instances/logicai-instance-abc123/database.db

# Redémarrer (la base sera recréée)
./manage-instances.sh restart logicai-instance-abc123
```

## Résolution de Problèmes

### Le frontend ne se charge pas

**Vérifier que le container est démarré :**
```bash
./manage-instances.sh status
```

**Vérifier les logs :**
```bash
./manage-instances.sh logs logicai-instance-abc123 --follow
```

**Solution :** Recréer le container
```bash
./manage-instances.sh remove logicai-instance-abc123
./deploy-instance.sh
```

### Le backend ne démarre pas

**Vérifier les logs :**
```bash
./manage-instances.sh logs logicai-instance-abc123 --follow
```

**Problèmes courants :**
- Port 5174 déjà utilisé : Le script détectera automatiquement un port disponible
- Permissions sur le dossier `data/` : Vérifiez que Docker a les droits d'écriture
```bash
# Sur Linux/macOS
sudo chmod -R 755 data/
```

### Erreur de connexion à la base de données

**Vérifier que le fichier de base de données existe :**
```bash
ls -la data/instances/logicai-instance-abc123/database.db
```

**Recréer la base de données :**
```bash
# Arrêter l'instance
./manage-instances.sh stop logicai-instance-abc123

# Supprimer la base de données
rm data/instances/logicai-instance-abc123/database.db

# Redémarrer (la base sera recréée automatiquement)
./manage-instances.sh restart logicai-instance-abc123
```

### Le container ne démarre pas

**Vérifier les logs détaillés :**
```bash
./manage-instances.sh logs logicai-instance-abc123 --follow
```

**Problèmes courants :**
- Image Docker corrompue : Reconstruire l'image
```bash
./manage-instances.sh remove logicai-instance-abc123
docker rmi logicai-n8n-app
./deploy-instance.sh
```

- Mémoire insuffisante : Vérifiez que Docker a au moins 4 Go de RAM alloués
- Ports déjà utilisés : Le script détectera automatiquement des ports disponibles

## Multi-Instances

Pour déployer plusieurs instances de LogicAI-N8N avec des bases de données séparées, consultez le guide détaillé :

**[Guide Multi-Instances](MULTI_INSTANCE_GUIDE.md)**

Ce guide explique :
- Comment déployer plusieurs instances sur le même serveur
- Comment gérer les ports et les bases de données
- Comment isoler les configurations
- Les bonnes pratiques pour la production

## Performance et Scalabilité

### Utilisation actuelle

- **RAM** : ~400-600 MB par conteneur
- **CPU** : Faible utilisation au repos
- **Disque** : La base SQLite croît avec le nombre de workflows/exécutions
- **Instances multiples** : Chaque instance consomme ~400-600 MB

### Optimisations

1. **Nettoyer les anciennes exécutions** :
   - Via Prisma Studio
   - Ou en créant un script de nettoyage

2. **Backup régulier** :
   ```bash
   # Backup d'une instance
   cp -r data/instances/logicai-instance-abc123 data/backups/logicai-instance-abc123.$(date +%Y%m%d)
   ```

3. **Monitoring** :
   ```bash
   # Voir les ressources utilisées
   docker stats

   # Voir l'état de toutes les instances
   ./manage-instances.sh status
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

Ajoutez un reverse proxy (traefik, nginx) avec SSL/TLS devant le container.

### 3. Limiter l'accès

- Configurez le firewall
- Utilisez l'authentification de l'application
- Changez les ports par défaut si nécessaire

### 4. Sauvegardes automatiques

Créez un cron job pour sauvegarder régulièrement les instances :
```bash
# Exemple de script de backup
#!/bin/bash
for instance_dir in data/instances/*/; do
    instance_name=$(basename "$instance_dir")
    backup_dir="data/backups/${instance_name}.$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    cp -r "$instance_dir" "$backup_dir/"
done
```

## Plateformes Spécifiques

### Windows

**Docker Desktop pour Windows** est recommandé.

Exécuter les scripts :
- **PowerShell** : Fonctionne directement
- **Git Bash** : Fonctionne directement
- **CMD** : Utilisez Git Bash ou PowerShell

Assurez-vous que Docker Desktop est démarré avant de lancer les scripts.

### Linux

**Installer Docker Engine :**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Rendre les scripts exécutables :**
```bash
chmod +x deploy-instance.sh manage-instances.sh
```

### macOS

**Docker Desktop pour macOS** fonctionne parfaitement. Les performances sont optimales.

Rendre les scripts exécutables :
```bash
chmod +x deploy-instance.sh manage-instances.sh
```

## Migration depuis docker-compose

Si vous avez une installation existante avec docker-compose :

1. **Sauvegarder vos données** :
   ```bash
   cp data/dev.db data/dev.db.backup
   ```

2. **Arrêter docker-compose** :
   ```bash
   docker-compose down
   ```

3. **Déployer avec le nouveau script** :
   ```bash
   ./deploy-instance.sh
   ```

4. **Migrer les données si nécessaire** :
   - Copiez l'ancienne base de données dans le nouveau répertoire d'instance
   - Ou utilisez l'ancienne base comme point de départ

## Support

- **Issues** : https://github.com/votre-username/LogicAI-N8N/issues
- **Documentation** : https://github.com/votre-username/LogicAI-N8N/wiki
- **Discussions** : https://github.com/votre-username/LogicAI-N8N/discussions

## Licence

MIT - Voir le fichier LICENSE pour plus de détails.
