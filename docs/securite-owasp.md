# Analyse de sécurité   OWASP Top 10 (2021)

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Référentiel | OWASP Top 10   édition 2021 |
| Périmètre | Application web Next.js 14 (App Router), API Routes, PostgreSQL/Prisma |
| Auteur | Luca Straputicari |
| Date | 21 avril 2026 |

Ce document recense, pour chacune des dix catégories de risques majeurs de l'OWASP,
les mesures de sécurité mises en œuvre dans MotoTrack, les fichiers concernés et
les pistes d'amélioration.

---

## A01:2021   Broken Access Control (Contrôle d'accès défaillant)

**Mesures en place :**
- Middleware Next.js (`src/middleware.ts`) protégeant les routes `/dashboard`, `/garage`,
  `/maintenance` : toute requête sans jeton valide est redirigée vers `/login`.
- Contrôle de propriété (ownership) systématique côté API : chaque ressource est filtrée
  par `userId` issu du jeton (`where: { userId: user.sub }`) dans
  `api/motorcycles`, `api/maintenances`, `api/motorcycles/[id]`.
- Vérification explicite d'appartenance avant modification : `api/motorcycles/[id]`
  renvoie `404` si la moto n'appartient pas à l'utilisateur ; `api/maintenances` renvoie
  `403` si la moto ciblée n'est pas la sienne.

**Preuve de test :** `tests/unit/api/motorcycles.test.ts`, `motorcycles-id.test.ts`,
`maintenances.test.ts` (cas 401/403/404), `tests/e2e/auth.spec.ts` (redirections middleware).

**Amélioration :** introduire un modèle de rôles (RBAC) pour le profil « administrateur du club ».

---

## A02:2021   Cryptographic Failures (Défaillances cryptographiques)

**Mesures en place :**
- Mots de passe hachés avec **bcrypt** (facteur de coût 10)   jamais stockés en clair
  (`api/auth/register/route.ts`). Aucun mot de passe n'est renvoyé par l'API
  (`select` limité à `id, email, name`).
- Jetons de session **JWT signés HS256** (`src/lib/auth.ts`, librairie `jose`), secret
  fourni par variable d'environnement `JWT_SECRET` (jamais commité).
- Cookie de session **`httpOnly`**, **`secure`** en production, `path=/`, `maxAge` 24 h
  (`api/auth/login/route.ts`)   inaccessible au JavaScript client.

**Preuve de test :** `tests/unit/api/register.test.ts` (`bcrypt.hash` appelé),
`tests/unit/auth.test.ts` (signature/vérification JWT).

**Amélioration :** rotation du `JWT_SECRET`, refresh tokens, HSTS au niveau du reverse proxy.

---

## A03:2021   Injection

**Mesures en place :**
- **Prisma ORM** : toutes les requêtes sont paramétrées ; aucune concaténation SQL.
  La seule requête brute (`SELECT 1` du health-check) est une constante sans entrée utilisateur.
- **Validation systématique des entrées avec Zod** avant tout traitement
  (`loginSchema`, `registerSchema`, `motorcycleSchema`, `maintenanceSchema`).
- React échappe par défaut le rendu   pas d'injection HTML/XSS via l'interpolation JSX.

**Preuve de test :** tests de schémas Zod (`motorcycleSchema.test.ts`) et de rejet `400`
sur données invalides dans chaque route.

**Amélioration :** politique CSP stricte, sanitation explicite du HTML des flux RSS externes.

---

## A04:2021   Insecure Design (Conception non sécurisée)

**Mesures en place :**
- Défense en profondeur : validation (Zod) + contrôle d'accès (middleware) + contrôle
  de propriété (requêtes filtrées) à trois niveaux distincts.
- Principe de moindre privilège sur les réponses API (projection des champs).
- Modélisation des menaces réalisée lors du cadrage (SWOT sécurité, Bloc 1).

**Amélioration :** limitation de débit (rate limiting) sur les endpoints d'authentification.

---

## A05:2021   Security Misconfiguration (Mauvaise configuration)

**Mesures en place :**
- Secrets externalisés en variables d'environnement (`.env` exclu par `.gitignore`).
- Cookies `secure` conditionnés à `NODE_ENV === "production"`.
- Messages d'erreur génériques côté client (`"Invalid credentials"`) : aucune fuite
  d'information sur l'existence d'un compte.
