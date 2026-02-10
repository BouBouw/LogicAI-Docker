# 🚀 Démarrage Rapide - LogicAI-N8N

Installation et démarrage automatique de LogicAI-N8N en **UNE SEULE COMMANDE** !

## 📋 Prérequis

- **Docker** installé et en cours d'exécution
  - [Télécharger Docker Desktop pour Windows/macOS](https://www.docker.com/products/docker-desktop)
  - **Linux** : `curl -fsSL https://get.docker.com | sh`

## ⚡ Installation Ultra-Rapide

### Déploiement avec le script automatique

Ouvrez un **terminal** dans le dossier du projet et exécutez :

```bash
./deploy-instance.sh
```

**Rendez l'exécutable au besoin :**

```bash
chmod +x deploy-instance.sh
```

Le script va automatiquement :
1. ✅ Vérifier que Docker est installé
2. ✅ Générer une clé de chiffrement sécurisée
3. ✅ Créer la configuration nécessaire
4. ✅ Construire et démarrer le conteneur
5. ✅ Ouvrir votre navigateur web

### Premier déploiement interactif

```bash
./deploy-instance.sh
```

Le script vous demandera :
- **Nom de l'instance** (par défaut : `n8n-instance`)
- **Port web** (par défaut : `5174`)
- **Port API** (par défaut : `3001`)

Appuyez simplement sur **Entrée** pour utiliser les valeurs par défaut !

## 🌐 Accès à l'Application

Une fois démarré, accédez à :

- **Interface Web** : http://localhost:5174
- **API Backend** : http://localhost:3001

## 📝 Commandes Utiles

```bash
# Lister toutes les instances
./manage-instances.sh list

# Voir les logs d'une instance
./manage-instances.sh logs n8n-instance

# Arrêter une instance
./manage-instances.sh stop n8n-instance

# Démarrer une instance
./manage-instances.sh start n8n-instance

# Supprimer une instance
./manage-instances.sh remove n8n-instance

# Mettre à jour l'application
git pull
./manage-instances.sh rebuild n8n-instance

# Sauvegarder la base de données
cp data/dev.db data/dev.db.backup
```

## 📚 Documentation Complète

- **[MULTI_INSTANCE_GUIDE.md](MULTI_INSTANCE_GUIDE.md)** : Guide complet pour gérer plusieurs instances
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** : Documentation technique détaillée

## 🔧 Résolution de Problèmes

### Ports déjà utilisés

Si vous obtenez une erreur de ports déjà utilisés :

**Windows :**
```powershell
# Voir ce qui utilise le port 3001 ou 5174
netstat -ano | findstr :3001
netstat -ano | findstr :5174

# Arrêter le processus (remplacer PID par le numéro affiché)
taskkill /PID PID /F
```

**Linux / macOS :**
```bash
# Voir ce qui utilise le port 3001 ou 5174
lsof -i :3001
lsof -i :5174

# Arrêter le processus
kill -9 PID
```

### Docker ne démarre pas

Assurez-vous que Docker Desktop est lancé :
- **Windows/macOS** : Vérifiez que Docker Desktop est en cours d'exécution
- **Linux** : `sudo systemctl start docker`

### Réinitialisation complète

Pour tout réinitialiser :

```bash
# Arrêter et supprimer l'instance
./manage-instances.sh remove n8n-instance

# Relancer le script d'installation
./deploy-instance.sh
```

## 🎉 C'est tout !

LogicAI-N8N est maintenant prêt à l'emploi. Commencez à créer vos workflows d'automatisation !

### 📖 Pour aller plus loin

- **Multi-instances** : Consultez [MULTI_INSTANCE_GUIDE.md](MULTI_INSTANCE_GUIDE.md) pour déployer plusieurs instances N8N isolées
- **Documentation technique** : Consultez [DOCKER_SETUP.md](DOCKER_SETUP.md) pour les détails de configuration

---

**Besoin d'aide ?** Consultez [MULTI_INSTANCE_GUIDE.md](MULTI_INSTANCE_GUIDE.md), [DOCKER_SETUP.md](DOCKER_SETUP.md) ou ouvrez une issue sur GitHub.
