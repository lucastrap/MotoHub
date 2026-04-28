# Changelog — MotoHub Pro

Toutes les modifications notables sont documentées ici.  
Format : [Semantic Versioning](https://semver.org/lang/fr/)

---

## [1.0.0] — 2026-04-21

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
- Design dark premium — Tailwind CSS, Barlow Condensed, thème `#090909`
- PWA (next-pwa) — installable sur mobile
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

## [0.3.0] — 2026-04-07

### Ajouts
- Wizard ajout moto : sélecteur de marques avec drapeaux, autocomplete modèle NHTSA
- Format automatique plaque d'immatriculation
- Marques chinoises et taiwanaises (CFMoto, Zontes, Kymco, SYM…)
- Module Actualités avec Google News RSS

### Correctifs
- Zod schema : champs optionnels (`licensePlate`, `vin`, `purchasePrice`) refactorisés avec `.transform()` et `.preprocess()` pour éviter les erreurs 400 sur valeurs vides
- Meilleur affichage des erreurs serveur dans le formulaire

---

## [0.2.0] — 2026-03-24

### Ajouts
- Module Pièces & achats avec liens dynamiques par moto
- Scène 3D (Three.js) sur la page d'accueil
- Design dark premium — refonte complète du frontend
- Page Actualités moto

### Correctifs
- `useGLTF` sorti du bloc try/catch (hooks React invalides dans try/catch)
- Downgrade `@react-three/drei` → v9.109.0 (incompatibilité React 18 / drei v10)

---

## [0.1.0] — 2026-03-15

### Ajouts
- Initialisation projet Next.js 14 + Docker + Prisma
- Schéma base de données : User, Motorcycle, Maintenance, Reminder
- Authentification complète (register, login, JWT, middleware)
- Module Garage — liste et ajout de motos
- Module Entretien — CRUD interventions
- Tableau de bord initial
- CI/CD GitHub Actions
