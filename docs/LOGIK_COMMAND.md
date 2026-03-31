# Fonctionnalité /logik - Génération de Workflows par IA

## Vue d'ensemble

La commande `/logik` permet de générer automatiquement des workflows complets en utilisant l'IA Z.ai GLM 4.7 directement depuis le panneau de chat.

## Configuration

### Prérequis

1. Obtenir une clé API Z.ai sur: https://z.ai
2. Ajouter la clé dans le fichier `.env` **du serveur backend** (`server/.env`):
   ```env
   # Z.ai API
   ZAI_API_KEY=your_zai_api_key_here
   ZAI_API_URL=https://api.z.ai/v1/chat/completions
   ```
3. Redémarrer le serveur backend

⚠️ **Note de sécurité:** La clé API est stockée sur le serveur backend uniquement. Le front-end n'a jamais accès à la clé, toutes les requêtes passent par votre API sur `http://localhost:3000/api/ai/generate-workflow`.

## Utilisation

### Syntaxe de base

```
/logik <description du workflow>
```

### Exemples

#### Exemple 1: Workflow simple
```
/logik créer un workflow avec webhook et http request
```

**Résultat:** 
- 1 nœud Webhook Trigger
- 1 nœud HTTP Request
- Connexion automatique entre les deux
- Configurations par défaut appropriées

#### Exemple 2: Workflow avec IA
```
/logik créer un workflow avec webhook, openAI pour analyser le texte, et envoyer par email
```

**Résultat:**
- 1 nœud Webhook Trigger
- 1 nœud OpenAI (GPT-4)
- 1 nœud Email Send
- Connexions logiques entre tous les nœuds

#### Exemple 3: Workflow multi-branches
```
/logik workflow avec trigger chat, condition si, et deux actions HTTP différentes selon la condition
```

**Résultat:**
- 1 nœud Chat Trigger
- 1 nœud If (condition)
- 2 nœuds HTTP Request (branches true/false)
- Connexions conditionnelles

#### Exemple 4: Workflow base de données
```
/logik workflow pour récupérer des données MySQL, transformer avec code JavaScript, et sauvegarder dans MongoDB
```

**Résultat:**
- 1 nœud MySQL
- 1 nœud Code (JavaScript)
- 1 nœud MongoDB
- Pipeline de traitement de données

## Conseils d'utilisation

### 🎯 Soyez spécifique
- ✅ "créer un workflow avec webhook qui appelle OpenAI GPT-4 puis envoie le résultat par Discord"
- ❌ "faire un workflow cool"

### 🔗 Mentionnez les connexions
- ✅ "webhook connecté à openAI puis à email"
- ❌ "webhook openAI email" (sans indication de flux)

### ⚙️ Précisez les configurations importantes
- ✅ "webhook avec méthode POST, OpenAI avec GPT-4"
- ⚙️ L'IA choisira des valeurs par défaut si non spécifié

### 📊 Commencez toujours par un trigger
L'IA commence automatiquement par un trigger, mais vous pouvez spécifier lequel:
- "webhook trigger"
- "chat trigger"
- "form trigger"
- "schedule trigger"
- "cron trigger"

## Nœuds disponibles

### Triggers
- `webhook` - Déclenche sur requête HTTP
- `chatTrigger` - Déclenche depuis chat (Discord, Telegram, Slack, Textual)
- `formTrigger` - Formulaire HTML personnalisé
- `scheduleTrigger` - Planification simple
- `cronTrigger` - Planification avancée (cron)
- `emailTrigger` - Déclenche sur réception d'email
- `httpPollTrigger` - Polling HTTP périodique
- `clickTrigger` - Déclenchement manuel par bouton

### Actions HTTP
- `httpRequest` - Requête HTTP externe

### AI/LLM
- `openAI` - GPT-3.5, GPT-4
- `anthropic` - Claude 3.5 Sonnet, Opus
- `gemini` - Google Gemini Pro
- `perplexity` - Perplexity AI
- `ollama` - LLMs locaux
- `openrouter` - Gateway multi-LLM

### Bases de données
- `mySQL` - MySQL/PostgreSQL
- `mongoDB` - MongoDB
- `redis` - Redis cache
- `supabase` - Supabase backend
- `firebase` - Firebase/Firestore
- `sqlite` - SQLite

### Logique et manipulation
- `setVariable` - Modifier variables
- `if` - Condition if/else
- `switch` - Branches multiples
- `merge` - Fusionner branches
- `loop` - Boucles
- `code` - Code JavaScript/Python
- `date` - Manipulation de dates
- `textFormatter` - Format texte
- `uuid` - Générer UUIDs

### Communication
- `whatsappSendMessage` - WhatsApp message
- `telegramSendMessage` - Telegram message
- `discordSendMessage` - Discord message
- `slackSendMessage` - Slack message

### Réseaux sociaux
- `instagram` - Instagram posts
- `facebook` - Facebook posts
- `twitter` - Twitter/X tweets
- `linkedin` - LinkedIn posts
- `tiktok` - TikTok videos

### Écosystèmes mobiles
- `imessage` - iMessage (Apple)
- `icloudReminders` - Rappels iCloud
- `icloudNotes` - Notes iCloud
- `androidMessages` - SMS Android
- `androidContacts` - Contacts Android

### Streaming
- `twitch` - Twitch
- `youtube` - YouTube
- `kick` - Kick

### Infrastructure
- `gitHub` - GitHub repos, PRs, issues
- `figma` - Figma design
- `stripe` - Paiements Stripe
- `s3` - Amazon S3 storage

