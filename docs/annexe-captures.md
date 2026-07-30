# Captures d'écran et actions à réaliser

Document de travail. Il liste ce qu'il reste à configurer côté services externes, puis les
captures à produire et à insérer dans `docs/rapport-maintenance.md`.

---

## Partie 1 : actions à réaliser avant de produire les captures

Les fichiers de configuration sont dans le dépôt. Ces six actions demandent un accès aux
interfaces GitHub, Sentry, UptimeRobot et Vercel.

### A1. Variable de dépôt `PRODUCTION_URL` (indispensable, sans elle la sonde ne tourne pas)

GitHub, **Settings**, *Secrets and variables*, **Actions**, onglet **Variables**,
*New repository variable*.

| Nom | Valeur |
|---|---|
| `PRODUCTION_URL` | L'URL de production, **sans barre oblique finale**, par exemple `https://mototrack.vercel.app` |

> Le workflow construit `${PRODUCTION_URL}/api/health`. Une barre finale produirait une
> double barre et un 404, donc un faux incident dès la première exécution.

### A2. Étiquettes GitHub

GitHub, **Issues**, *Labels*, *New label*. Elles sont référencées par les modèles d'issue et
par le workflow de supervision. Si elles n'existent pas, GitHub les crée à la volée en gris,
ce qui fonctionne mais reste illisible.

| Étiquette | Couleur suggérée | Usage |
|---|---|---|
| `incident` | rouge `#d73a4a` | Ouverte automatiquement par `supervision.yml` |
| `production` | rouge foncé `#b60205` | Incident touchant l'environnement de production |
| `anomalie` | orange `#e99695` | Modèle `anomalie.yml` |
| `a-qualifier` | jaune `#fbca04` | En attente d'arbitrage de sévérité |
| `a-reproduire` | jaune pâle `#fef2c0` | Signalement non reproduit à ce stade |
| `amelioration` | vert `#0e8a16` | Modèle `amelioration.yml` |
| `a-arbitrer` | bleu clair `#c5def5` | Proposition en attente de priorisation |
| `dependances` | violet `#5319e7` | Posée par Dependabot |
| `ci` | gris `#bfdadc` | Mises à jour des actions |

### A3. Projet Sentry

1. Créer un compte sur `sentry.io` (offre gratuite, 5 000 événements par mois).
2. *Create Project*, plateforme **Next.js**, nom `mototrack`.
3. Copier le **DSN** affiché.
4. Vercel, projet `mototrack`, *Settings*, *Environment Variables* :

| Variable | Valeur | Scopes |
|---|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Le DSN copié | Production **et** Preview |
| `SENTRY_ORG` | Le *slug* de l'organisation Sentry | Production et Preview |
| `SENTRY_PROJECT` | `mototrack` | Production et Preview |

> **Ne pas cocher « Sensitive »** sur ces variables : le pipeline les lit via
> `vercel env pull`, et une variable marquée sensible en ressort vide. C'est exactement la
> cause de l'anomalie MCO-03.

5. Redéployer pour que le DSN soit pris en compte.

### A4. Sonde externe UptimeRobot

Créer un compte sur `uptimerobot.com` (gratuit, 50 sondes, intervalle 5 min), puis
*Add New Monitor* :

| Paramètre | Valeur |
|---|---|
| Monitor Type | **HTTP(s), Keyword** |
| Friendly Name | `MotoTrack production` |
| URL | `https://<production>/api/health` |
| Keyword Type | *exists* |
| Keyword | `"status":"ok"` |
| Monitoring Interval | 5 minutes |
| Alert Contacts | l'adresse e-mail du compte |

> Le type **Keyword** est important : un simple contrôle HTTP validerait une réponse 200
> `status: degraded`. Ici, la disparition du mot-clé signale aussi la dégradation.

### A5. Alertes Dependabot

GitHub, **Settings**, *Code security and analysis*, activer **Dependabot alerts** et
**Dependabot security updates**. Le fichier `.github/dependabot.yml` gère les mises à jour
de version ; ces deux interrupteurs activent en plus les alertes de vulnérabilité.

### A6. Tags Git et Releases

Les versions du CHANGELOG doivent être ancrées par des tags. À exécuter après avoir
committé le travail en cours :

