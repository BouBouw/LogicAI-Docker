# Tests /logik - Exemples de Prompts

## Tests de base (Simple)

### Test 1: Workflow minimal
```
/logik créer un workflow simple avec webhook et http request
```
**Attendu:** 2 nœuds (webhook → httpRequest)

### Test 2: Trigger chat
```
/logik workflow avec chat trigger
```
**Attendu:** 1 nœud (chatTrigger)

### Test 3: Webhook + Variable
```
/logik webhook qui définit une variable
```
**Attendu:** 2 nœuds (webhook → setVariable)

## Tests avec IA (Intermédiaire)

### Test 4: OpenAI basique
```
/logik créer un workflow avec webhook et openAI pour analyser du texte
```
**Attendu:** 2 nœuds (webhook → openAI)

### Test 5: Pipeline IA complet
```
/logik webhook qui envoie le texte à OpenAI puis le résultat par email
```
**Attendu:** 3 nœuds (webhook → openAI → email)

### Test 6: Multi-AI
```
/logik comparer les réponses de OpenAI et Claude sur le même prompt
```
**Attendu:** 3+ nœuds (webhook → openAI + anthropic)

## Tests avec logique (Intermédiaire)

### Test 7: Condition simple
```
/logik webhook avec condition if qui route vers deux actions HTTP différentes
```
**Attendu:** 4 nœuds (webhook → if → httpRequest x2)

### Test 8: Switch multi-branches
```
/logik switch selon le status avec 3 branches différentes
```
**Attendu:** 4+ nœuds (trigger → switch → actions x3)

### Test 9: Boucle
```
/logik webhook qui boucle sur un array et fait un http request pour chaque élément
```
**Attendu:** 3 nœuds (webhook → loop → httpRequest)

## Tests bases de données (Avancé)

### Test 10: MySQL simple
```
/logik lire des données MySQL et les afficher
```
**Attendu:** 2 nœuds (trigger → mySQL)

### Test 11: Pipeline MongoDB
```
/logik webhook qui sauvegarde les données dans MongoDB
```
**Attendu:** 2 nœuds (webhook → mongoDB)

### Test 12: Multi-DB
```
/logik lire MySQL, transformer avec code, sauvegarder dans MongoDB
```
**Attendu:** 4 nœuds (trigger → mySQL → code → mongoDB)

### Test 13: Redis cache
```
/logik vérifier cache Redis, si vide appeler API et cacher le résultat
```
**Attendu:** 5+ nœuds (trigger → redis get → if → httpRequest → redis set)

## Tests communication (Avancé)

### Test 14: Discord + Slack
```
/logik webhook qui envoie le message sur Discord et Slack
```
**Attendu:** 3 nœuds (webhook → discordSendMessage + slackSendMessage)

### Test 15: WhatsApp notification
```
/logik envoyer une notification WhatsApp quand webhook reçoit une alerte
```
**Attendu:** 2 nœuds (webhook → whatsappSendMessage)

### Test 16: Multi-canal
```
/logik broadcast un message sur Discord, Telegram, et Slack simultanément
```
**Attendu:** 4+ nœuds (trigger → 3 actions de messaging)

## Tests réseaux sociaux (Avancé)

### Test 17: Post Twitter
```
/logik poster un tweet automatiquement
```
**Attendu:** 2 nœuds (trigger → twitterTweet)

### Test 18: Cross-post social
```
/logik publier le même contenu sur Twitter, LinkedIn et Facebook
```
**Attendu:** 4 nœuds (trigger → twitter + linkedin + facebook)

### Test 19: Instagram scheduled
```
/logik schedule pour poster une image Instagram tous les jours
```
**Attendu:** 2-3 nœuds (cronTrigger/scheduleTrigger → instagramPost)

## Tests complexes (Expert)

### Test 20: Pipeline complet
```
/logik workflow avec form trigger, validation, openAI pour générer réponse, sauvegarder dans Supabase, et envoyer email de confirmation
```
**Attendu:** 6+ nœuds

### Test 21: Bot modération
```
/logik bot Discord qui analyse les messages avec OpenAI, détecte la toxicité avec condition, et ban si score > 0.8
```
**Attendu:** 4+ nœuds (chatTrigger → openAI → if → action)

### Test 22: ETL workflow
```
/logik cron qui lit MySQL toutes les heures, nettoie les données, calcule des stats avec code JavaScript, sauvegarde dans MongoDB, et envoie rapport par email
```
**Attendu:** 6+ nœuds (cronTrigger → mySQL → smartDataCleaner → code → mongoDB → email)

### Test 23: Human-in-the-loop
```
/logik workflow de validation avec webhook, openAI pour analyser, human-in-the-loop pour approbation, puis action selon décision
```
**Attendu:** 5+ nœuds (webhook → openAI → humanInTheLoop → if → actions)