- Build de production distinct (`next build`) sans mode debug.
- **En-têtes de sécurité HTTP** appliqués à toutes les réponses via `next.config.js` :
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, `Strict-Transport-Security` (HSTS) et une `Content-Security-Policy`
  en mode *Report-Only* (préparation d'une politique bloquante sans risque de régression).

**Amélioration :** passage de la CSP en mode bloquant après période d'observation.

---

## A06:2021   Vulnerable and Outdated Components (Composants vulnérables)

**Mesures en place :**
- Dépendances récentes et épinglées (`package-lock.json`) : Next.js 14, Prisma 5, Zod 3.
- Installation reproductible en CI avec `npm ci`.
- **Audit automatisé des vulnérabilités** : étape `npm audit --audit-level=high` intégrée
  au pipeline CI (`.github/workflows/ci.yml`), exécutée à chaque push/PR.

**Amélioration :** activer **Dependabot** pour les mises à jour automatiques des dépendances.

---

## A07:2021   Identification and Authentication Failures

**Mesures en place :**
- Mot de passe minimum 6 caractères imposé à l'inscription (schéma Zod).
- Comparaison de mots de passe à temps constant via `bcrypt.compare`.
- Expiration de session (JWT `exp` à 24 h, `maxAge` du cookie aligné).
- Déconnexion serveur effective par suppression du cookie (`api/auth/logout`).
- **Limitation de débit (rate limiting)** sur `/api/auth/login` et `/api/auth/register`
  (`src/lib/rateLimit.ts`) : au-delà du seuil de tentatives par IP, réponse `429` avec
  en-tête `Retry-After`   protection contre le bourrage d'identifiants (credential stuffing).

**Preuve de test :** `tests/unit/api/login.test.ts` (401 identifiants invalides, **429
au-delà du seuil**), `tests/unit/rateLimit.test.ts`, `tests/unit/auth.test.ts` (token expiré rejeté).

**Amélioration :** MFA, verrouillage de compte progressif, magasin de limitation partagé
(Redis) en production multi-instances.

---

## A08:2021   Software and Data Integrity Failures

**Mesures en place :**
- Intégrité de la chaîne de build assurée par `package-lock.json` + `npm ci`.
- Pipeline CI/CD contrôlé (GitHub Actions) : lint, tests, build avant tout déploiement.
- Jeton JWT signé et vérifié à chaque requête protégée (intégrité de session).

**Amélioration :** signature des artefacts de build, vérification d'intégrité (SRI)
des ressources tierces.

---

## A09:2021   Security Logging and Monitoring Failures

**Mesures en place :**
- Journalisation structurée **Winston** (`src/lib/logger.ts`) : niveaux, horodatage,
  format JSON, persistance fichier en développement.
- Endpoint de supervision **`GET /api/health`** exposant l'état applicatif, l'état de la
  base et la latence   support d'une sonde de monitoring externe.
- Traçage des échecs de vérification de jeton dans le middleware.

**Preuve de test :** `tests/unit/api/health.test.ts` (200/503), `tests/unit/logger.test.ts`,
`tests/e2e/api-health.spec.ts`.

**Amélioration :** centralisation des logs (Loki/ELK), alerting sur le taux d'erreurs.

---

## A10:2021   Server-Side Request Forgery (SSRF)

**Mesures en place :**
- Les seules requêtes sortantes ciblent des URL **constantes et de confiance**
  (API NHTSA, flux Google News RSS)   aucune URL n'est construite à partir d'une entrée
  utilisateur arbitraire.
- Le paramètre `brand` de `api/motorcycle-models` est encodé (`encodeURIComponent`) et
  restreint à une table d'alias connue.

**Amélioration :** liste blanche de domaines sortants, délais d'expiration stricts
(déjà 8 s sur le parseur RSS).

---

## Synthèse

| Catégorie OWASP | Couverture | Mesure principale |
|---|---|---|
| A01 Contrôle d'accès | ✅ | Middleware + ownership par `userId` |
| A02 Cryptographie | ✅ | bcrypt + JWT HS256 + cookie httpOnly |
| A03 Injection | ✅ | Prisma paramétré + validation Zod |
| A04 Conception | ✅ | Défense en profondeur |
| A05 Configuration | ✅ | Secrets externalisés, en-têtes HTTP, erreurs génériques |
| A06 Composants | ✅ | Dépendances épinglées + `npm audit` en CI |
| A07 Authentification | ✅ | bcrypt.compare, expiration session, rate limiting |
| A08 Intégrité | ✅ | `npm ci` + pipeline CI contrôlé |
| A09 Journalisation | ✅ | Winston + `/api/health` |
| A10 SSRF | ✅ | URL sortantes constantes et encodées |

Les dix catégories du référentiel OWASP Top 10 (2021) sont couvertes par au moins une
mesure effective et testée. Les mesures initialement en réserve (en-têtes de sécurité HTTP,
audit automatisé des dépendances, limitation de débit) ont été **implémentées**. Les axes
restants (MFA, CSP bloquante, RBAC administrateur) relèvent de l'amélioration continue.
