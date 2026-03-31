# Guide de Démarrage Rapide - /logik

## 🚀 Configuration en 5 minutes

### Étape 1: Obtenir une clé API Z.ai

1. Visitez [https://z.ai](https://z.ai)
2. Créez un compte ou connectez-vous
3. Accédez à la section "API Keys" dans votre dashboard
4. Créez une nouvelle clé API
5. Copiez la clé (format: `zai_xxxxxxxxxxxx`)

### Étape 2: Configurer le serveur backend (IMPORTANT - Sécurité)

⚠️ **Pour des raisons de sécurité, la clé API Z.ai est stockée sur le serveur backend, pas dans le front-end.**

1. Naviguez vers le dossier serveur:
   ```bash
   cd server
   ```

2. Ouvrez le fichier `.env` qui existe déjà

3. Ajoutez/modifiez ces lignes:
   ```env
   # Z.ai API
   ZAI_API_KEY=votre_clé_api_z.ai_ici
   ZAI_API_URL=https://api.z.ai/v1/chat/completions
   ```

4. Sauvegardez le fichier

### Étape 3: Redémarrer le serveur backend

```bash
# Si vous utilisez nodemon (dev)
# Le serveur redémarre automatiquement

# Si vous utilisez node
# Ctrl+C puis
npm run dev
# ou
npm start
```

### Étape 4: Rebuild le front-end (Docker ou Dev)

#### Méthode 1: Docker (Production)

```bash
cd docker-instance

# Rebuild l'image
docker build -t logicai-n8n:latest .

# Redémarrer le container
docker-compose down
docker-compose up -d
```

#### Méthode 2: Dev local

```bash
cd docker-instance/web

# Installer les dépendances si nécessaire
npm install

# Démarrer en mode dev
npm run dev
```5: Vérifier la configuration

1. Vérifiez que le serveur backend est démarré (port 3000)
2. Testez le health check de l'API AI:
   - Ouvrez dans votre navigateur: `http://localhost:3000/api/ai/health`
   - Devrait retourner: `{"success": true, "configured": true, ...}`
3. Ouvrez l'application web dans le navigateur
4. Connectez-vous avec votre compte
5. Ouvrez la console DevTools (F12)
6. Vérifiez qu'il n'y a pas d'erreur

### Étape 6vec un prompt simple

### Étape 5: Premier test 🎉

1. Ouvrez un workflow existant (ou créez-en un nouveau)
2. Ouvrez le panneau de chat (icône de message en bas à droite)
3. Tapez dans le chat:
   ```
   /logik créer un workflow simple avec webhook et http request
   ```
4. Appuyez sur Entrée
5. Attendez 3-10 secondes
6. ✨ Observez les nœuds apparaître sur le canvas!

## ✅ Vérifications

### Configuration correcte

Si tout fonctionne, vous devriez voir:

✅ Message de succès dans le chat:
```
✨ Workflow créé avec succès!

[Explication du workflow]

📊 2 nœud(s) et 1 connexion(s) ajouté(s).
```

✅ Nœuds apparaissent instantanément sur le canvas

✅ Les nœuds sont connectés avec des edges

✅ Les coAuthentication required. Please login first."

**Cause:** Vous n'êtes pas connecté

**Solution:**
1. Connectez-vous avec votre compte LogicAI
2. Le token d'authentification sera automatiquement utilisé

#### ❌ "Z.ai API key not configured on server"

**Cause:** Variable ZAI_API_KEY non définie dans le serveur backend

**Solution:**
1. Vérifiez que le fichier `server/.env` existe
2. Vérifiez que la ligne `ZAI_API_KEY=...` est présente et correcte
3. Redémarrez le serveur backend

#### ❌ "API error: 401 Unauthorized"

**Cause:** Clé API Z.ai invalide ou expirée

**Solution:**
1. Vérifiez que la clé dans `server/.env` est correcte (pas d'espaces, copie complète)
2. Générez une nouvelle clé sur Z.ai
3. Mettez à jour le `server/.env`
4. Redémarrez le serveur backend
1. Vérifiez que la clé est correcte (pas d'espaces, copie complète)
2. Générez une nouvelle clé sur Z.ai
3. Mettez à jour le `.env`
4. Redémarrez

#### ❌ "Invalid response format from AI"

**Cause:** L'IA n'a pas généré un JSON valide
serveur backend non démarré

**Solution:**
1. Vérifiez que le serveur backend tourne (port 3000)
2. Testez: `http://localhost:3000/api/ai/health`
3. Ouvrez DevTools (F12) → Console pour les erreurs
4. Vérifiez l'onglet Network pour voir si la requête à `/api/ai/generate-workflow` est envoyée
5### ❌ Rien ne se passe

**Cause:** Erreur JavaScript ou console

**Solution:**
1. Ouvrez DevTools (F12)
2. Regardez l'onglet Console pour les erreurs
3. Vérifiez l'onglet Network pour voir si la requête à Z.ai est envoyée
4. Contactez le support avec les logs

## 📝 Premiers prompts recommandés

### Très simple (pour tester)
```
/logik créer un workflow avec webhook
```

### Simple (recommandé pour débuter)
```
/logik webhook et http request
```

### Intermédiaire
```
/logik webhook qui appelle OpenAI et envoie par email
```

### Complexe
```
/logik workflow avec form trigger, openAI pour analyser, et sauvegarder dans Supabase
```

## 🎓 Apprentissage progressif

### Jour 1: Maîtriser les bases
- Testez 5-10 workflows simples
- Expérimentez avec différents triggers
- Essayez de combiner 2-3 nœuds

### Jour 2: Explorer les catégories
- Testez les nœuds IA (OpenAI, Claude, Gemini)
- Essayez les bases de données (MySQL, MongoDB)
- Testez la communication (Discord, Slack, Email)

### Jour 3: Workflows avancés
- Créez des conditions (if/else)
- Utilisez des boucles (loop)
- Intégrez du code JavaScript

### Semaine 2: Production
- Créez des workflows complexes pour vos besoins réels
- Combinez 5+ nœuds
- Utilisez les nœuds exclusifs LogicAI

## 📚 Ressources

- **Documentatserveur backend:**
   ```bash
   # Vérifier si le serveur tourne
   curl http://localhost:3000/api/health
   
   # Vérifier l'API AI
   curl http://localhost:3000/api/ai/health
   ```
   → Devrait retourner: `{"success": true, "configured": true, ...}`

2. **Vérifier .env du serveur:**
   ```bash
   # Windows PowerShell
   Get-Content server\.env | Select-String "ZAI"
   
   # Linux/Mac
   cat server/.env | grep ZAI
   ```
   → Devrait afficher: `
1. **Vérifier .env:**
   ```bash
   # Windows PowerShell
   Get-Content docker-instance/web/.env
   
   # Linux/Mac
   cat docker-instance/web/.env
   ```
   → Devrait afficher: `VITE_ZAI_API_KEY=...`

2. **Vérifier console:**
   - F12 → Console
   - Rechercher erreurs en rouge
   - Copier l'erreur complète

3. **Vérifier Network:**
   - F12 → Network
   - Filtrer par "chat/completions"
   - Vérifier status code (200 = OK, 401 = Auth error)

### Obtenir de l'aide

**Forum:** [URL du forum]
**Discord:** [URL du Discord]
**GitHub Issues:** [URL des issues]

Inclure dans votre demande:
- Le prompt exact utilisé
- Le message d'erreur complet
- Screenshot de la console (F12)
- Votre version de LogicAI

## 🎉 Félicitations!

Vous êtes maintenant prêt à utiliser `/logik` pour générer des workflows automatiquement!

**Prochain objectif:** Testez les 33 prompts dans `LOGIK_TESTS.md` pour devenir expert! 🚀

---

**Temps de setup:** ~5 minutes  
**Temps pour devenir efficace:** ~1 heure  
**Temps pour maîtriser:** ~1 semaine