## Tests nœuds exclusifs LogicAI

### Test 24: Smart Data Cleaner
```
/logik nettoyer automatiquement des données avec smart data cleaner
```
**Attendu:** 2 nœuds (trigger → smartDataCleaner)

### Test 25: AI Cost Guardian
```
/logik optimiser le prompt avant d'envoyer à OpenAI pour économiser des tokens
```
**Attendu:** 3 nœuds (trigger → aiCostGuardian → openAI)

### Test 26: Browser Automation
```
/logik automatiser navigation web pour scraper des données
```
**Attendu:** 2 nœuds (trigger → noCodeBrowserAutomator)

### Test 27: Multi-Search
```
/logik chercher sur Google et DuckDuckGo simultanément et consolider les résultats
```
**Attendu:** 2 nœuds (trigger → aggregatorMultiSearch)

## Tests cas d'erreur

### Test 28: Prompt vide
```
/logik
```
**Attendu:** Message d'erreur "Veuillez fournir une description"

### Test 29: Prompt incomplet
```
/logik créer
```
**Attendu:** Message d'erreur ou workflow minimal

### Test 30: Nœuds inexistants
```
/logik créer workflow avec nœud magique qui fait tout
```
**Attendu:** L'IA devrait refuser ou substituer avec nœuds existants

## Tests de robustesse

### Test 31: Prompt en anglais
```
/logik create a workflow with webhook and openai
```
**Attendu:** Doit fonctionner (IA multilingue)

### Test 32: Prompt très long
```
/logik créer un workflow complexe qui commence par un form trigger avec 10 champs incluant nom prénom email téléphone adresse ville code postal pays notes et préférences, puis valide chaque champ avec du code JavaScript, ensuite envoie à OpenAI pour analyser le profil utilisateur et générer une recommandation personnalisée, sauvegarde tout dans Supabase avec horodatage, envoie un email de bienvenue via SMTP, poste une notification sur Slack pour l'équipe, et enfin retourne un JSON avec toutes les informations
```
**Attendu:** Workflow complet même si complexe

### Test 33: Références à des variables
```
/logik webhook qui reçoit un userId, le cherche dans MySQL, passe les données à OpenAI avec le prompt "Analyse cet utilisateur: {{ $json.user }}", et retourne le résultat
```
**Attendu:** Variables {{ $json.X }} dans les configs

## Métriques de succès

Pour chaque test, vérifier:

✅ **Syntaxe JSON valide**
- La réponse AI est parsable

✅ **Nœuds valides**
- Tous les types existent dans NODE_TYPES_METADATA

✅ **Trigger en premier**
- Le premier nœud est un trigger

✅ **Connexions logiques**
- Les edges connectent les bons nœuds
- Pas de nœuds isolés

✅ **Configurations complètes**
- Tous les champs requis sont remplis
- Valeurs par défaut sensées

✅ **Positions calculées**
- Espacement horizontal de 250px
- Pas de chevauchement

✅ **Explication claire**
- L'explication décrit correctement le workflow

## Résultats attendus par catégorie

| Catégorie | Tests | Taux de succès attendu |
|-----------|-------|------------------------|
| Base | 1-3 | 100% |
| IA | 4-6 | 95% |
| Logique | 7-9 | 90% |
| Bases de données | 10-13 | 85% |
| Communication | 14-16 | 90% |
| Réseaux sociaux | 17-19 | 85% |
| Complexes | 20-23 | 75% |
| Exclusifs LogicAI | 24-27 | 80% |
| Erreurs | 28-30 | 100% (gestion erreur) |
| Robustesse | 31-33 | 70% |

## Journal de tests

### Template de rapport

```markdown
**Test #X:** [Nom du test]
**Date:** YYYY-MM-DD
**Prompt:** `[prompt exact]`

**Résultat:**
- ✅/❌ JSON valide
- ✅/❌ Nœuds valides
- ✅/❌ Trigger en premier
- ✅/❌ Connexions logiques
- ✅/❌ Configurations complètes
- ✅/❌ Positions correctes
- ✅/❌ Explication claire

**Workflow généré:**
- Nombre de nœuds: X
- Types: [liste des types]
- Nombre de connexions: X

**Observations:**
[Notes sur le comportement]

**Bugs trouvés:**
[Liste des problèmes]

**Améliorations suggérées:**
[Idées d'amélioration]
```

---

**Comment utiliser ce fichier:**

1. Copier un prompt de test
2. Le coller dans le ChatPanel avec le préfixe `/logik`
3. Observer le résultat
4. Vérifier les métriques de succès
5. Noter dans le journal de tests
6. Passer au test suivant

**Ordre recommandé:**
- Commencer par les tests Base (1-3)
- Progresser vers tests IA (4-6)
- Tester la logique (7-9)
- Puis complexes (20-23)
- Finir par cas d'erreur (28-30)
