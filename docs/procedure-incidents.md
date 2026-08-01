# Traitement des anomalies MotoTrack

Comment une anomalie est consignée, qualifiée, corrigée et refermée. Dernière mise à jour : 28/07/2026.

## 1. Un point d'entrée unique

Une anomalie peut arriver par six canaux : un utilisateur qui écrit, une recette manuelle, une alerte de sonde, un échec de pipeline, un événement Sentry, une revue de code. Si chacun garde son propre registre, on ne sait plus combien d'anomalies sont ouvertes ni laquelle attend depuis trois semaines.

Quelle que soit son origine, une anomalie devient donc une issue GitHub. Les issues sans modèle sont désactivées (`config.yml`, `blank_issues_enabled: false`), on ne peut pas ouvrir un ticket vide.

Le circuit est le même pour tous : issue → qualification (sévérité) → correction sur branche dédiée → vérification (test + CI) → clôture et entrée au CHANGELOG.

## 2. Collecte

### 2.1 Modèles d'issue

Trois formulaires dans `.github/ISSUE_TEMPLATE/` :

| Modèle | Usage | Étiquettes posées |
|---|---|---|
| `anomalie.yml` | Dysfonctionnement constaté | `anomalie`, `a-qualifier` |
| `incident-production.yml` | Indisponibilité ou dégradation en production | `incident`, `production` |
| `amelioration.yml` | Évolution issue d'un retour ou d'un indicateur | `amelioration`, `a-arbitrer` |

Les champs obligatoires sont ceux sans lesquels le diagnostic ne peut pas commencer :

| Champ | Ce qu'il évite |
|---|---|
| Canal de détection | Ne pas pouvoir mesurer quel dispositif attrape quoi (§ 6) |
| Version + commit | Chercher un bogue déjà corrigé dans une version que le signalant n'a pas |
| Environnement | Confondre un problème de configuration Vercel avec un défaut applicatif |
| Étapes de reproduction | Les trois allers-retours nécessaires pour reproduire |
| Attendu / observé | Corriger ce qu'on croit être le problème plutôt que le problème |

La version et le commit se lisent dans la réponse de `/api/health` : le signalant n'a pas à savoir ce qui est déployé, il copie deux champs.

### 2.2 Sentry

Un formulaire ne capte que ce qui est signalé. La majorité des dysfonctionnements ne donne jamais lieu à un ticket : l'utilisateur recharge la page, ou s'en va.

Sentry consigne automatiquement, avec la trace d'exécution, le navigateur, la version déployée et le rejeu de session :

- les exceptions non rattrapées (navigateur, serveur, middleware Edge) ;
- les erreurs rattrapées, via le transport Winston `src/lib/sentryTransport.ts`, où chaque `logger.error(...)` des routes API devient un événement.

Le second point compte le plus : les routes API interceptent leurs erreurs et répondent proprement en 500, donc sans ce pont les erreurs les mieux instrumentées de l'application seraient invisibles du collecteur.

### 2.3 Sonde de supervision

`supervision.yml` ouvre lui-même une issue `incident` après trois échecs consécutifs, avec le relevé des indicateurs au moment de la panne, et la referme en calculant la durée d'indisponibilité. Détail dans `docs/supervision-monitoring.md` § 4.

## 3. Qualification

| Sévérité | Définition | Délai cible |
|---|---|---|
| Bloquant | Fonctionnalité critique inutilisable sans contournement, perte de données, ou faille de sécurité | Immédiat, correctif à chaud |
| Majeur | Fonctionnalité dégradée, contournement pénible | 48 h |
| Mineur | Gêne cosmétique ou d'ergonomie | Prochaine version mineure |

La sévérité proposée par le signalant est indicative et arbitrée à la qualification : un utilisateur qualifie de bloquant ce qui le bloque, lui.

Trois questions dans l'ordre :