```bash
git tag -a v1.0.1 03bc3ae -m "Correctifs prerendu + localisation FR"
git tag -a v1.1.0 ecb5d5c -m "Supabase, CI seul deployeur, previews par PR"
git tag -a v1.1.1 7f8c78c -m "Montee de securite Next 14.2.35"
git tag -a v1.2.0 a265c88 -m "PWA hors-ligne, Speed Insights"
git tag -a v1.3.0 -m "Supervision, alerte, collecte d'incidents, veille"   # sur HEAD
git push origin --tags
```

Puis GitHub, **Releases**, *Draft a new release*, choisir chaque tag et coller la section
correspondante du `CHANGELOG.md`. C'est ce qui rend le journal des versions consultable
sans cloner le dépôt.

---

## Partie 2 : exercices de vérification du dispositif

Deux captures parmi les plus démonstratives supposent de **provoquer volontairement** un
incident. C'est une pratique normale : un dispositif d'alerte jamais déclenché n'est pas un
dispositif vérifié. **Présentez-les comme telles**, « exercice de vérification du
28/07/2026 », jamais comme un incident subi.

### E1. Vérifier la chaîne d'alerte de bout en bout

1. Modifier temporairement `PRODUCTION_URL` en une URL invalide, par exemple
   `https://mototrack.vercel.app/inexistant`.
2. GitHub, **Actions**, *Supervision production*, **Run workflow**.
3. Le workflow effectue 3 tentatives (environ 40 s) puis **ouvre une issue `[INCIDENT]`**.
   Ce sont les captures **C3** (l'issue) et **C4** (l'exécution en échec).
4. Rétablir la bonne valeur de `PRODUCTION_URL`.
5. Relancer le workflow : il commente l'issue avec le relevé de retour à la normale et **la
   referme automatiquement**. C'est la capture **C5**.

### E2. Vérifier la remontée d'erreurs vers Sentry

Sur l'environnement **Preview** uniquement, jamais en production :

1. Vercel, *Settings*, *Environment Variables*, scope **Preview**, remplacer temporairement
   `DATABASE_URL` par une valeur injoignable.
2. Redéployer la preview et ouvrir `/api/health` : la réponse est 503 (`db: unreachable`).
3. La route appelle `logger.error(...)`, que le transport Winston relaie à Sentry.
4. Sentry, *Issues* : l'événement `Health check failed, DB unreachable` apparaît, avec sa
   trace, son `environment: preview` et son `release`. Ce sont les captures **C11** et
   **C12**.
5. Rétablir `DATABASE_URL` et redéployer.

---

## Partie 3 : captures à insérer

21 captures. La colonne « Section » indique où les référencer dans
`docs/rapport-maintenance.md`.

### Supervision et alerte

| N° | Capture | Où l'obtenir | Section |
|---|---|---|---|
| **C1** | Réponse JSON de `/api/health` en production | Navigateur sur `https://<production>/api/health`, ou `curl -s .../api/health \| jq` pour un rendu plus lisible | 2.1.3 |
| **C2** | Exécution réussie de la sonde planifiée, avec le résumé « Sonde OK » | Actions, *Supervision production*, une exécution verte, bas de page (*Summary*) | 2.1.3 |
| **C3** | **Issue `[INCIDENT]` ouverte automatiquement**, avec le tableau d'indicateurs et la conduite à tenir | Exercice E1, étape 3 | 2.1.4 |
| **C4** | Exécution du workflow en échec montrant les 3 tentatives | Exercice E1, dérouler l'étape *Interroger la sonde de santé* | 2.1.3 |
| **C5** | Commentaire de retour à la normale et issue refermée, avec la durée d'indisponibilité calculée | Exercice E1, étape 5 | 2.1.4 |
| **C6** | Tableau de bord UptimeRobot : sonde active, intervalle 5 min, taux de disponibilité | uptimerobot.com, après quelques heures de fonctionnement | 2.1.3 |
| **C7** | Contact d'alerte UptimeRobot configuré, ou un e-mail d'alerte reçu | UptimeRobot, *My Settings*, *Alert Contacts* | 2.1.4 |

### Consignation des anomalies

