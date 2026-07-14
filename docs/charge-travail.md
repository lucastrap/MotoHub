# Estimation de la charge de travail — MotoTrack

## Méthode

Estimation en jours/homme (1 j/h = 7h de travail effectif).  
Projet réalisé par une équipe de 5 personnes sur 6 semaines.  
Chiffrage initial réalisé lors du sprint 0 en présence du commanditaire.

## Répartition par membre

| Membre | Rôle | Charge totale |
|---|---|---|
| Luca Straputicari | Chef de projet & Fullstack lead | 12 j/h |
| Thomas Renard | Backend | 5 j/h |
| Sarah Morel | Frontend | 6 j/h |
| Karim Benali | Design UX/UI | 3 j/h |
| Julie Fontaine | QA | 2 j/h |
| **Total équipe** | | **28 j/h** |

---

## Détail par module

### BLOC 1 — Cadrage et architecture

| Tâche | Responsable | Estimé | Réel |
|---|---|---|---|
| Analyse du besoin (entretien commanditaire) | Luca + Sophie Arnaud | 0,5 j | 0,5 j |
| Choix de la stack technique | Luca + Thomas | 0,5 j | 0,5 j |
| Maquettes Figma (dark theme, wireframes) | Karim | 1,5 j | 2 j |
| Modélisation schéma de base de données | Thomas | 0,5 j | 1 j |
| Schéma d'architecture (tiers) | Luca | 0,5 j | 0,5 j |
| **Sous-total** | | **3,5 j** | **4,5 j** |

### BLOC 2 — Développement

| Tâche | Responsable | Estimé | Réel |
|---|---|---|---|
| Mise en place projet (Next.js, Docker, Prisma) | Thomas | 1 j | 1 j |
| Authentification (register, login, JWT, middleware) | Thomas | 1 j | 1,5 j |
| API motorcycles + maintenances | Thomas | 1 j | 1,5 j |
| Wizard ajout moto (validation Zod, NHTSA, format plaque) | Luca | 2 j | 3 j |
| Module Entretien — formulaire + historique | Sarah | 1,5 j | 2 j |
| Tableau de bord — données réelles + échéances | Sarah + Luca | 1 j | 1,5 j |
| Module Actualités (Google News RSS) | Sarah | 0,5 j | 1 j |
| Module Pièces & achats | Sarah | 0,5 j | 1 j |
| Scène 3D accueil (Three.js / R3F) | Luca | 1 j | 2 j |
| Design dark premium (Tailwind, animations) | Karim + Sarah | 1,5 j | 2 j |
| Intégration API NHTSA (cache 24h) | Thomas | 0,5 j | 0,5 j |
| Tests unitaires (Jest) | Julie + Luca | 1 j | 1 j |
| **Sous-total** | | **12,5 j** | **18 j** |

### BLOC 3 — Gestion de projet

| Tâche | Responsable | Estimé | Réel |
|---|---|---|---|
| Sprint planning et rétrospectives | Luca | 1 j | 1 j |
| Reporting commanditaire (sprint reviews) | Luca | 0,5 j | 0,5 j |
| **Sous-total** | | **1,5 j** | **1,5 j** |

### BLOC 4 — Maintenance et documentation

| Tâche | Responsable | Estimé | Réel |
|---|---|---|---|
| CI/CD GitHub Actions | Thomas | 0,5 j | 0,5 j |
| Logging Winston + endpoint /api/health | Thomas | 0,5 j | 0,5 j |
| Rédaction cahier de recettes | Julie | 1 j | 1 j |
| Documentation technique + CHANGELOG | Luca | 0,5 j | 0,5 j |
| **Sous-total** | | **2,5 j** | **2,5 j** |

---

## Récapitulatif global

| Bloc | Estimé | Réel | Écart |
|---|---|---|---|
| Cadrage / Architecture | 3,5 j | 4,5 j | +1 j |
| Développement | 12,5 j | 18 j | +5,5 j |
| Gestion de projet | 1,5 j | 1,5 j | 0 |
| Maintenance / Documentation | 2,5 j | 2,5 j | 0 |
| **Total** | **20 j** | **26,5 j** | **+6,5 j** |

## Analyse des écarts

Le développement a dépassé l'estimation de **+33%**, principalement sur :
- Le wizard multi-étapes (+1 j) : complexité Zod, format plaque SIV, autocomplete NHTSA
- L'intégration Three.js (+1 j) : incompatibilité versions React/drei/fiber, résolution HDR
- La conception UX (+0,5 j) : itérations supplémentaires sur le thème dark avec le commanditaire
- Les API Routes backend (+1 j) : gestion des cas limites (champs optionnels, ownership checks)
