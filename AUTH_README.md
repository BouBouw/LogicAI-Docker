# Système d'Authentification LogicAI-N8N

## Vue d'ensemble

Ce document décrit le système d'authentification ajouté à l'instance LogicAI-N8N. Le système permet aux utilisateurs de créer un compte et de se connecter pour accéder à leurs workflows.

## Fonctionnalités

### Backend (Node.js + Express)

#### Contrôleur d'Authentification
**Fichier** : [server/src/controllers/authController.ts](server/src/controllers/authController.ts)

**Fonctionnalités** :
- `register` - Inscrire un nouvel utilisateur
  - Validation des champs (email, mot de passe >= 8 caractères)
  - Hashage du mot de passe avec bcrypt
  - Génération d'un token JWT
  - Stockage en mémoire (à remplacer par une vraie BDD en production)

- `login` - Connecter un utilisateur
  - Vérification de l'email et du mot de passe
  - Comparaison du hash bcrypt
  - Génération d'un token JWT
  - Retourne l'utilisateur sans le mot de passe

- `me` - Obtenir les infos de l'utilisateur connecté
  - Nécessite un token JWT valide
  - Retourne les informations de l'utilisateur

#### Middleware d'Authentification
**Fichier** : [server/src/middleware/auth.ts](server/src/middleware/auth.ts)

**Fonctionnalités** :
- Vérification du token JWT dans le header `Authorization`
- Ajout de `userId` et `user` à l'objet Request
- Gestion des erreurs (token manquant, invalide, expiré)
- `optionalAuthMiddleware` pour les routes qui fonctionnent avec ou sans auth

#### Routes d'Authentification
**Fichier** : [server/src/routes/auth.ts](server/src/routes/auth.ts)

**Endpoints** :
- `POST /api/auth/register` - Inscription (public)
- `POST /api/auth/login` - Connexion (public)
- `GET /api/auth/me` - Infos utilisateur (nécessite auth)

### Frontend (React + TypeScript)

#### Page de Connexion
**Fichier** : [web/src/views/Login.tsx](web/src/views/Login.tsx)

**Fonctionnalités** :
- Formulaire de connexion avec email et mot de passe
- Validation côté client
- Stockage du token dans `localStorage`
- Redirection vers le dashboard après connexion
- Lien vers la page d'inscription
- Design moderne avec dégradants orange/amber

#### Page d'Inscription
**Fichier** : [web/src/views/Register.tsx](web/src/views/Register.tsx)

**Fonctionnalités** :
- Formulaire complet avec nom, prénom, email, mot de passe
- Confirmation du mot de passe
- Validation des champs
- Stockage du token dans `localStorage`
- Redirection vers le dashboard après inscription
- Design moderne avec dégradants orange/amber

## Configuration

### Variables d'Environnement

Ajoutez ces variables dans votre fichier `.env` ou configuration Docker :

```bash
# JWT Secret (changez ceci en production !)
JWT_SECRET=logicai-secret-key-change-in-production

# Durée de validité du token (optionnel)
JWT_EXPIRES_IN=7d
```

### Dépendances

#### Backend
```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "@types/bcrypt": "^5.0.2",
  "@types/jsonwebtoken": "^9.0.7"
}
```

#### Frontend
```json
{
  "lucide-react": "^0.563.0",
  "react-router": "^7.13.0"
}
```

## Utilisation

### Inscription

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "createdAt": "2024-..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Connexion

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Utilisation du Token

Le token JWT doit être inclus dans le header `Authorization` des requêtes authentifiées :

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Stockage des Données

### Actuel (In-Memory)

Le système utilise actuellement une `Map` en mémoire pour stocker les utilisateurs. C'est parfait pour le développement et les tests, mais **pas adapté à la production**.

### Pour la Production

Remplacez le stockage en mémoire par une vraie base de données :

1. **Créer un modèle Prisma User** :
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Mettre à jour authController.ts** :
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Remplacer la Map par des requêtes Prisma
const user = await prisma.user.findUnique({ where: { email } });
```

3. **Installer et générer Prisma** :
```bash
npm install @prisma/client
npm run prisma:generate
```

## Sécurité

### Bonnes Pratiques

1. **HTTPS** : Utilisez toujours HTTPS en production
2. **JWT Secret** : Utilisez un secret fort et unique en production
3. **Mots de passe** : Exigez au moins 8 caractères
4. **Rate Limiting** : Ajoutez un rate limiting pour prévenir les attaques brute force
5. **Email Verification** : Ajoutez une vérification par email pour la production

### Hashage des Mots de Passe

- Algorithme : `bcrypt` avec 10 rounds
- Sécurité : Équivalent à `bcrypt cost 12`
- Performance : ~250ms par hash sur un CPU moderne

### Tokens JWT

- Signature : HS256
- Durée de validité : 7 jours (configurable)
- Header : `Authorization: Bearer <token>`

## Personnalisation

### Couleurs

Le design utilise des dégradants orange/amber :
- Orange principal : `#f97316`
- Amber secondaire : `#fbbf24`

Vous pouvez changer ces couleurs dans les fichiers [Login.tsx](web/src/views/Login.tsx) et [Register.tsx](web/src/views/Register.tsx).

### Logo

Remplacez le logo et les icônes dans les composants Login et Register.

## Routes

Les routes d'authentification sont maintenant disponibles :
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/` - Dashboard (redirection après connexion réussie)

## Dépannage

### Token invalide

Si vous obtenez une erreur 401 avec "Token invalide ou expiré" :
1. Déconnectez-vous
2. Reconnectez-vous avec vos identifiants

### CORS

Si vous obtenez des erreurs CORS :
1. Vérifiez que `EXTERNAL_PORT` est correctement configuré
2. Vérifiez les origines autorisées dans `server/src/app.ts`

### Mot de passe perdu

Pour ajouter une fonctionnalité de réinitialisation :
1. Ajoutez un endpoint `POST /api/auth/forgot-password`
2. Ajoutez un endpoint `POST /api/auth/reset-password`
3. Envoyez un email avec un token temporaire
4. Créez une page pour saisir le nouveau mot de passe

## Améliorations Futures

1. **OAuth2** : Ajoutez Google, Discord, GitHub OAuth
2. **2FA** : Two-factor authentication avec TOTP
3. **Sessions** : Gestion des sessions avec refresh tokens
4. **Audit** : Log des connexions et actions sensibles
5. **Rate Limiting** : Limite de tentatives de connexion
6. **Email Verification** : Vérification de l'email lors de l'inscription

## Ressources

- [JWT.io](https://jwt.io/) - Pour déboguer et vérifier les tokens
- [bcrypt](https://github.com/kelektiv/node-bcrypt) - Documentation bcrypt
- [React Router](https://reactrouter.com/) - Documentation du routage
