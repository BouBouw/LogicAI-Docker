# 🔧 Solution pour l'erreur 500 lors de la création de workflows

## Problème identifié

L'erreur 500 se produit lors de la création d'un workflow car :
1. La base de données SQLite pour l'instance n'existe pas
2. Le schéma Prisma n'a pas été appliqué à cette base de données

## Solution

### 1. Initialiser la base de données

Exécutez dans le terminal depuis `docker-instance/server/` :

```powershell
npm run init-db
```

Cette commande va :
- Créer le fichier de base de données pour votre instance
- Appliquer le schéma Prisma automatiquement

### 2. Vérifications

1. **Variable INSTANCE_ID définie** : Vérifiez dans `.env` :
   ```
   INSTANCE_ID="default-instance"
   ```

2. **Base de données créée** : Après l'initialisation, vous devriez voir :
   ```
   docker-instance/server/prisma/instance-default-instance.db
   ```

3. **Redémarrer le serveur** :
   ```powershell
   npm run dev
   ```

### 3. Tester la création de workflow

Maintenant, essayez de créer un nouveau workflow. Vous devriez voir dans les logs :
```
🔧 Creating workflow for instance: default-instance
📝 Creating workflow with 0 nodes and 0 edges
✅ Workflow created successfully: [workflow-id]
```

## Améliorations apportées

### 1. Configuration de la base de données (`config/database.ts`)
- ✅ Initialisation automatique des bases de données d'instance
- ✅ Support du développement local ET du déploiement Docker
- ✅ Création automatique des dossiers et fichiers de base de données
- ✅ Application automatique du schéma Prisma

### 2. Contrôleur de workflows (`controllers/workflowController.ts`)
- ✅ Logs détaillés pour le débogage
- ✅ Validation et normalisation des données (nodes/edges)
- ✅ Meilleure gestion d'erreur avec stack trace en développement

### 3. Configuration `.env`
- ✅ Ajout de `INSTANCE_ID` pour identifier l'instance

### 4. Script d'initialisation
- ✅ `init-db-instance.ps1` pour Windows
- ✅ Commande npm `npm run init-db` pour une utilisation facile

## En cas de problème persistant

### Réinitialiser complètement

```powershell
# 1. Supprimer toutes les bases de données
Remove-Item -Recurse -Force .\prisma\*.db

# 2. Réinitialiser
npm run init-db

# 3. Redémarrer le serveur
npm run dev
```

### Vérifier les logs

Le serveur affiche maintenant des logs détaillés :
- 📊 Chemin de la base de données utilisée
- 🔧 Détails de la création du workflow
- ❌ Erreurs complètes avec stack trace

### Vérifier la création manuelle

```powershell
# Test avec curl
curl -X POST http://localhost:3001/api/workflows `
  -H "Content-Type: application/json" `
  -d '{"name":"Test Workflow","nodes":[],"edges":[]}'
```

## Architecture multi-instance

Le système utilise des bases de données SQLite isolées par instance :

```
docker-instance/
  server/
    prisma/
      instance-default-instance.db    ← Base de données de l'instance
      instance-abc123.db               ← Autre instance
      schema.prisma                    ← Schéma partagé
```

Chaque instance LogicAI-N8N a sa propre base de données, ce qui permet :
- 🔒 Isolation complète des données
- 📦 Facilité de backup (un fichier par instance)
- 🚀 Déploiement multi-tenant simplifié

## Support

Si l'erreur persiste après ces étapes, vérifiez :
1. Les permissions d'écriture dans le dossier `prisma/`
2. Que Prisma est bien installé (`npm install`)
3. Les logs du serveur pour plus de détails