### Nœuds exclusifs LogicAI
- `humanInTheLoop` - Validation humaine avec URL d'approbation
- `smartDataCleaner` - Nettoyage automatique de données
- `aiCostGuardian` - Optimisation budget tokens LLM
- `noCodeBrowserAutomator` - Automatisation navigateur
- `aggregatorMultiSearch` - Multi-search consolidé
- `liveCanvasDebugger` - Débogage visuel
- `socialMockupPreview` - Aperçu posts sociaux
- `rateLimiterBypass` - Gestion intelligente rate limits
- `ghost` - Mode GDPR sans logs

## Gestion des erreurs

### Erreur: "Authentication required. Please login first."
**Cause:** Aucun token JWT dans localStorage
**Solution:** Connectez-vous à votre compte LogicAI

### Erreur: "Z.ai API key not configured on server"
**Cause:** `ZAI_API_KEY` non définie dans `server/.env`
**Solution:** Ajoutez la clé dans le .env du serveur et redémarrez

### Erreur: "Invalid response format from AI"
**Cause:** L'IA n'a pas généré un JSON valide
**Solution:** Reformulez votre demande de manière plus claire

### Erreur: "API error: 401"
**Cause:** Clé API invalide, expirée, ou token JWT invalide
**Solution:** 
1. Vérifiez votre clé API Z.ai dans `server/.env`
2. Reconnectez-vous pour obtenir un nouveau token JWT

### Pas de nœuds créés
**Cause:** La demande était trop vague
**Solution:** Soyez plus spécifique sur les nœuds souhaités

## Architecture technique

### Flux d'exécution

1. **Parsing**: Détection du préfixe `/logik` dans le message
2. **Extraction**: Extraction de la description après `/logik `
3. **Auth**: Récupération du token JWT depuis localStorage
4. **Backend Call**: Appel au serveur backend `/api/ai/generate-workflow` avec le token
5. **API Call**: Le serveur backend appelle Z.ai avec sa clé API (sécurisée)
6. **Response**: Le serveur retourne la réponse Z.ai au front-end
7. **Validation**: Parsing et validation de la réponse JSON
8. **Création**: Génération des objets CustomNode
9. **Positionnement**: Calcul automatique des positions (espacement 250px)
10. **Connexions**: Création des edges entre nœuds
11. **Feedback**: Retour d'explication dans le chat

### Architecture de sécurité

```
┌─────────────────┐
│   Front-end     │
│  (pas de clé)   │
└────────┬────────┘
         │ POST /api/ai/generate-workflow
         │ Authorization: Bearer <jwt_token>
         │ Body: { messages: [...] }
         ▼
┌─────────────────┐
│  Backend API    │
│  (port 3000)    │
│  ✓ Auth check   │
│  ✓ ZAI_API_KEY  │
└────────┬────────┘
         │ POST https://api.z.ai/v1/chat/completions
         │ Authorization: Bearer <zai_api_key>
         │ Body: { model, messages, ... }
         ▼
┌─────────────────┐
│    Z.ai API     │
│  GLM 4.7 Model  │
└─────────────────┘
```

**Avantages:**
- ✅ Clé API jamais exposée au client
- ✅ Authentification requise (JWT)
- ✅ Contrôle centralisé des appels IA
- ✅ Possibilité de rate limiting côté serveur
- ✅ Logs centralisés des requêtes IA

### Système Prompt

Le système prompt envoyé à Z.ai contient:
- Liste complète des 100+ nœuds disponibles
- Description de chaque nœud
- Liste des champs de configuration
- Règles strictes de génération
- Format JSON exact attendu
- Exemples de configurations

### Contraintes IA

L'IA est **strictement contrainte** à:
- ✅ Utiliser UNIQUEMENT les nœuds listés
- ✅ Commencer par un trigger
- ✅ Créer des connexions logiques
- ✅ Remplir les configurations avec des valeurs par défaut
- ✅ Répondre en JSON valide

## Exemples avancés

### Workflow complet de traitement d'emails
```
/logik workflow avec email trigger, extraire les pièces jointes, analyser avec OpenAI, et sauvegarder les résultats dans Supabase
```

### Pipeline de données
```
/logik créer un pipeline qui lit MySQL toutes les heures, transforme les données avec code JavaScript, et les envoie à un webhook externe
```

### Bot de modération Discord
```
/logik bot Discord qui reçoit des messages, analyse le sentiment avec OpenAI, et ban automatiquement si toxique
```

### Système de notification multi-canal
```
/logik webhook qui reçoit des alertes et les envoie simultanément sur Slack, Discord, et Telegram
```

## Limitations

- **Token limit**: Maximum 2000 tokens de réponse
- **Complexité**: Recommandé max 10 nœuds par workflow
- **Performance**: Génération prend 3-10 secondes selon complexité
- **Coût**: Consomme des crédits Z.ai API

## Roadmap

### Prochaines améliorations

- [ ] Validation des configurations générées
- [ ] Suggestions de nœuds manquants
- [ ] Export/import de prompts favoris
- [ ] Mode "explain workflow" pour documenter existants
- [ ] Génération multi-étapes pour workflows complexes
- [ ] Fine-tuning du modèle sur exemples LogicAI

## Support

Pour toute question ou problème:
1. Vérifiez cette documentation
2. Consultez les logs de la console navigateur
3. Testez avec des prompts simples d'abord
4. Contactez le support avec le prompt exact utilisé

---

**Version:** 1.0.0  
**Date:** 2024  
**Modèle IA:** Z.ai GLM 4.7 (glm-4-flash)
