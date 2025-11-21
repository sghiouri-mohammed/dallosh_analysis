# Tests Unitaires - Backend

## Résumé des tests unitaires créés

### Backend (7 fichiers de tests)

#### 1. `tasks.service.test.ts` — Tests pour TasksService

- Création, lecture, mise à jour, suppression de tâches
- Gestion RabbitMQ (connexion, publication d'événements)
- Méthodes spéciales (proceedTask, retryStep, handleProcess, restartTask)

#### 2. `tasks.controller.test.ts` — Tests pour TasksController

- Tous les endpoints CRUD
- Validation des paramètres
- Gestion des erreurs

#### 3. `files.service.test.ts` — Tests pour FilesService

- Upload de fichiers
- Téléchargement (datasets, cleaned, analysed)
- Suppression de fichiers
- Création automatique de tâches

#### 4. `auth.middleware.test.ts` — Tests pour le middleware d'authentification

- Validation des tokens JWT
- Gestion des erreurs (token manquant, invalide, expiré)
- Extraction correcte du token depuis le header

#### 5. `base.controller.test.ts` — Tests pour BaseController

- Méthodes `success()` et `error()`
- Gestion centralisée des erreurs
- Codes de statut HTTP

#### 6. `utils.test.ts` — Tests pour les utilitaires

- Génération d'UID
- Signature et vérification de tokens JWT
- Hash et comparaison de mots de passe

#### 7. Tests existants (déjà présents)

- `auth.service.test.ts`
- `users.service.test.ts`
- `database.adapter.test.ts`
- `utils.test.ts` (remplacé par une version plus complète)

### Frontend (2 fichiers de tests)

#### 1. `tasks.service.test.ts` — Tests pour TasksService (frontend)

- Appels API (create, findAll, findOne, update, delete)
- Méthodes spéciales (proceed, retry, handleProcess, restart)
- Gestion des événements RabbitMQ (connexion, callbacks)

#### 2. `files.service.test.ts` — Tests pour FilesService (frontend)

- Upload de fichiers (File et Blob)
- Téléchargement (blob, URL, déclenchement de téléchargement)
- Suppression de fichiers

## Couverture des tests

- **Services backend** : TasksService, FilesService, AuthService, UsersService
- **Contrôleurs backend** : TasksController
- **Middleware** : auth middleware
- **Classes de base** : BaseController
- **Utilitaires** : fonctions utilitaires (JWT, hash, UID)
- **Services frontend** : TasksService, FilesService, AuthService

## Exécution des tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### Avec couverture de code

```bash
# Backend
cd backend
npm run test:coverage

# Frontend
cd frontend
npm run test:coverage
```

## Notes

Les tests utilisent Jest avec des mocks pour isoler les dépendances (base de données, RabbitMQ, système de fichiers, etc.). Ils suivent les patterns existants du projet et couvrent les cas d'usage principaux ainsi que les cas d'erreur.
