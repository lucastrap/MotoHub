# Planning projet — MotoTrack

## Cadre général

| Champ | Valeur |
|---|---|
| Origine | Projet personnel — besoin issu d'une analyse de marché, pas d'une commande client |
| Réalisation | Solo (Luca Straputicari) |
| Durée totale | 6 semaines |
| Début | 10 mars 2026 |
| Fin | 21 avril 2026 |
| Méthodologie | Itérative, inspirée de Kanban — incréments d'environ une semaine |
| Outil de suivi | GitHub (Issues, Pull Requests, branches) |
| Validation | Auto-validation outillée : CI bloquante + revue de PR avec checklist |

## Note sur la méthode

Le projet étant mené seul, il n'y a ni sprint planning collectif, ni sprint review devant
un commanditaire, ni rétrospective d'équipe. Les cérémonies Scrum n'ont pas été singées :
le découpage est resté celui d'un Kanban personnel — un incrément par branche, une Pull
Request par incrément, fusion conditionnée à une CI verte.

Le point de contrôle qui remplace la revue d'équipe est la **Pull Request** : elle force
un point d'arrêt avant `main`, exécute la CI et la preview, et laisse une trace écrite de
l'intention. C'est le filet de sécurité du développeur unique.

---

## Incrément 1 — Semaine 1 (10 – 14 mars) : Initialisation technique

| Tâche | Statut |
|---|---|
| Setup projet Next.js 14 + TypeScript | Terminé |
| Configuration Docker + PostgreSQL | Terminé |
| Schéma Prisma + migration initiale | Terminé |
| Authentification JWT (register, login, logout) | Terminé |
| Middleware de protection des routes | Terminé |

---

## Incrément 2 — Semaine 2 (17 – 21 mars) : Core métier

| Tâche | Statut |
|---|---|
| API motorcycles (GET/POST) | Terminé |
| API maintenances (GET/POST) | Terminé |
| Module Garage — liste des motos | Terminé |
| Module Entretien — ajout et historique | Terminé |
| Tableau de bord v1 | Terminé |

---

## Incrément 3 — Semaine 3 (24 – 28 mars) : Fonctionnalités avancées

| Tâche | Statut |
|---|---|
| Wizard multi-étapes ajout moto | Terminé |
| Validation modèle via NHTSA + autocomplete | Terminé |
| Format automatique immatriculation SIV | Terminé |
| Module Actualités (Google News RSS) | Terminé |
| Module Pièces & achats | Terminé |
| Page météo | Terminé |

---

## Incrément 4 — Semaine 4 (31 mars – 4 avril) : Design & 3D

| Tâche | Statut |
|---|---|
| Système de design dark premium (Tailwind, Barlow Condensed) | Terminé |
| Refonte du frontend | Terminé |
| Scène 3D accueil (Three.js / React Three Fiber) | Terminé |
| Modèle GLB Ducati Panigale V4R | Terminé |
| PWA (next-pwa) | Terminé |

---

## Incrément 5 — Semaine 5 (7 – 11 avril) : Consolidation

| Tâche | Statut |
|---|---|
| Sélection moto principale (isPrimary) | Terminé |
| Tableau de bord v2 — vraies données | Terminé |
| Filtre par moto dans l'historique | Terminé |
| Harnais de tests unitaires (Jest) | Terminé |
| CI/CD GitHub Actions | Terminé |

---

## Incrément 6 — Semaine 6 (14 – 21 avril) : Documentation & livraison

| Tâche | Statut |
|---|---|
| Cahier de recettes (17 scénarios) | Terminé |
| Exécution des tests de recette | Terminé |
| Schéma d'architecture | Terminé |
| Documentation technique | Terminé |
| Logging Winston + endpoint /api/health | Terminé |
| CHANGELOG | Terminé |

---

## Jalons clés

| Jalon | Date cible | Date réelle | Statut |
|---|---|---|---|
| Prototype auth + garage navigable | 21 mars 2026 | 21 mars 2026 | Atteint |
| Version feature-complete | 11 avril 2026 | 11 avril 2026 | Atteint |
| Documentation complète | 21 avril 2026 | 21 avril 2026 | Atteint |

## Évolutions postérieures à la v1.0.0

Le projet a continué d'évoluer après la livraison de la version 1.0.0, ce que trace
l'historique Git :

| Évolution | Branche |
|---|---|
| Localisation française des pages d'authentification | `feature/i18n-fr` |
| Supervision Core Web Vitals (RUM) | `feature/monitoring-web-vitals` |
| Migration de la base de production vers Supabase (pooler + directUrl) | `chore/supabase-config` |
| Correction du prérendu : `useSearchParams` encapsulé dans une frontière Suspense | `fix/maintenance-suspense-boundary` |
