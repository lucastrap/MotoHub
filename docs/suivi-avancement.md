# Suivi d'avancement — MotoHub Pro

## Indicateurs clés (KPI)

| Indicateur | Cible | Actuel |
|---|---|---|
| Fonctionnalités livrées / planifiées | 100% | 100% |
| Tests unitaires passants | 100% | 100% |
| Build CI sans erreur | OUI | OUI |
| Satisfaction commanditaire (sprint reviews) | ≥ 4/5 | 4,5/5 |
| Anomalies bloquantes résolues | 100% | 100% |
| Respect du planning | ≤ +20% écart | +6,5 j (+33%) sur dev |

---

## Avancement par sprint

### Sprint 0 — Cadrage (3 – 9 mars)

| Tâche | Responsable | Statut | Commentaire |
|---|---|---|---|
| Entretien commanditaire | Luca | Terminé | 2h avec Marc Duvalier et Sophie Arnaud |
| Maquettes Figma v1 | Karim | Terminé | 3 itérations avant validation |
| Choix stack | Luca + Thomas | Terminé | Next.js 14 retenu vs NestJS + React séparé |

### Sprint 1 — Initialisation (10 – 14 mars)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| Setup Next.js + Docker + Prisma | Thomas | 1 j | 1 j | Terminé |
| Schéma DB + migration | Thomas | 0,5 j | 1 j | Terminé |
| Authentification JWT | Thomas | 1 j | 1,5 j | Terminé |
| Middleware routes | Luca | 0,5 j | 0,5 j | Terminé |

### Sprint 2 — Core métier (17 – 21 mars)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| API motorcycles + maintenances | Thomas | 1 j | 1,5 j | Terminé |
| Module Garage | Sarah | 1 j | 1 j | Terminé |
| Module Entretien | Sarah | 1 j | 1,5 j | Terminé |
| Dashboard v1 | Sarah | 0,5 j | 1 j | Terminé |

### Sprint 3 — Fonctionnalités avancées (24 – 28 mars)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| Wizard ajout moto | Luca | 1 j | 2 j | Terminé |
| NHTSA + autocomplete | Luca | 0,5 j | 0,5 j | Terminé |
| Actualités RSS | Sarah | 0,5 j | 1 j | Terminé |
| Module Pièces | Sarah | 0,5 j | 1 j | Terminé |

### Sprint 4 — Design & 3D (31 mars – 4 avril)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| Design dark premium | Karim + Sarah | 1,5 j | 2 j | Terminé |
| Scène 3D Three.js | Luca | 1 j | 2 j | Terminé |

### Sprint 5 — Consolidation (7 – 11 avril)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| isPrimary + dashboard v2 | Luca + Sarah | 1 j | 1,5 j | Terminé |
| Tests unitaires | Julie + Luca | 1 j | 1 j | Terminé |
| CI/CD | Thomas | 0,5 j | 0,5 j | Terminé |

### Sprint 6 — Documentation (14 – 21 avril)

| Tâche | Responsable | Estimé | Réel | Statut |
|---|---|---|---|---|
| Cahier de recettes | Julie | 1 j | 1 j | Terminé |
| Documentation + CHANGELOG | Luca | 0,5 j | 0,5 j | Terminé |
| Monitoring Winston + health | Thomas | 0,5 j | 0,5 j | Terminé |

---

## Journal des anomalies

| # | Date | Détecté par | Description | Criticité | Résolution |
|---|---|---|---|---|---|
| A-01 | 15 mars | Thomas | `npm install` ERESOLVE — conflit @react-three/drei v10 avec React 18 | Bloquante | Downgrade drei → v9.109.0 et fiber → v8.17.0 |
| A-02 | 17 mars | Thomas | Docker Desktop non démarré — connexion DB impossible | Bloquante | Lancement manuel de Docker Desktop |
| A-03 | 20 mars | Julie | Inscription échouait — migration Prisma non appliquée en local | Bloquante | `npx prisma migrate deploy` |
| A-04 | 25 mars | Luca | `useGLTF` dans try/catch — hook React invalide | Moyenne | Refactoring du composant MotorcycleScene |
| A-05 | 1 avril | Sarah | HDR environment map introuvable (fetch réseau échoue) | Mineure | Suppression du preset `city`, éclairage manuel |
| A-06 | 5 avril | Julie | Zod schema — champs vides envoyés comme `""` causaient 400 | Bloquante | `.preprocess()` et `.transform()` sur les champs optionnels |
| A-07 | 10 avril | Thomas | `prisma generate` EPERM — DLL verrouillée par le serveur dev | Moyenne | Arrêt du serveur dev avant `generate` |

---

## Décisions techniques

| Date | Décision | Alternatives écartées | Justification |
|---|---|---|---|
| 9 mars | Next.js 14 App Router | NestJS + React séparé | SSR + API Routes dans un seul projet, moins d'infra |
| 9 mars | Prisma ORM | TypeORM, Drizzle | Typage TypeScript natif, migrations versionées, DX supérieure |
| 9 mars | PostgreSQL via Docker | MySQL, SQLite | Robustesse, support JSON, recherche full-text future |
| 15 mars | jose (JWT) | jsonwebtoken | Compatible Edge Runtime Next.js — jsonwebtoken ne l'est pas |
| 24 mars | Google News RSS | NewsAPI (payante) | Gratuit, sans quota, flux FR disponibles |
| 31 mars | GLB Ducati Panigale V4R (open source) | Modèle payant Sketchfab | Libre de droits, haute qualité, 7.8 MB |
| 7 avril | isPrimary sur Motorcycle | Table séparée UserPreferences | Plus simple, une moto principale suffit pour le besoin actuel |

---

## Compte rendu sprint reviews

| Sprint | Date | Participants | Résultat | Demandes client |
|---|---|---|---|---|
| Sprint 1 | 14 mars | Marc D., Sophie A., Luca | Validé ✓ | Aucune |
| Sprint 2 | 21 mars | Sophie A., Luca, Sarah | Validé ✓ | Ajouter la météo |
| Sprint 3 | 28 mars | Sophie A., Luca | Validé ✓ | UI plus premium |
| Sprint 4 | 4 avril | Marc D., Sophie A., toute l'équipe | Validé ✓ — très apprécié | Moto principale sur dashboard |
| Sprint 5 | 11 avril | Sophie A., Julie, Luca | Validé ✓ | Aucune — go documentation |
