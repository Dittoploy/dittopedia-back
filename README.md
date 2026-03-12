# Dittopedia - Backend

Backend API de Dittopedia construit avec **NestJS** et **Prisma**.

## Description

Ce service fournit l'API REST pour la plateforme Dittopedia. Il gère l'authentification, les utilisateurs, et l'accès aux données via une base de données PostgreSQL.

## Prérequis

- Node.js (v18+)
- Bun (package manager)
- PostgreSQL (pour la base de données)

## Installation

```bash
bun install
```

## Commandes utiles

### Développement

| Commande | Description |
|----------|-------------|
| `bun run dev` | Démarre le serveur en mode développement avec rechargement automatique |
| `bun run dev:debug` | Démarre en mode debug avec inspection Node.js activée |
| `bun run build` | Compile le code TypeScript en JavaScript |
| `bun run start` | Démarre le serveur compilé (production) |

### Linting et Format

| Commande | Description |
|----------|-------------|
| `bun run lint` | Vérifie le code avec ESLint |
| `bun run lint:fix` | Corrige automatiquement les erreurs ESLint |
| `bun run format` | Formate le code avec Prettier |

### Tests

| Commande | Description |
|----------|-------------|
| `bun run test` | Exécute les tests unitaires |
| `bun run test:watch` | Exécute les tests en mode watch |
| `bun run test:cov` | Génère un rapport de couverture de code |
| `bun run test:debug` | Exécute les tests en mode debug |
| `bun run test:e2e` | Exécute les tests d'intégration |

### Base de données (Prisma)

| Commande | Description |
|----------|-------------|
| `bun run prisma:generate` | Génère le client Prisma basé sur le schéma |
| `bun run prisma:migrate` | Crée et applique une nouvelle migration |
| `bun run prisma:studio` | Ouvre Prisma Studio pour explorer les données (interface web) |
| `bun run prisma:seed` | Exécute le script de seed pour initialiser les données |

## Démarrage rapide

```bash
# 1. Installer les dépendances
bun install

# 2. Configurer les variables d'environnement
# Créer un fichier .env avec DATABASE_URL, etc.

# 3. Générer le client Prisma
bun run prisma:generate

# 4. Appliquer les migrations
bun run prisma:migrate

# 5. Démarrer le serveur
bun run dev
```

## Architecture

```
src/
├── main.ts              # Point d'entrée
├── app.module.ts        # Module principal
├── app.controller.ts    # Routes principales
├── app.service.ts       # Logique métier
├── prisma/              # Configuration Prisma
└── users/               # Module utilisateurs
```

## Notes importantes

### Base de données
- Le schéma Prisma est défini dans `prisma/schema.prisma`
- Les migrations sont stockées dans `prisma/migrations/`
- Toujours exécuter les migrations avant de démarrer : `bun run prisma:migrate`
- Utiliser `prisma:studio` pour explorer la base de données en GUI

### Tests d'intégration (E2E)
- Les tests E2E utilisent une base de données SQLite isolée (`test.db`) configurée via `.env.test`
- PrismaService est configuré pour **ignorer les connexions automatiques en mode test** (NODE_ENV=test)
- Le fichier `test/setup-e2e.ts` charge `.env.test` avant chaque test
- Prisma est mockifié dans la configuration Jest (`test/__mocks__/prisma.mock.ts`) pour éviter les erreurs d'import ESM
- **Les tests E2E s'exécutent sans nécessiter une base de données PostgreSQL externe**
- Configuration Jest: `test/jest-e2e.json` avec support ESM et moduleNameMapper pour le mock Prisma

### Code
- TypeScript utilisé (mode strict recommandable via `tsconfig.json`)
- ESLint et Prettier configurés pour le formatage
- Tous les fichiers doivent être formatés avant de commit
- Objectif : maintenir une bonne couverture de tests (voir `bun run test:cov`)

### Développement
- Utiliser `bun run dev` pour le développement (rechargement chaud activé)
- Ne pas commiter le dossier `dist/` ou `node_modules/`
- Les variables d'environnement sont requises (voir `.env.example` s'il existe)

## License

UNLICENSED