| N° | Capture | Où l'obtenir | Section |
|---|---|---|---|
| **C8** | Écran de choix des modèles d'issue, les 3 modèles et les issues vierges désactivées | GitHub, Issues, *New issue* | 3.1.3 |
| **C9** | Le formulaire `anomalie.yml` déployé, champs obligatoires visibles | Cliquer *Get started* sur « Anomalie » | 3.1.3 |
| **C10** | Une issue d'anomalie renseignée de bout en bout | Créer une issue réelle à partir d'un constat existant, par exemple l'avertissement `<img>` sur `/news` | 3.1.3 |
| **C11** | Liste des événements Sentry | Exercice E2, étape 4 | 3.1.4 |
| **C12** | Détail d'un événement Sentry : trace, `environment`, `release`, données contextuelles | Cliquer sur l'événement de C11 | 3.1.4 |

### Journal des versions

| N° | Capture | Où l'obtenir | Section |
|---|---|---|---|
| **C13** | Extrait du `CHANGELOG.md` montrant deux versions et une entrée de correctif | Le fichier lui-même, versions 1.2.0 et 1.3.0 | 4.1.2 |
| **C14** | Page **Releases** ou **Tags** du dépôt, listant `v1.0.1` à `v1.3.0` | GitHub, onglet *Tags*, après A6 | 4.1.3 |

### Dépendances, déploiement, améliorations

| N° | Capture | Où l'obtenir | Section |
|---|---|---|---|
| **C15** | Résumé de job « Audit des dépendances », le tableau production / complet | Actions, une exécution de *MotoTrack CI*, bas de page (*Summary*) | 2.2.2 |
| **C16** | Une Pull Request Dependabot, montrant le pipeline qui s'exécute dessus | Attendre le lundi suivant, ou Insights, *Dependency graph*, *Dependabot*, *Check for updates* | 2.2.2 |
| **C17** | Pipeline complet vert, avec le job `deploy` en aval de `test-and-build` | Actions, une exécution sur `main`, vue du graphe des jobs | 3.2.1 |
| **C18** | Commentaire automatique de preview sur une PR : URL et lien vers la sonde | Une PR récente, par exemple #11 | 3.2.1 |
| **C19** | Vercel Speed Insights : LCP, INP, CLS | Vercel, projet, onglet *Speed Insights* | 4.2.1 |
| **C20** | Sortie de `npm run test` : 157 tests, 25 suites, tableau de couverture | Terminal local | Annexe B |
| **C21** | Sortie de `npm run build` : tableau des tailles de page | Terminal local, la ligne `/` à 255 kB et 457 kB | 4.2.1 |

> **C19 n'aura de données que si l'application a reçu du trafic.** Sans trafic, capturez
> l'écran vide et dites-le : « aucune donnée, faute d'utilisateurs » est cohérent avec
> l'avertissement de sincérité de la section 1.2 et vaut mieux qu'une capture absente sans
> explication.

---

## Partie 4 : mise en page

- **Numéroter et légender chaque capture** : « Figure C3, issue d'incident ouverte
  automatiquement par la sonde (exercice de vérification du 28/07/2026) ». Une capture sans
  légende ne prouve rien à un lecteur qui ne connaît pas le projet.
- **Ne pas insérer de capture de code source.** Les extraits du rapport sont déjà en texte,
  citables et lisibles ; une capture d'éditeur est moins lisible et n'apporte rien.
- **Masquer le DSN Sentry** s'il apparaît dans une capture d'URL ou de configuration.
- **Les captures comptent dans la pagination.** Le corps du rapport, sections 1 à 5, tient
  entre 19 et 21 pages selon la mise en forme. Avec 21 captures, la limite de 20 pages sera
  dépassée : placez les captures **en annexe F**, référencées depuis le texte par
  « (fig. C3) ». Les annexes sont hors décompte.
- **Si le corps dépasse malgré tout**, deux blocs peuvent partir en annexe sans rien
  affaiblir d'essentiel : la section 2.2.4 (analyse d'atteignabilité `tar` et `lodash`,
  environ trois quarts de page, déjà intégralement reprise dans
  `docs/politique-dependances.md`) et la section 4.3.2 (scénario de traitement, environ une
  page). Ne pas toucher aux sections 2.1, 3.1 et 4.1.
