# 🚀 Démarrage Rapide - LogicAI-N8N

Installation et démarrage automatique de LogicAI-N8N en **UNE SEULE COMMANDE** !

## 📋 Prérequis

- **Docker** installé et en cours d'exécution
  - [Télécharger Docker Desktop pour Windows/macOS](https://www.docker.com/products/docker-desktop)
  - **Linux** : `curl -fsSL https://get.docker.com | sh`

## ⚡ Installation Ultra-Rapide

### Windows

Ouvrez **PowerShell** dans le dossier du projet et exécutez :

```powershell
.\start.ps1
```

**Si vous obtenez une erreur de droits d'exécution :**

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\start.ps1
```

### Linux / macOS

Ouvrez un **terminal** dans le dossier du projet et exécutez :

```bash
./start.sh
```

Le script va automatiquement :
1. ✅ Vérifier que Docker est installé
2. ✅ Générer une clé de chiffrement sécurisée
3. ✅ Créer la configuration nécessaire
4. ✅ Construire les images Docker
5. ✅ Démarrer tous les services
6. ✅ Ouvrir votre navigateur web

## 🌐 Accès à l'Application

Une fois démarré, accédez à :

- **Interface Web** : http://localhost:5174
- **API Backend** : http://localhost:3001

## 📝 Commandes Utiles

```bash
# Voir les logs en temps réel
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Redémarrer l'application
docker-compose restart

# Mettre à jour l'application
git pull
docker-compose up -d --build

# Sauvegarder la base de données
cp data/dev.db data/dev.db.backup
```

## 📚 Documentation Complète

Pour plus de détails sur la configuration, le développement, ou la résolution de problèmes, consultez :

**[DOCKER_SETUP.md](DOCKER_SETUP.md)**

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
# Arrêter et supprimer tout
docker-compose down -v

# Relancer le script d'installation
./start.sh  # ou .\start.ps1 sur Windows
```

## 🎉 C'est tout !

LogicAI-N8N est maintenant prêt à l'emploi. Commencez à créer vos workflows d'automatisation !

---

**Besoin d'aide ?** Consultez [DOCKER_SETUP.md](DOCKER_SETUP.md) ou ouvrez une issue sur GitHub.
