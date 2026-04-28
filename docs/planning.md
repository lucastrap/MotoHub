# Planning projet — MotoHub Pro

## Cadre général

| Champ | Valeur |
|---|---|
| Client | MotoClub Alpes — Lyon |
| Durée totale | 6 semaines |
| Début | 10 mars 2026 |
| Fin | 21 avril 2026 |
| Soutenance | 28 avril 2026 |
| Méthodologie | Agile Scrum — sprints d'1 semaine |
| Outil de suivi | GitHub Projects |
| Réunion commanditaire | Vendredi à 14h — Sophie Arnaud (MotoClub Alpes) |

---

## Équipe

| Membre | Rôle | Disponibilité |
|---|---|---|
| Luca Straputicari | Chef de projet & Fullstack lead | 100% |
| Thomas Renard | Backend | 100% |
| Sarah Morel | Frontend | 100% |
| Karim Benali | Design UX/UI | 50% (mission parallèle) |
| Julie Fontaine | QA | 30% (dernière semaine à 100%) |

---

## Sprint 0 — Semaine 0 (3 – 9 mars) : Cadrage

| Tâche | Responsable | Statut |
|---|---|---|
| Entretien commanditaire — recueil du besoin | Luca + Sophie Arnaud | Terminé |
| Définition du périmètre fonctionnel | Luca | Terminé |
| Choix de la stack technique | Luca + Thomas | Terminé |
| Maquettes Figma v1 (wireframes) | Karim | Terminé |
| Validation des maquettes par le client | Marc Duvalier | Terminé |

---

## Sprint 1 — Semaine 1 (10 – 14 mars) : Initialisation technique

| Tâche | Responsable | Statut |
|---|---|---|
| Setup projet Next.js 14 + TypeScript | Thomas | Terminé |
| Configuration Docker + PostgreSQL | Thomas | Terminé |
| Schéma Prisma + migration initiale | Thomas | Terminé |
| Authentification JWT (register, login, logout) | Thomas | Terminé |
| Middleware de protection des routes | Luca | Terminé |

**Sprint review (14 mars)** : Démo de l'auth devant Sophie Arnaud. Validé.

---

## Sprint 2 — Semaine 2 (17 – 21 mars) : Core métier

| Tâche | Responsable | Statut |
|---|---|---|
| API motorcycles (GET/POST) | Thomas | Terminé |
| API maintenances (GET/POST) | Thomas | Terminé |
| Module Garage — liste des motos | Sarah | Terminé |
| Module Entretien — ajout et historique | Sarah | Terminé |
| Tableau de bord v1 | Sarah | Terminé |

**Sprint review (21 mars)** : Démo garage + entretien. Demande client : ajouter la météo.

---

## Sprint 3 — Semaine 3 (24 – 28 mars) : Fonctionnalités avancées

| Tâche | Responsable | Statut |
|---|---|---|
| Wizard multi-étapes ajout moto | Luca | Terminé |
| Validation modèle via NHTSA + autocomplete | Luca | Terminé |
| Format automatique immatriculation SIV | Luca | Terminé |
| Module Actualités (Google News RSS) | Sarah | Terminé |
| Module Pièces & achats | Sarah | Terminé |
| Page météo | Sarah | Terminé |

**Sprint review (28 mars)** : Validé par Sophie Arnaud. Demande client : UI plus premium.

---

## Sprint 4 — Semaine 4 (31 mars – 4 avril) : Design & 3D

| Tâche | Responsable | Statut |
|---|---|---|
| Système de design dark premium (Tailwind, Barlow Condensed) | Karim + Sarah | Terminé |
| Refonte complète du frontend | Sarah | Terminé |
| Scène 3D accueil (Three.js / React Three Fiber) | Luca | Terminé |
| Modèle GLB Ducati Panigale V4R | Luca | Terminé |
| PWA (next-pwa) | Thomas | Terminé |

**Sprint review (4 avril)** : Très apprécié par Marc Duvalier. Validé.

---

## Sprint 5 — Semaine 5 (7 – 11 avril) : Consolidation

| Tâche | Responsable | Statut |
|---|---|---|
| Sélection moto principale (isPrimary) | Thomas + Luca | Terminé |
| Tableau de bord v2 — vraies données | Luca + Sarah | Terminé |
| Filtre par moto dans l'historique | Sarah | Terminé |
| Tests unitaires Jest | Julie + Luca | Terminé |
| CI/CD GitHub Actions | Thomas | Terminé |

**Sprint review (11 avril)** : Démo feature-complete. Go pour la documentation.

---

## Sprint 6 — Semaine 6 (14 – 21 avril) : Documentation & livraison

| Tâche | Responsable | Statut |
|---|---|---|
| Cahier de recettes (15 scénarios) | Julie | Terminé |
| Exécution des tests de recette | Julie | Terminé |
| Schéma d'architecture | Luca | Terminé |
| Documentation technique | Luca + Thomas | Terminé |
| Logging Winston + endpoint /api/health | Thomas | Terminé |
| CHANGELOG | Luca | Terminé |
| Préparation soutenance | Luca | En cours |

---

## Jalons clés

| Jalon | Date cible | Date réelle | Statut |
|---|---|---|---|
| Validation maquettes | 9 mars 2026 | 9 mars 2026 | Atteint |
| Prototype auth + garage navigable | 21 mars 2026 | 21 mars 2026 | Atteint |
| Version feature-complete | 11 avril 2026 | 11 avril 2026 | Atteint |
| Documentation complète | 21 avril 2026 | 21 avril 2026 | Atteint |
| Soutenance | 28 avril 2026 | — | A venir |