1. Est-ce reproductible ? Non reproductible ne veut pas dire inexistant. L'issue reste ouverte, étiquetée `a-reproduire`, et on cherche la trace correspondante dans Sentry.
2. Le parcours est-il critique ? Connexion, ajout de moto, saisie d'entretien : oui. Actualités, météo, pièces : non.
3. Combien d'utilisateurs sont touchés ? Sentry donne le nombre d'occurrences et de sessions distinctes.

## 4. Correction et déploiement

### 4.1 Cheminement normal

1. Branche `fix/<numéro>-<résumé>` depuis `develop`.
2. Test de non-régression écrit avant le correctif ; il doit échouer.
3. Correctif ; le test passe.
4. Pull request : lint, audit, 157 tests unitaires, build, 24 tests e2e.
5. Vérification sur la preview Vercel, déployée automatiquement et commentée sur la PR.
6. Merge `develop` → `main`, déploiement production.
7. CHANGELOG, tag, clôture de l'issue.

Le test s'écrit avant le correctif : écrit après, il a été conçu en regardant la solution et il passe toujours. Écrit avant, il prouve d'abord qu'il sait détecter le défaut.

La CI est le seul déployeur. L'intégration Git de Vercel est volontairement déconnectée, sans quoi elle déploierait sur push sans consulter les tests. Le job `deploy` porte `needs: test-and-build`.

### 4.2 Correctif à chaud

Pour une anomalie bloquante en production, passer par `develop` fait perdre du temps et risque d'embarquer des changements non validés. On part donc de `main` sur une branche `hotfix/<numéro>-<résumé>`, avec une PR vers `main` qui exécute la CI complète, puis report immédiat sur `develop`.

Deux règles :

1. La CI n'est jamais contournée, même en urgence. C'est sous pression que les régressions passent.
2. Le report sur `develop` se fait tout de suite. Un correctif présent en production et absent de `develop` sera écrasé à la livraison suivante.

### 4.3 Retour arrière

Si la cause n'est pas identifiée en un quart d'heure, on rétablit d'abord et on comprend ensuite.

- Application : Vercel → *Deployments* → promouvoir le dernier déploiement stable. Effet en quelques secondes, sans rebuild.
- Base de données : jamais de suppression d'une migration déjà déployée. On crée une migration corrective (`prisma migrate dev`), ce qui préserve l'historique et la reproductibilité de la base sur tous les environnements.

## 5. Registre des anomalies

Les anomalies de qualité technique BUG-01 à BUG-06 figurent dans `docs/plan-correction-bogues.md`. Sont consignées ici les anomalies survenues après la version 1.0.0, en phase de maintien en condition opérationnelle. Chaque entrée est vérifiable par `git show <commit>`.

### MCO-01   Échec de prérendu sur les pages d'entretien (bloquant)

| Champ | Détail |
|---|---|
| Détection | Échec de pipeline CI, étape `build` |
| Constat | `next build` échoue sur `/maintenance` et `/maintenance/new`, le déploiement devient impossible |
| Analyse | `useSearchParams()` force le rendu côté client. En Next 14, son usage dans un composant de page sans frontière `<Suspense>` fait échouer le prérendu statique de la page entière. La cause est l'emplacement dans l'arbre, pas le hook. |
| Correction | Isolation du contenu consommant `useSearchParams` dans un composant enfant enveloppé d'un `<Suspense>`. Commit `03bc3ae`. |
| Vérification | `npm run build` passe, les deux pages sont générées |
| Statut | Résolu le 14/07/2026 |

### MCO-02   Échec d'installation de la PWA (majeur)

| Champ | Détail |
|---|---|
| Détection | Recette manuelle sur mobile |
| Constat | L'installation sur l'écran d'accueil échoue, le service worker n'atteint jamais l'état `activated` |
| Analyse | Deux causes indépendantes. Workbox tente de mettre en cache `app-build-manifest.json`, fichier interne à Next absent du build de production, et l'échec d'une seule entrée du précache invalide toute l'installation. Par ailleurs `apple-mobile-web-app-capable` est un attribut propriétaire Apple, les navigateurs Chromium attendent son équivalent standard. |
| Correction | `buildExcludes: [/app-build-manifest\.json$/]` dans la configuration next-pwa, ajout de la balise `mobile-web-app-capable`. Commit `45d106c`. |
| Vérification | Service worker `activated`, invite d'installation présente sur Android et iOS |
| Statut | Résolu le 19/07/2026 |

