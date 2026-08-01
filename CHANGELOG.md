# Changelog MotoTrack

Versions déployées, de la plus récente à la plus ancienne.
Les correctifs citent le commit qui les porte : `git show <commit>` permet de vérifier.

---

## [1.3.1] 2026-07-29

Rien de nouveau côté utilisateur : cette version corrige un angle mort de la supervision
elle-même.

- **Correctif** : un ralentissement durable n'alertait personne. La sonde renvoyait bien
  `degraded` et Sentry recevait un `warning`, mais le workflow n'ouvrait d'issue que sur
  échec complet : une base lente pendant des heures aurait été constatée par les
  utilisateurs avant de l'être par la supervision. Une issue de sévérité majeure est
  désormais ouverte après trois exécutions consécutives en `degraded`, soit environ
  45 minutes de dégradation continue, et refermée au retour sous le seuil (`9bb6775`).
- Le compteur d'exécutions consécutives est porté par le cache Actions, le workflow
  n'ayant aucune mémoire d'une exécution à l'autre. Une dégradation isolée n'ouvre
  toujours rien : elle reste tracée dans Sentry.

Au passage : ce code était parti en prod le 29/07 avec `9bb6775`, mais le numéro était
resté à 1.3.0 sur `main`. La sonde annonçait donc 1.3.0 sur du 1.3.1. Remis d'aplomb ici.

## [1.3.0] 2026-07-28

Rien de nouveau côté utilisateur : cette version rend l'application observable.

- Sonde `/api/health` complétée : état ok / dégradé / erreur, latence de la base, version
  et commit déployés
- Un workflow interroge la sonde toutes les 15 min et ouvre une issue si elle échoue trois
  fois de suite. Il la referme tout seul quand ça remarche.
- Sentry branché sur le front, le serveur et le middleware. Les erreurs déjà rattrapées par
  les routes API y remontent aussi, via un transport Winston maison.
- Trois modèles d'issue (anomalie, incident, amélioration), les issues vides sont bloquées
- Dependabot activé, montées majeures npm exclues (la règle ne couvre pas l'écosystème
  GitHub Actions, qui propose donc des majeures)
- La CI publie deux compteurs d'audit séparés : production seule, et tout

Au passage : le garde-fou de tests sur les jobs de déploiement, que j'avais désactivé le
temps de déboguer le pipeline, est remis (`b09044d`).

---

## [1.2.0] 2026-07-19

- Mode hors-ligne et installation sur l'écran d'accueil
- Speed Insights, pour mesurer les temps de chargement réels (`a264f8b`)

**Correctif** : l'installation de la PWA échouait. Workbox essayait de mettre en cache
`app-build-manifest.json`, un fichier interne à Next absent du build de prod, et une seule
entrée en échec suffit à tout invalider. Il manquait aussi la balise standard
`mobile-web-app-capable` à côté de celle d'Apple (`45d106c`).

---

## [1.1.1] 2026-07-17

Montée de Next 14.1.0 vers 14.2.35, avec `eslint-config-next` en même temps (`7f8c78c`).
Correctifs de sécurité accumulés depuis 14.1.0. Rien de cassé au passage.

---

## [1.1.0] 2026-07-16

- Base migrée vers Supabase, connexion par le pooler
- La CI devient le seul déployeur : l'intégration Git de Vercel déployait sans regarder les
  tests, elle est débranchée. Les jobs de déploiement attendent le pipeline.
- Une preview Vercel est déployée sur chaque PR, avec l'URL commentée dessus (`ccb010f`)

**Correctif** : les migrations Prisma échouaient depuis la CI, pour trois raisons empilées.
Le pooler ne gère pas les migrations, il faut `directUrl`. `DIRECT_URL` manquait dans le
job de tests. Et les variables étaient chargées avec `source`, ce qui casse dès qu'un mot
de passe contient un caractère spécial. L'échec est devenu lisible au lieu d'être muet
(`c3c3f26`, `93c7409`, `0fe416b`, `6bdaa72`).

---

## [1.0.1] 2026-07-15

- Pages de connexion et d'inscription en français (`d78d319`)
- Nom de l'application uniformisé sur MotoTrack partout
- Documentation réécrite en solo : plus de référence à une équipe ou à un commanditaire
  externe (`eeb2dd0`)

**Correctif** : `next build` échouait sur les deux pages d'entretien. `useSearchParams()`
était appelé directement dans la page, sans frontière `<Suspense>`, et Next 14 refuse de
prérendre dans ce cas. Plus rien ne pouvait être déployé (`03bc3ae`).

---

## [1.0.0]   2026-04-21

### Ajouts
- Module Garage : ajout, liste et gestion de plusieurs motos
- Wizard multi-étapes pour l'ajout d'une moto (marque, modèle, détails, achat)
- Sélection de la moto principale (`isPrimary`) avec badge visuel
- Module Entretien : enregistrement et historique des interventions
- Filtre par moto dans l'historique d'entretien
- Tableau de bord : dernière intervention réelle, prochaines échéances calculées, total des dépenses
- Module Actualités : flux RSS Google News (moto FR, sans clé API)
- Module Pièces & achats : liens dynamiques eBay, LeBonCoin, Amazon par moto
- Page météo
- Scène 3D accueil (Ducati Panigale V4R, Three.js / React Three Fiber)
- Authentification JWT avec cookies HTTP-only (register, login, logout)
- Middleware de protection des routes privées
- Design dark premium   Tailwind CSS, Barlow Condensed, thème `#090909`
- PWA (next-pwa)   installable sur mobile
- CI/CD GitHub Actions (lint, tests, build)
- Endpoint de supervision `GET /api/health`
- Logger structuré Winston

### Technique
- Next.js 14 App Router, React 18, TypeScript
- Prisma ORM 5, PostgreSQL 15 (Docker en dev)
- React Hook Form + Zod (validation et transformation des formulaires)
- Validation des modèles moto via NHTSA API (cache 24h)
- Format automatique immatriculation SIV (`AB-123-CD`)

---

## [0.3.0]   2026-04-07

### Ajouts
- Wizard ajout moto : sélecteur de marques avec drapeaux, autocomplete modèle NHTSA
- Format automatique plaque d'immatriculation
- Marques chinoises et taiwanaises (CFMoto, Zontes, Kymco, SYM…)
- Module Actualités avec Google News RSS

### Correctifs
- Zod schema : champs optionnels (`licensePlate`, `vin`, `purchasePrice`) refactorisés avec `.transform()` et `.preprocess()` pour éviter les erreurs 400 sur valeurs vides
- Meilleur affichage des erreurs serveur dans le formulaire

---

## [0.2.0]   2026-03-24

### Ajouts
- Module Pièces & achats avec liens dynamiques par moto
- Scène 3D (Three.js) sur la page d'accueil
- Design dark premium   refonte complète du frontend
- Page Actualités moto

### Correctifs
- `useGLTF` sorti du bloc try/catch (hooks React invalides dans try/catch)
- Downgrade `@react-three/drei` → v9.109.0 (incompatibilité React 18 / drei v10)

---

## [0.1.0]   2026-03-15

### Ajouts
- Initialisation projet Next.js 14 + Docker + Prisma
- Schéma base de données : User, Motorcycle, Maintenance, Reminder
- Authentification complète (register, login, JWT, middleware)
- Module Garage   liste et ajout de motos
- Module Entretien   CRUD interventions
- Tableau de bord initial
- CI/CD GitHub Actions
