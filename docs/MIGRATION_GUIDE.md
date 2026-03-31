# Guide de Migration - Architecture Sécurisée

## Migration de VITE_ZAI_API_KEY (v1.0) vers Backend API (v2.0)

### Changements

**Avant (v1.0 - Non sécurisé):**
- Clé API Z.ai dans `docker-instance/web/.env`
- Variable: `VITE_ZAI_API_KEY`
- Appels directs depuis le front-end vers Z.ai
- ❌ Clé exposée dans le bundle JavaScript

**Après (v2.0 - Sécurisé):**
- Clé API Z.ai dans `server/.env`
- Variable: `ZAI_API_KEY`
- Appels via backend API (`/api/ai/generate-workflow`)
- ✅ Clé protégée côté serveur
- ✅ Authentification JWT requise

### Étapes de migration

#### 1. Sauvegarder votre clé actuelle

Si vous aviez déjà configuré `VITE_ZAI_API_KEY`:

```bash
# Windows PowerShell
Get-Content docker-instance\web\.env | Select-String "VITE_ZAI_API_KEY"

# Linux/Mac
grep VITE_ZAI_API_KEY docker-instance/web/.env
```

Copiez la valeur de la clé.

#### 2. Supprimer l'ancienne configuration

```bash
# Vous pouvez supprimer cette ligne du fichier docker-instance/web/.env
# VITE_ZAI_API_KEY=...

# Ou garder le fichier vide pour de futures variables front-end
```

#### 3. Configurer le backend

Ouvrez `server/.env` et ajoutez:

```env
# Z.ai API
ZAI_API_KEY=votre_clé_copiée_à_l_étape_1
ZAI_API_URL=https://api.z.ai/v1/chat/completions
```

#### 4. Redémarrer les services

**Backend:**
```bash
cd server
# Si vous utilisez nodemon, il redémarre automatiquement
# Sinon:
npm run dev
```

**Frontend (si Docker):**
```bash
cd docker-instance
docker-compose down
docker-compose up -d --build
```

**Frontend (si dev local):**
```bash
cd docker-instance/web
# Pas de rebuild nécessaire, juste rafraîchir le navigateur
```

#### 5. Vérifier la migration

1. **Tester le backend:**
   ```bash
   curl http://localhost:3000/api/ai/health
   ```
   
   ✅ Devrait retourner:
   ```json
   {
     "success": true,
     "message": "AI service is running",
     "configured": true,
     "model": "glm-4-flash",
     "provider": "Z.ai"
   }
   ```

2. **Tester dans l'application:**
   - Connectez-vous
   - Ouvrez un workflow
   - Ouvrez le ChatPanel
   - Tapez: `/logik créer un workflow simple`
   - ✅ Devrait fonctionner comme avant

#### 6. Nettoyer (optionnel)

Si vous avez des anciennes variables dans des fichiers Docker:

**Dockerfile:**
```dockerfile
# Supprimer si présent:
# ARG VITE_ZAI_API_KEY
# ENV VITE_ZAI_API_KEY=${VITE_ZAI_API_KEY}
```

**docker-compose.yml:**
```yaml
# Supprimer si présent dans environment:
# - VITE_ZAI_API_KEY=${VITE_ZAI_API_KEY}
```

### Avantages de la migration

✅ **Sécurité renforcée**
- Clé API jamais exposée au client
- Pas de risque de vol via DevTools ou bundle JS

✅ **Meilleur contrôle**
- Authentification requise (JWT)
- Possibilité de rate limiting
- Logs centralisés

✅ **Maintenance simplifiée**
- Changement de clé sans rebuild front-end
- Rotation facile des secrets
- Configuration centralisée

✅ **Évolutivité**
- Possibilité d'ajouter du caching
- Support multi-modèles futur
- Quotas par utilisateur/plan

### Dépannage après migration

#### Problème: "Authentication required"

**Cause:** Le nouveau système nécessite un token JWT

**Solution:**
1. Déconnectez-vous
2. Reconnectez-vous
3. Le token sera automatiquement stocké

#### Problème: "Z.ai API key not configured on server"

**Cause:** La clé n'est pas dans `server/.env`

**Solution:**
1. Vérifiez que `ZAI_API_KEY` est bien dans `server/.env`
2. Vérifiez qu'il n'y a pas d'espaces avant/après la valeur
3. Redémarrez le serveur backend

#### Problème: "API error: 401"

**Cause:** Deux possibilités
1. Clé Z.ai invalide
2. Token JWT expiré

**Solution:**
1. Vérifiez votre clé sur https://z.ai
2. Reconnectez-vous à l'application

#### Problème: Aucune erreur mais rien ne se passe

**Cause:** Le serveur backend n'est pas démarré

**Solution:**
```bash
# Vérifier si le backend tourne
curl http://localhost:3000/api/health

# Si pas de réponse, démarrer:
cd server
npm run dev
```

### Checklist de migration

- [ ] Clé API Z.ai copiée depuis l'ancien `.env`
- [ ] Clé ajoutée dans `server/.env` (variable `ZAI_API_KEY`)
- [ ] Variable `ZAI_API_URL` ajoutée dans `server/.env`
- [ ] Ancien `VITE_ZAI_API_KEY` supprimé ou commenté
- [ ] Serveur backend redémarré
- [ ] Health check testé: `curl http://localhost:3000/api/ai/health`
- [ ] Frontend redémarré (si Docker) ou rafraîchi (si dev)
- [ ] Test `/logik` dans l'application réussi
- [ ] Documentation lue: `docs/AI_SECURITY_ARCHITECTURE.md`

### Rollback (si besoin)

Si vous voulez revenir à l'ancienne version (non recommandé):

1. Restaurez `VITE_ZAI_API_KEY` dans `docker-instance/web/.env`
2. Changez dans `zai.ts`:
   ```typescript
   // Restaurer:
   const ZAI_API_URL = 'https://api.z.ai/v1/chat/completions';
   const ZAI_API_KEY = import.meta.env.VITE_ZAI_API_KEY || '';
   
   // Et remplacer generateWorkflow() par l'ancienne version
   ```
3. Rebuild le front-end

⚠️ **Non recommandé:** Cela exposera votre clé API. Utilisez cette méthode uniquement pour débugger.

### Questions fréquentes

**Q: Dois-je changer ma clé API Z.ai?**
R: Non, vous pouvez utiliser la même clé, il suffit de la déplacer du front-end vers le backend.

**Q: Les anciens workflows fonctionneront-ils?**
R: Oui, seul le flux d'authentification change, pas la génération de workflows.

**Q: Puis-je encore utiliser `/logik` de la même façon?**
R: Oui, la commande `/logik` fonctionne exactement de la même manière pour l'utilisateur.

**Q: Y a-t-il un coût supplémentaire?**
R: Non, les appels à Z.ai restent les mêmes, seul le chemin change.

**Q: Comment savoir que la migration a réussi?**
R: Si `/logik` fonctionne et que `curl http://localhost:3000/api/ai/health` retourne `"configured": true`, la migration est réussie.

### Support

Si vous rencontrez des problèmes lors de la migration:

1. Vérifiez ce guide étape par étape
2. Consultez `docs/AI_SECURITY_ARCHITECTURE.md`
3. Vérifiez les logs du serveur backend
4. Vérifiez la console du navigateur (F12)
5. Contactez le support avec:
   - Version avant migration
   - Étape où vous êtes bloqué
   - Logs d'erreur complets

---

**Version:** 2.0.0  
**Date de migration:** Février 2026  
**Durée estimée:** 5-10 minutes
