# MotoTrack

Application web de gestion de garage moto — suivi d'entretien, tableau de bord, actualités et météo. Développée pour le MotoClub Alpes dans le cadre d'un projet Master.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Langage | TypeScript 5 |
| Base de données | PostgreSQL 15 |
| ORM | Prisma 5 |
| Authentification | JWT (jose) + cookies HTTP-only |
| Validation | Zod + React Hook Form |
| UI | Tailwind CSS, Radix UI, FontAwesome |
| 3D | Three.js / React Three Fiber |
| Logging | Winston |
| Tests | Jest + Testing Library |
| CI/CD | GitHub Actions |

## Prérequis

- Node.js 20+
- Docker Desktop (pour PostgreSQL en local)

## Installation

```bash
git clone https://github.com/<org>/MotoTrack.git
cd MotoTrack
npm install
```

## Configuration

Copier `.env.example` et renseigner les variables :

```bash
cp .env.example .env
```

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@localhost:5432/mototrack` |
| `JWT_SECRET` | Secret de signature JWT (min. 32 caractères) | `changeme-32-chars-minimum!!` |
| `LOG_LEVEL` | Niveau de log Winston | `info` |

## Démarrage en développement

```bash
# 1. Lancer la base de données
docker compose up -d

# 2. Appliquer les migrations
npx prisma migrate deploy

# 3. Générer le client Prisma
npx prisma generate

# 4. Démarrer le serveur
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

## Tests

```bash
# Tests unitaires
npm run test

# Tests e2e (Playwright)
npm run test:e2e
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | Lint ESLint |
| `npm run test` | Tests unitaires Jest |
| `npm run test:e2e` | Tests end-to-end Playwright |
| `npm run prisma:migrate` | Créer une migration |
| `npm run prisma:generate` | Régénérer le client Prisma |

## Structure du projet

```
src/
├── app/
│   ├── (auth)/           # Pages login / register
│   ├── api/              # API Routes Next.js
│   │   ├── auth/
│   │   ├── motorcycles/
│   │   ├── maintenances/
│   │   ├── motorcycle-models/
│   │   ├── news/
│   │   └── health/
│   ├── dashboard/        # Tableau de bord
│   ├── garage/           # Gestion des motos
│   ├── maintenance/      # Historique d'entretien
│   ├── news/             # Actualités moto
│   ├── pieces/           # Recherche de pièces
│   └── weather/          # Météo
├── components/
│   ├── 3d/               # Scène Three.js
│   ├── layout/           # AppLayout
│   └── ui/               # Composants Radix/shadcn
├── lib/
│   ├── auth.ts           # JWT (signToken, verifyAuth)
│   ├── formatPlate.ts    # Utilitaire format plaque SIV
│   ├── logger.ts         # Logger Winston
│   ├── prisma.ts         # Instance Prisma
│   └── utils.ts
├── middleware.ts          # Protection des routes
prisma/
├── schema.prisma
└── migrations/
tests/
└── unit/
docs/
├── acteurs.md
├── planning.md
├── charge-travail.md
├── cahier-recettes.md
└── suivi-avancement.md
```

## Supervision

L'endpoint `GET /api/health` retourne l'état de l'application et la latence DB :

```json
{
  "status": "ok",
  "db": "connected",
  "latencyMs": 4,
  "timestamp": "2026-04-21T10:00:00.000Z",
  "version": "1.0.0"
}
```

Les logs structurés (Winston) sont écrits en console. En développement, ils sont également persistés dans `logs/combined.log` et `logs/error.log`.

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute sur chaque push et pull request vers `main` ou `develop` :

1. Lancement d'un service PostgreSQL
2. Installation des dépendances (`npm ci`)
3. Génération du client Prisma + migrations
4. Lint (`next lint`)
5. Tests unitaires (`jest`)
6. Build de production (`next build`)
