# Suivi d'avancement   MotoTrack

Projet réalisé seul. Le suivi ci-dessous est un journal de bord personnel, tenu au fil des
incréments : il n'y a ni reporting à un commanditaire, ni validation par un tiers.

## Indicateurs clés (KPI)

| Indicateur | Cible | Actuel |
|---|---|---|
| Fonctionnalités livrées / planifiées | 100% | 100% |
| Tests unitaires passants | 100% | 100% |
| Build CI sans erreur | OUI | OUI |
| Anomalies bloquantes résolues | 100% | 100% |
| Respect du planning | ≤ +20% écart | +6,5 j (+33%) sur le total, +44% sur le dev |

> L'indicateur « respect du planning » est **hors cible** et le reste : l'écart n'a pas été
> rattrapé, il a été absorbé. Voir l'analyse dans `charge-travail.md`.

---

## Avancement par incrément

### Incrément 1   Initialisation (10 – 14 mars)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| Setup Next.js + Docker + Prisma | 1 j | 1 j | Terminé |
| Schéma DB + migration | 0,5 j | 1 j | Terminé |
| Authentification JWT | 1 j | 1,5 j | Terminé |
| Middleware routes | 0,5 j | 0,5 j | Terminé |

### Incrément 2   Core métier (17 – 21 mars)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| API motorcycles + maintenances | 1 j | 1,5 j | Terminé |
| Module Garage | 1 j | 1 j | Terminé |
| Module Entretien | 1 j | 1,5 j | Terminé |
| Dashboard v1 | 0,5 j | 1 j | Terminé |

### Incrément 3   Fonctionnalités avancées (24 – 28 mars)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| Wizard ajout moto | 1 j | 2 j | Terminé |
| NHTSA + autocomplete | 0,5 j | 0,5 j | Terminé |
| Actualités RSS | 0,5 j | 1 j | Terminé |
| Module Pièces | 0,5 j | 1 j | Terminé |

### Incrément 4   Design & 3D (31 mars – 4 avril)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| Design dark premium | 1,5 j | 2 j | Terminé |
| Scène 3D Three.js | 1 j | 2 j | Terminé |

### Incrément 5   Consolidation (7 – 11 avril)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| isPrimary + dashboard v2 | 1 j | 1,5 j | Terminé |
| Harnais de tests unitaires | 1 j | 1 j | Terminé |
| CI/CD | 0,5 j | 0,5 j | Terminé |

### Incrément 6   Documentation (14 – 21 avril)

| Tâche | Estimé | Réel | Statut |
|---|---|---|---|
| Cahier de recettes | 1 j | 1 j | Terminé |
| Documentation + CHANGELOG | 0,5 j | 0,5 j | Terminé |
| Monitoring Winston + health | 0,5 j | 0,5 j | Terminé |

---

## Journal des anomalies

Anomalies rencontrées en cours de développement, toutes détectées par moi-même   via
l'outillage (build, typage, lint) ou en exécutant l'application. C'est précisément le point
faible du travail en solo : aucune de ces anomalies n'a été trouvée par un regard extérieur.

| # | Date | Détecté par | Description | Criticité | Résolution |
|---|---|---|---|---|---|
| A-01 | 15 mars | `npm install` | ERESOLVE   conflit @react-three/drei v10 avec React 18 | Bloquante | Downgrade drei → v9.109.0 et fiber → v8.17.0 |
| A-02 | 17 mars | Exécution locale | Docker Desktop non démarré   connexion DB impossible | Bloquante | Lancement manuel de Docker Desktop |
| A-03 | 20 mars | Test manuel de l'inscription | Inscription échouait   migration Prisma non appliquée en local | Bloquante | `npx prisma migrate deploy` |
| A-04 | 25 mars | Erreur runtime React | `useGLTF` dans try/catch   hook React invalide | Moyenne | Refactoring du composant MotorcycleScene |
| A-05 | 1 avril | Console navigateur | HDR environment map introuvable (fetch réseau échoue) | Mineure | Suppression du preset `city`, éclairage manuel |
| A-06 | 5 avril | Test manuel du formulaire | Zod schema   champs vides envoyés comme `""` causaient 400 | Bloquante | `.preprocess()` et `.transform()` sur les champs optionnels |
| A-07 | 10 avril | `prisma generate` | EPERM   DLL verrouillée par le serveur dev | Moyenne | Arrêt du serveur dev avant `generate` |

---

## Décisions techniques

| Date | Décision | Alternatives écartées | Justification |
|---|---|---|---|
| 9 mars | Next.js 14 App Router | NestJS + React séparé | SSR + API Routes dans un seul projet, moins d'infra |
| 9 mars | Prisma ORM | TypeORM, Drizzle | Typage TypeScript natif, migrations versionnées, DX supérieure |
| 9 mars | PostgreSQL via Docker | MySQL, SQLite | Robustesse, support JSON, recherche full-text future |
| 15 mars | jose (JWT) | jsonwebtoken | Compatible Edge Runtime Next.js   jsonwebtoken ne l'est pas |
| 24 mars | Google News RSS | NewsAPI (payante) | Gratuit, sans quota, flux FR disponibles |
| 31 mars | GLB Ducati Panigale V4R (open source) | Modèle payant Sketchfab | Libre de droits, haute qualité, 7.8 MB |
| 7 avril | isPrimary sur Motorcycle | Table séparée UserPreferences | Plus simple, une moto principale suffit pour le besoin actuel |

Ces décisions ont été prises seul. Aucune n'a été confrontée à un pair avant d'être
appliquée   c'est la limite assumée du dispositif, partiellement compensée par la trace
écrite (ce tableau) qui permet de les rejuger a posteriori.
