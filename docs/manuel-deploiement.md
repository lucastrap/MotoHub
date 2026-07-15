# Manuel de déploiement — MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version | 1.0.0 |
| Public visé | Mainteneur / administrateur système (développeur reprenant le projet) |
| Date | 21 avril 2026 |

## 1. Architecture cible

| Couche | Technologie | Hébergement |
|---|---|---|
| Application | Next.js 14 (App Router, SSR + API Routes) | Vercel |
| Base de données | PostgreSQL 15 | Supabase (managé) en production, Docker en local |
| ORM / migrations | Prisma 5 | — |
| CI/CD | GitHub Actions | GitHub |

## 2. Prérequis

- **Node.js 20+** et **npm 10+**
- **Docker Desktop** (base de données locale)
- Un compte **Vercel** et un compte **Supabase** (ou toute base PostgreSQL managée) pour la production
- Accès au dépôt GitHub du projet

## 3. Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL. En production Supabase : URL **pooler** (PgBouncer), compatible serverless | `postgresql://user:pass@host:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Connexion **directe**, utilisée par Prisma Migrate uniquement (le pooler ne supporte pas les migrations) | `postgresql://user:pass@host:5432/postgres` |
| `JWT_SECRET` | Secret de signature JWT (≥ 32 caractères) | `changeme-32-chars-minimum!!` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `https://mototrack.vercel.app` |
| `LOG_LEVEL` | Niveau de journalisation Winston (optionnel) | `info` |

> ℹ️ `DIRECT_URL` n'est requise que sur la configuration Supabase, portée par la branche
> `chore/supabase-config` (voir §8). Sur `main`, `schema.prisma` ne déclare que `url`.

> ⚠️ Le fichier `.env` est exclu du versionnement (`.gitignore`). Les secrets de production
> sont stockés dans **Vercel → Settings → Environment Variables**.

## 4. Déploiement local (développement)

```bash
# 1. Cloner le dépôt
git clone https://github.com/<org>/MotoTrack.git
cd MotoTrack

# 2. Installer les dépendances (installation reproductible)
npm ci

# 3. Démarrer la base de données PostgreSQL + Adminer
docker compose up -d          # Postgres sur :5432, Adminer sur :8080

# 4. Créer le fichier .env (voir section 3)

# 5. Appliquer les migrations et générer le client Prisma
npx prisma migrate deploy
npx prisma generate

# 6. Lancer le serveur de développement
npm run dev                   # http://localhost:3000
```

## 5. Déploiement de production (Vercel)

Le déploiement est **automatisé** par le pipeline GitHub Actions (`.github/workflows/ci.yml`).

### 5.1 Séquence de déploiement continu

```
push/PR sur main ──▶ Job « test-and-build »
                     ├─ Service PostgreSQL éphémère
                     ├─ npm ci
                     ├─ prisma generate + migrate deploy
                     ├─ next lint
                     ├─ jest (tests unitaires + couverture)
                     ├─ next build
                     └─ playwright test (e2e)
                         │
                         ▼ (uniquement si push sur main ET job précédent OK)
                     Job « deploy »
                     └─ vercel --prod
```

### 5.2 Configuration initiale (une seule fois)

1. Créer la base de production sur Supabase, récupérer l'URL pooler (`DATABASE_URL`) et
   l'URL directe (`DIRECT_URL`) depuis **Project Settings → Database → Connection string**.
2. Lier le projet à Vercel :
   ```bash
   npm install -g vercel
   vercel link
   ```
3. Renseigner dans **GitHub → Settings → Secrets and variables → Actions** :
   - `VERCEL_TOKEN` (Vercel → Settings → Tokens)
   - `VERCEL_ORG_ID` et `VERCEL_PROJECT_ID` (depuis `.vercel/project.json`)
4. Renseigner les variables d'environnement dans Vercel (`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`).
5. Appliquer les migrations sur la base de production :
   ```bash
   DATABASE_URL="<url_prod>" npx prisma migrate deploy
   ```

### 5.3 Déploiement

Tout `push` sur `main` déclenche automatiquement les tests puis, s'ils réussissent, le
déploiement en production. Aucune action manuelle n'est requise.

## 6. Vérification post-déploiement

```bash
# Sonde de santé applicative
curl https://<domaine>/api/health
# Réponse attendue : { "status": "ok", "db": "connected", "latencyMs": <100 }
```

- Vérifier l'affichage de la page d'accueil et la connexion.
- Consulter les logs dans **Vercel → Deployments → Runtime Logs**.

## 7. Rollback

En cas d'anomalie critique en production :

1. **Vercel → Deployments** → sélectionner le dernier déploiement stable → **Promote to Production**.
2. Si une migration de base est en cause, restaurer via une migration Prisma corrective
   (voir `manuel-mise-a-jour.md`, section migrations).

## 8. État réel des branches (à jour au 15 juillet 2026)

Ce manuel décrit l'architecture cible. Toutes les évolutions ne sont pas encore fusionnées
dans `main` — un mainteneur qui clone le dépôt doit le savoir avant de déployer :

| Évolution | Branche | Fusionnée dans `main` ? |
|---|---|---|
| Correction du prérendu (frontière Suspense) | `fix/maintenance-suspense-boundary` | ✅ oui (PR #6) |
| Localisation française des pages d'authentification | `feature/i18n-fr` | ❌ non — présente sur `develop` |
| Supervision Core Web Vitals (RUM) | `feature/monitoring-web-vitals` | ❌ non — ni sur `main`, ni sur `develop` |
| Configuration Supabase (pooler + `directUrl`) | `chore/supabase-config` | ❌ non — ni sur `main`, ni sur `develop` |

**Conséquence directe :** en l'état, un déploiement depuis `main` produit une application
sans localisation FR, sans collecte Web Vitals, et dont `schema.prisma` ne déclare pas
`directUrl` — donc `prisma migrate deploy` échouera contre l'URL pooler de Supabase. La
séquence de reprise est de fusionner `chore/supabase-config` **avant** toute migration en
production.
