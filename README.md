# MotoTrack

Application web de gestion de garage moto   suivi d'entretien, tableau de bord, actualités et météo. Projet personnel réalisé seul.

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
├── suivi-avancement.md
├── supervision-monitoring.md    # Périmètre, indicateurs, sondes, alertes, runbook
├── procedure-incidents.md       # Collecte, qualification, correction, registre
└── politique-dependances.md     # Veille, audit, processus de mise à jour
```

## Supervision

L'endpoint `GET /api/health` interroge réellement la base et renvoie l'état de l'application :

```json
{
  "status": "ok",
  "db": "connected",
  "latencyMs": 38,
  "timestamp": "2026-07-28T09:15:04.221Z",
  "version": "1.3.0",
  "environment": "production",
  "commit": "a265c88",
  "uptimeSeconds": 1042,
  "checks": {
    "database": { "status": "ok", "latencyMs": 38, "thresholdMs": 500 }
  }
}
```

`status` vaut `ok`, `degraded` (base joignable mais latence au-dessus du seuil, réponse 200)
ou `error` (base injoignable, réponse 503).

Trois dispositifs consomment ces indicateurs :

| Dispositif | Fréquence | Signalement |
|---|---|---|
| `.github/workflows/supervision.yml` | 15 min | Issue GitHub `incident` après 3 échecs, refermée au retour à la normale |
| UptimeRobot (sonde externe) | 5 min | Courriel |
| Sentry | Temps réel | Courriel sur erreur serveur |

Les logs structurés (Winston) sont écrits en console ; en développement ils sont aussi
persistés dans `logs/combined.log` et `logs/error.log`. En production, chaque
`logger.error(...)` et `logger.warn(...)` est remonté à Sentry via
`src/lib/sentryTransport.ts`.

Détail complet : `docs/supervision-monitoring.md`.

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute sur chaque push et pull request vers `main` ou `develop` :

1. Lancement d'un service PostgreSQL
2. Installation des dépendances (`npm ci`)
3. Génération du client Prisma + migrations
4. Lint (`next lint`)
5. Audit des dépendances (périmètre production et périmètre complet)
6. Tests unitaires (`jest`)
7. Build de production (`next build`)
8. Tests end-to-end (`playwright`)

La CI est le **seul déployeur** : les jobs `deploy-preview` (sur PR) et `deploy` (sur
`main`) portent `needs: test-and-build`. Aucun code ne peut atteindre la production sans
pipeline vert.
