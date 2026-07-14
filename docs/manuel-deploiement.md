# Manuel de déploiement — MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version | 1.0.0 |
| Public visé | Équipe technique / administrateur système |
| Date | 21 avril 2026 |

## 1. Architecture cible

| Couche | Technologie | Hébergement |
|---|---|---|
| Application | Next.js 14 (App Router, SSR + API Routes) | Vercel |
| Base de données | PostgreSQL 15 | Neon (managé) en production, Docker en local |
| ORM / migrations | Prisma 5 | — |
| CI/CD | GitHub Actions | GitHub |

## 2. Prérequis

- **Node.js 20+** et **npm 10+**
- **Docker Desktop** (base de données locale)
- Un compte **Vercel** et un compte **Neon** (ou toute base PostgreSQL managée) pour la production
- Accès au dépôt GitHub du projet

## 3. Variables d'environnement

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL | `postgresql://user:pass@host:5432/mototrack?schema=public` |
| `JWT_SECRET` | Secret de signature JWT (≥ 32 caractères) | `changeme-32-chars-minimum!!` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `https://mototrack.vercel.app` |
| `LOG_LEVEL` | Niveau de journalisation Winston (optionnel) | `info` |

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

1. Créer la base de production sur Neon, récupérer sa `DATABASE_URL`.
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
