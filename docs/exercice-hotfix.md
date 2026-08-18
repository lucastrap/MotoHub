# Exercice de validation de la procédure de correctif à chaud

Ce document décrit un exercice à mener, pas un incident survenu. Il produit la preuve
qui manque au dossier après l'exercice de la chaîne d'alerte (`exercice-incident.md`) :
une anomalie **bloquante** réellement traitée par le circuit `hotfix/`, un retour arrière
réellement effectué par promotion Vercel, et un report réellement fait sur `develop`.

**Règle de sincérité, non négociable.** Le défaut est introduit volontairement. Il est daté
et déclaré comme tel partout où il est cité — registre (MCO-06), CHANGELOG (1.3.2), rapport
(§4.5). Le présenter comme un incident subi transformerait en fabrication la seule qualité
que ce dossier revendique. Le diagnostic sera immédiat puisque je connais le défaut :
la durée mesurée entre détection et correctif est donc une **borne basse**, ce qui est écrit
noir sur blanc dans le rapport.

---

## 1. Le défaut retenu

Cible : `POST /api/maintenances`, la construction de la date d'intervention.

```
-      date: new Date(parsedData.date),
+      // Enregistre la date au format jour/mois/année.
+      date: new Date(parsedData.date.split("-").reverse().join("/")),
```

Cause racine réelle : la date arrive en ISO `YYYY-MM-DD`. La reformater en `jj/mm/aaaa` puis
la repasser à `new Date` est un piège classique : `new Date("15/04/2026")` interprète le
premier nombre comme le **mois**. Pour tout jour supérieur à 12, c'est une **Invalid Date**
que PostgreSQL rejette à l'écriture ; pour un jour inférieur ou égal à 12, la date est
silencieusement fausse (jour et mois permutés). Le défaut échoue donc franchement dans la
majorité des cas et corrompt en silence dans les autres.

Note de vérification : une première rédaction visait `T24:00:00` (censé être « minuit »),
écartée après contrôle — `new Date` fait rouler `T24:00:00` au lendemain minuit sans erreur,
PostgreSQL l'accepterait et rien ne remonterait. Le contrôle a été fait avant d'introduire le
défaut, pas après.

Ce défaut a été choisi pour quatre raisons, chacune exigée par l'exercice :

| Critère | Pourquoi il est satisfait |
|---|---|
| Parcours critique | La saisie d'entretien est l'un des trois parcours critiques (§4.1) : sévérité bloquante justifiée. |
| Traverse le pipeline | Le test unitaire de la route mocke Prisma et n'assère que le statut `201`, jamais la validité de la date passée à `create`. L'`Invalid Date` passe les 213 tests. Aucun test e2e ne crée d'entretien contre une vraie base. `new Date(...)` reste de type `Date`, donc `tsc`/`next build` ne voit rien. |
| Vu par Sentry, pas par la sonde | La route rattrape l'erreur et répond proprement en 500 (`logger.error` → transport Winston → `captureException`). `/api/health` ne fait qu'un `SELECT 1` : il reste `ok`. Seul le quatrième niveau du dispositif (Sentry) voit le défaut. |
| Retour arrière sans migration | Le schéma de base n'est pas modifié : la promotion du déploiement précédent suffit, aucune migration corrective n'est requise. |

Le correctif consiste à rétablir la forme d'origine `new Date(parsedData.date)`, qui reçoit la
chaîne ISO `YYYY-MM-DD` sans permutation.
Le test de non-régression, écrit **avant** le correctif, vérifie que la date transmise à
`prisma.maintenance.create` est valide (`Number.isNaN(date.getTime()) === false`) : il échoue
avec le défaut, passe après. Il comble exactement le trou qui a laissé passer la régression.

## 2. Les quatre interdits

Repris de la procédure de correctif à chaud (§4.4 du rapport et `procedure-incidents.md` §4.2) :

1. Ne désactiver aucun job du pipeline, même pour aller plus vite (c'est la leçon de MCO-04).
2. Ne pas écrire le correctif avant le test de non-régression, et vérifier que le test échoue d'abord.
3. Ne pas pousser le correctif directement sur `main` : il passe par une branche `hotfix/` et une PR.
4. Ne pas refermer l'issue avant le déploiement effectif du correctif en production.

Deux règles de fond de la procédure s'appliquent aussi : rétablir avant de comprendre
(promotion du dernier déploiement stable si la cause n'est pas trouvée en 15 minutes), et
report immédiat du correctif sur `develop` après la fusion sur `main`.

## 3. Déroulé horodaté

Noter l'heure réelle et l'artefact à chaque étape ; rien n'est reconstituable après coup.

| Étape | Action | Preuve à capturer |
|---|---|---|
| 1 | Commit du présent protocole, avant tout code | commit horodaté |
| 2 | Défaut poussé sur `main`, pipeline vert, déploiement production | run CI vert + job `deploy`, sha du défaut |
| 3 | Tentative de saisie d'entretien en prod (curl), sonde restée `ok` | réponse 500 du POST + réponse `status: ok` de `/api/health` |
| 4 | Détection par Sentry | événement Sentry horodaté |
| 5 | Ouverture de l'issue d'incident, sévérité bloquante | issue numérotée |
| 6 | Promotion du dernier déploiement stable sur Vercel | capture Vercel Deployments |
| 7 | Service rétabli, sonde `ok`, saisie de nouveau fonctionnelle | réponse 201 du POST après promotion |
| 8 | Branche `hotfix/` depuis `main`, test de non-régression écrit, en échec | commit du test |
| 9 | Correctif écrit, test vert | commit du correctif |
| 10 | PR vers `main`, pipeline complet vert | PR + run CI |
| 11 | Fusion sur `main`, job `deploy` réussi | run GitHub Actions |
| 12 | Issue refermée | issue |
| 13 | Report du correctif sur `develop` | commit |
| 14 | Entrée au CHANGELOG en 1.3.2, tag | CHANGELOG + tag |

Deux durées distinctes à mesurer et à ne pas confondre : détection → rétablissement du
service (subie par l'utilisateur, = promotion), et détection → mise en production du
correctif (subie par le mainteneur, inclut diagnostic, test, pipeline, déploiement).

## 4. Ce qu'il faut écrire après

- **Registre** — ajouter MCO-06 dans `procedure-incidents.md` §5, au format des autres fiches,
  avec la mention « défaut introduit volontairement, exercice de validation du <date> ».
- **CHANGELOG** — entrée 1.3.2 datée, citant le commit du correctif et déclarant l'exercice.
- **Rapport §4.5** — substituer les valeurs horodatées réelles aux 24 champs entre crochets,
  renseigner l'écart entre la procédure décrite et son exécution (même s'il est nul), puis
  supprimer le bloc d'avertissement « À COMPLÉTER APRÈS L'EXERCICE ».

## 5. Ce que l'exercice ne prouve pas

Le défaut était connu de moi, donc le diagnostic a été immédiat : la durée mesurée entre
détection et correctif est une borne basse. L'exercice valide le circuit `hotfix/`, le retour
arrière par promotion et le report sur `develop`. Il ne mesure ni le temps de diagnostic d'une
cause inconnue, ni le comportement du dispositif si le défaut avait touché le schéma de base,
cas où le retour arrière aurait exigé une migration corrective.