### MCO-03   Migrations Prisma impossibles depuis la CI (bloquant)

| Champ | Détail |
|---|---|
| Détection | Échec de pipeline CI, étape de migration des jobs de déploiement |
| Constat | `prisma migrate deploy` échoue systématiquement, bloquant les livraisons vers la preview comme vers la production |
| Analyse | Trois causes empilées, découvertes successivement. Le pooler PgBouncer de Supabase, obligatoire en exécution serverless, ne supporte pas les migrations, qui exigent une connexion directe (`directUrl`). La variable `DIRECT_URL` était absente du job de tests, dont la base tourne en connexion directe. Enfin les variables tirées de Vercel étaient chargées par `source` en shell, ce qui casse dès qu'un mot de passe contient un caractère spécial. |
| Correction | Déclaration de `directUrl` dans `schema.prisma`, chargement du `.env` par Prisma plutôt que par le shell, contrôle de présence des deux variables en une passe avec message `::error::` explicite. Commits `93c7409`, `c3c3f26`, `0fe416b`, `6bdaa72`. |
| Vérification | Pipeline vert de bout en bout, migrations appliquées sur preview et production |
| Enseignement | Le diagnostic a coûté cinq itérations parce que l'échec était muet. Le correctif ne se contente pas de faire fonctionner la migration, il rend l'échec lisible la prochaine fois. |
| Statut | Résolu le 16/07/2026 |

### MCO-04   Garde-fou de tests désactivé pendant un débogage (majeur)

| Champ | Détail |
|---|---|
| Détection | Revue de l'historique CI |
| Constat | Pour isoler MCO-03, le job `test-and-build` a été temporairement désactivé (`97ae0d4`), supprimant la condition `needs` qui protège les déploiements. Pendant quelques heures, du code non testé pouvait atteindre la production. |
| Analyse | Contournement délibéré sur le moment, mais qui constituait une régression du dispositif de sécurité de la chaîne de livraison |
| Correction | Réactivation du job et restauration du `needs` sur les deux jobs de déploiement. Commit `b09044d`. |
| Enseignement | Consigné plutôt que passé sous silence, parce que ce type d'écart devient permanent quand il n'est pas tracé. Il aurait fallu déboguer le job de déploiement sur une branche dédiée, sans toucher au pipeline de `main`. |
| Statut | Résolu le 16/07/2026 |

## 6. Ce que le dispositif attrape

Répartition de MCO-01 à MCO-04 par canal de détection :

| Canal | Nombre | Ce qu'il attrape |
|---|---|---|
| Pipeline CI | 2 | Ce qui empêche de construire ou de déployer |
| Recette manuelle | 1 | Ce qui se voit à l'écran |
| Revue de l'historique | 1 | Les écarts de processus |
| Retour utilisateur | 0 | |
| Sonde et collecteur | 0 | Mis en place le 28/07/2026, postérieurs à ces anomalies |

Aucune anomalie n'a été détectée par un utilisateur, pour une raison simple : MotoTrack n'a pas de base d'utilisateurs. Le dispositif de collecte est fonctionnel mais non éprouvé par l'usage, et c'est sa principale faiblesse.

Sentry et les sondes, arrivés le 28/07/2026, n'ont contribué à aucune de ces quatre détections. Ils couvrent en revanche une catégorie qu'aucun canal existant n'attrapait : l'erreur qui frappe un utilisateur en production sans faire échouer ni le build, ni un test, ni une recette.

Reste ce à quoi je n'ai pas pensé, qu'aucun de ces canaux ne détecte et que couvrirait normalement une revue par un pair, absente d'un projet solo.
