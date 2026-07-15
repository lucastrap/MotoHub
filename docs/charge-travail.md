# Estimation de la charge de travail — MotoTrack

## Méthode

Estimation en jours/homme (1 j/h = 7h de travail effectif).
Projet réalisé **seul**, sur 6 semaines, en parallèle de la formation.
Le chiffrage initial a été posé au démarrage, avant écriture de la première ligne de code,
puis confronté au temps réellement passé.

L'estimation étant faite par la seule personne qui allait réaliser les tâches, elle ne
bénéficie d'aucun contradicteur — ce qui explique en grande partie l'optimisme constaté
sur le développement (voir l'analyse des écarts).

---

## Détail par module

### BLOC 1 — Cadrage et architecture

| Tâche | Estimé | Réel |
|---|---|---|
| Analyse du besoin et étude de marché | 0,5 j | 0,5 j |
| Choix de la stack technique | 0,5 j | 0,5 j |
| Conception de l'interface (directement en code, sans phase de maquettage) | 1,5 j | 2 j |
| Modélisation schéma de base de données | 0,5 j | 1 j |
| Schéma d'architecture | 0,5 j | 0,5 j |
| **Sous-total** | **3,5 j** | **4,5 j** |

> 🔲 **À CONFIRMER** — la ligne « conception de l'interface » suppose qu'aucune maquette
> formelle (Figma ou autre) n'a été produite et que le design a été itéré directement en
> code. Si des maquettes existent, remplacer le libellé ; sinon, cette formulation est la
> bonne et l'arbitrage est expliqué au §4.5 du dossier.

### BLOC 2 — Développement

| Tâche | Estimé | Réel |
|---|---|---|
| Mise en place projet (Next.js, Docker, Prisma) | 1 j | 1 j |
| Authentification (register, login, JWT, middleware) | 1 j | 1,5 j |
| API motorcycles + maintenances | 1 j | 1,5 j |
| Wizard ajout moto (validation Zod, NHTSA, format plaque) | 2 j | 3 j |
| Module Entretien — formulaire + historique | 1,5 j | 2 j |
| Tableau de bord — données réelles + échéances | 1 j | 1,5 j |
| Module Actualités (Google News RSS) | 0,5 j | 1 j |
| Module Pièces & achats | 0,5 j | 1 j |
| Scène 3D accueil (Three.js / R3F) | 1 j | 2 j |
| Design dark premium (Tailwind, animations) | 1,5 j | 2 j |
| Intégration API NHTSA (cache 24h) | 0,5 j | 0,5 j |
| Harnais de tests unitaires (Jest) | 1 j | 1 j |
| **Sous-total** | **12,5 j** | **18 j** |

### BLOC 3 — Gestion de projet

| Tâche | Estimé | Réel |
|---|---|---|
| Découpage en incréments, suivi GitHub | 1 j | 1 j |
| Revue de PR et arbitrages | 0,5 j | 0,5 j |
| **Sous-total** | **1,5 j** | **1,5 j** |

### BLOC 4 — Maintenance et documentation

| Tâche | Estimé | Réel |
|---|---|---|
| CI/CD GitHub Actions | 0,5 j | 0,5 j |
| Logging Winston + endpoint /api/health | 0,5 j | 0,5 j |
| Rédaction cahier de recettes | 1 j | 1 j |
| Documentation technique + CHANGELOG | 0,5 j | 0,5 j |
| **Sous-total** | **2,5 j** | **2,5 j** |

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

Le développement a dépassé l'estimation de **+44%** (12,5 j estimés → 18 j réels), soit
**+33%** sur le total du projet. Les postes concernés :

- Le wizard multi-étapes (+1 j) : complexité Zod, format plaque SIV, autocomplete NHTSA
- L'intégration Three.js (+1 j) : incompatibilité versions React/drei/fiber, résolution HDR
- La conception UX (+0,5 j) : itérations sur le thème dark
- Les API Routes backend (+1 j) : gestion des cas limites (champs optionnels, ownership checks)

**Ce que ces écarts m'apprennent :** ils se concentrent tous sur des tâches où je découvrais
la technologie en la réalisant (Three.js, transformations Zod avancées, API SIV). Les tâches
sur terrain connu (setup, CI, documentation) sont estimées juste. L'erreur d'estimation
n'est donc pas aléatoire : elle mesure ma zone d'inexpérience. Un chiffrage plus honnête
aurait appliqué un facteur d'incertitude explicite aux seuls postes nouveaux, plutôt qu'une
marge uniforme.
