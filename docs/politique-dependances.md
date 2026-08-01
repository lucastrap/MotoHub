# Gestion des dépendances MotoTrack

Règles de veille, d'audit et de mise à jour des dépendances. Dernière mise à jour : 28/07/2026.

## 1. Surface

30 dépendances applicatives et 17 dépendances de développement, qui en tirent 1 210 paquets dans `node_modules`. Ce rapport de 1 à 25 est la contrainte de départ : l'essentiel du code exécuté n'a pas été choisi, il a été hérité. Une politique de mise à jour doit donc dire ce qu'on surveille, comment on évalue un changement, et ce qu'on fait de ce qu'on ne peut pas corriger.

## 2. Veille

### 2.1 Dependabot

`.github/dependabot.yml` :

| Écosystème | Cadence | Regroupement |
|---|---|---|
| npm | Hebdomadaire, lundi 7 h Europe/Paris | Mineures et correctifs en une PR, sécurité isolée |
| github-actions | Mensuelle | Une PR |

Les mineures sont regroupées parce qu'une PR par paquet produit une dizaine de PR par semaine : passé ce volume, elles ne sont plus lues mais fusionnées en bloc ou ignorées. Les correctifs de sécurité arrivent seuls, pour ne pas attendre l'arbitrage d'une montée de confort.

Les montées majeures sont exclues de la fusion automatique. Le projet a déjà payé ce type de montée : `@react-three/drei` v10 est incompatible avec React 18, ce qui a imposé un retour en v9.109.0 (CHANGELOG 0.2.0). Une majeure demande la lecture d'un guide de migration et une recette dédiée.

Conséquence à connaître : la règle `ignore` s'applique aussi aux mises à jour de sécurité. Une faille corrigée uniquement dans une version majeure ne produira donc aucune PR   c'est le cas de `next` et de `next-pwa` (§ 3.3). Le rattrapage est manuel, c'est le point 2 de la revue mensuelle (§ 5).

### 2.2 Audit en intégration continue

`ci.yml` exécute deux audits à chaque push et chaque PR, parce qu'ils ne mesurent pas la même chose :

| Périmètre | Commande | Ce qu'il mesure |
|---|---|---|
| Production | `npm audit --omit=dev` | Ce qui s'exécute réellement chez l'utilisateur |
| Complet | `npm audit` | Y compris jest, eslint et la chaîne de build |

Les deux résultats sont publiés dans le résumé du job et conservés 30 jours en artefact.

## 3. État des lieux au 28/07/2026

```
npm audit             ->  57 vulnérabilités (1 critique, 54 élevées, 2 faibles)
npm audit --omit=dev  ->  15 vulnérabilités (1 critique, 13 élevées, 1 faible)
```

42 des 57 vulnérabilités concernent donc des paquets qui ne s'exécutent jamais en production. Elles ne sont pas inexistantes pour autant, un poste de développement compromis étant un vecteur d'attaque de la chaîne d'approvisionnement, mais elles ne sont pas atteignables par un visiteur du site.

### 3.1 Périmètre de production

| Paquet | Sévérité | Chaîne | Correctif | Décision |
|---|---|---|---|---|
| `tar` | Critique | `bcrypt` → `@mapbox/node-pre-gyp` → `tar` | oui, sans rupture | à appliquer |
| `next` | Élevée | directe (14.2.35) | Next 16, majeure | reportée, § 3.3 |
| `postcss` | Élevée | `next` → `postcss` | via Next 16, majeure | reportée |
| `workbox-*`, `rollup-plugin-terser`, `serialize-javascript` | Élevée | `next-pwa` → `workbox-webpack-plugin` → … | next-pwa 2.x, majeure | reportée, § 3.3 |
| `lodash` | Élevée | `recharts` → `lodash` et `next-pwa` → `workbox-build` → `lodash` | oui, sans rupture | à appliquer |
| `brace-expansion`, `picomatch`, `fast-uri`, `@babel/*` | Élevée / faible | transitives | oui, sans rupture | à appliquer |

### 3.2 Deux exemples de lecture du compteur

`npm audit` traite toutes les vulnérabilités comme équivalentes. Deux cas de ce projet montrent qu'elles ne le sont pas.

`tar` remonte par `bcrypt → @mapbox/node-pre-gyp → tar`. `node-pre-gyp` télécharge et décompresse un binaire précompilé au moment de `npm install` ; il ne s'exécute pas au runtime, et la fonction serverless qui hache un mot de passe n'appelle jamais `tar`. La vulnérabilité, une écriture arbitraire de fichier via un lien physique, suppose une archive malveillante servie pendant l'installation, donc une compromission du registre npm ou une attaque de l'intermédiaire. Le risque porte sur la chaîne d'approvisionnement et il est traité par `npm ci`, qui installe strictement le contenu du `package-lock.json` dont les empreintes sont vérifiées.

`lodash` arrive par deux chemins de natures opposées : via `next-pwa` c'est du code de build, via `recharts` c'est du code livré au navigateur. Mais la vulnérabilité citée porte sur `_.template` et sur la pollution de prototype. `recharts` n'expose pas `_.template` à des données utilisateur et MotoTrack n'appelle pas lodash directement : exploitable en théorie, inatteignable dans cette application.

Remonter la chaîne, identifier le moment d'exécution puis vérifier l'atteignabilité ne conclut pas que ce n'est pas grave, mais que ce n'est pas prioritaire, ce qui est une décision documentée.

### 3.3 Ce qui n'est pas corrigé

Deux blocs résistent, pour la même raison : le correctif exige une montée majeure.

`next` vers Next 16 traverse deux versions majeures depuis la 14.2.35, avec un changement du modèle de cache, des API asynchrones pour `cookies()` et `headers()`, et une refonte du build. Le coût se compte en jours de migration et en recette complète. Les vulnérabilités concernées visent par ailleurs surtout les déploiements auto-hébergés (optimiseur d'images, empoisonnement de cache) ; MotoTrack est sur Vercel, où plusieurs de ces vecteurs sont traités en amont.

`next-pwa` 5.6.0 embarque Workbox 6, dont l'arbre de build (rollup, terser, serialize-javascript) concentre l'essentiel des alertes élevées du périmètre production alors qu'il s'agit de code de compilation, qui n'atteint jamais le navigateur. Le paquet n'est plus activement maintenu ; la vraie réponse serait de le remplacer, pas de le monter de version.

Ces deux montées sont hors du périmètre de la version 1.2.0 et consignées comme dette technique. C'est aussi la raison pour laquelle l'étape d'audit de la CI n'est pas bloquante : rendre bloquant un critère qu'on sait ne pas pouvoir satisfaire conduit à le désactiver, donc à perdre l'information. La CI publie les compteurs à chaque exécution et émet un avertissement explicite dès qu'une vulnérabilité critique apparaît dans le périmètre de production.

## 4. Évaluer une mise à jour

Cinq étapes, que la mise à jour vienne de Dependabot ou d'une décision manuelle.

| Étape | Question | Moyen |
|---|---|---|
| 1. Classer | Correctif, mineure ou majeure ? | Version sémantique |
| 2. Lire | Qu'est-ce qui change ? | Notes de version, guide de migration si majeure |
| 3. Évaluer la portée | Combien de fichiers appellent cette bibliothèque ? | `grep` sur les imports |
| 4. Vérifier | Le comportement est-il inchangé ? | Typage, lint, 157 tests unitaires, build, 23 tests e2e |
| 5. Observer | Un effet apparaît-il en conditions réelles ? | Preview Vercel, puis sonde et Sentry après mise en production |

L'étape 5 est celle qu'on saute. Une mise à jour peut passer toute la CI et dégrader un temps de réponse ou provoquer une erreur qui ne survient qu'avec des données réelles.

L'étape 1 conditionne la profondeur des quatre autres, d'où trois traitements distincts :

| Type | Détection | Ce qui s'ajoute | Validation avant fusion |
|---|---|---|---|
| Correctif `x.y.Z` | groupe `mises-a-jour-mineures`, ou groupe `securite` seul si c'est une faille | lecture du diff | pipeline complet |
| Mineure `x.Y.z` | même groupe hebdomadaire | notes de version, portée des appels | pipeline + preview Vercel |
| Majeure `X.y.z` | exclue de l'automatisation, repérée par `npm outdated` en revue mensuelle | guide de migration, branche dédiée | pipeline + preview + recette manuelle |

L'intégration elle-même est verrouillée en amont : Dependabot n'ouvre que des PR, aucune fusion automatique n'est configurée, `npm ci` installe strictement le `package-lock.json` dont les empreintes d'intégrité sont vérifiées, et les deux jobs de déploiement de `ci.yml` portent `needs: test-and-build`, donc rien ne part en production sans pipeline vert.

### 4.1 Exemple : Next 14.1.0 vers 14.2.35

Commit `7f8c78c`, 17/07/2026.

| Étape | Ce qui a été fait |
|---|---|
| Classer | Mineure dans la même majeure, pas de rupture d'API annoncée |
| Lire | Correctifs de sécurité cumulés depuis 14.1.0, dont des failles du middleware et du traitement des requêtes. La version en place était vulnérable. |
| Portée | Next est la dépendance structurante, la portée est l'application entière. `eslint-config-next` a été monté conjointement, sans quoi le lint applique les règles de l'ancienne version. |
| Vérifier | Pipeline complet vert : lint, tests unitaires, build, e2e |
| Observer | Aucune régression sur la preview ni en production |

Aucun utilisateur ni aucun test n'avait signalé la 14.1.0. Seul l'audit pouvait révéler qu'elle était vulnérable.

## 5. Revue mensuelle

Premier lundi du mois, session courte :

1. Traiter les PR Dependabot en attente (§ 4).
2. Relire les deux compteurs d'audit, vérifier qu'aucune critique n'est apparue dans le périmètre de production.
3. `npm outdated`, pour repérer les écarts majeurs qui se creusent. Une majeure ignorée un an devient une migration de plusieurs jours.
4. Vérifier que les paquets structurants sont toujours maintenus. Un paquet abandonné ne déclenche aucune alerte automatique, c'est le seul point de cette liste qu'aucun outil ne fait à ma place. `next-pwa` en est déjà un.
