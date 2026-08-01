# Exercice de validation de la chaîne d'alerte

Ce document décrit un exercice à mener, pas un incident survenu. Il produit la preuve
qui manque aujourd'hui au dossier : une alerte réellement déclenchée, une issue
réellement ouverte par la supervision, un incident réellement clos avec une durée
mesurée.

**Règle de sincérité, non négociable.** L'exercice est une panne provoquée. Il est daté
et déclaré comme tel partout où il est cité   rapport, registre, CHANGELOG. Le présenter
comme un incident spontané transformerait la seule qualité que ce dossier revendique,
la vérifiabilité, en fabrication.

---

## 1. Préalable bloquant : les modèles d'issue ne sont pas dans le dépôt

État constaté au 29 juillet 2026 :

```
SUIVI      .github/ISSUE_TEMPLATE/config.yml          (blank_issues_enabled: false)
NON SUIVI  .github/ISSUE_TEMPLATE/anomalie.yml
NON SUIVI  .github/ISSUE_TEMPLATE/incident-production.yml
NON SUIVI  .github/ISSUE_TEMPLATE/amelioration.yml
```

Conséquence : sur GitHub aujourd'hui, `config.yml` interdit les issues vierges et aucun
modèle ne les remplace. **Personne ne peut ouvrir la moindre issue sur le dépôt.** Le
dispositif de collecte décrit en section 3.1 du rapport n'existe pas côté serveur, et
l'étape 3 ci-dessous échouerait.

À faire avant tout le reste :

```bash
git add .github/ISSUE_TEMPLATE/anomalie.yml \
        .github/ISSUE_TEMPLATE/incident-production.yml \
        .github/ISSUE_TEMPLATE/amelioration.yml
git commit -m "chore(issues): ajoute les trois modeles d'issue manquants"
git push
```

Vérifier ensuite sur `github.com/lucastrap/MotoHub/issues/new/choose` que les trois
modèles apparaissent.

## 2. Second préalable : la variable `PRODUCTION_URL`

Le job de `.github/workflows/supervision.yml` est ignoré tant que la variable de dépôt
`PRODUCTION_URL` n'est pas définie. Si elle n'a jamais été renseignée, la sonde planifiée
n'a jamais rien interrogé depuis le 28 juillet, et l'historique des exécutions le montrera
sous forme d'exécutions ignorées (*skipped*).

À vérifier dans *Settings → Secrets and variables → Actions → Variables*, puis à
contrôler par un déclenchement manuel (`workflow_dispatch`) qui doit se terminer en
succès avec « Sonde OK ».

C'est aussi le premier chiffre réel à récupérer pour le rapport : le nombre d'exécutions
de `supervision.yml` depuis le 28 juillet et leur taux de succès. S'il est nul, la phrase
« la sonde planifiée tourne toutes les 15 minutes » est à corriger.

---

## 3. L'exercice

**Panne retenue : mise en pause de l'instance Supabase.** C'est la seule qui exerce
réellement toute la chaîne   le `SELECT 1` de la sonde échoue pour de vrai, l'application
reste debout et répond, `status` passe à `error`, et la panne est réversible en un clic.
Modifier `PRODUCTION_URL` pour la faire pointer vers une URL invalide serait plus simple
mais ne prouverait rien : ça teste `curl`, pas la supervision.

| Étape | Action | Preuve produite |
|---|---|---|
| T0 | Noter l'heure. Mettre l'instance Supabase en pause | Horodatage de départ |
| T0+1 | `curl -i <URL>/api/health` depuis un poste | Réponse réelle en `status: error`, à copier |
| T0+2 | Déclencher `supervision.yml` manuellement (`workflow_dispatch`) | Exécution en échec après 3 tentatives, résumé de job |
| T0+5 | Vérifier l'ouverture de l'issue `[INCIDENT]` | Issue réelle, numérotée, avec le relevé d'indicateurs |
| T0+15 | Laisser passer une exécution planifiée | Commentaire « Incident toujours en cours » |
| T0+20 | Relancer l'instance Supabase | Horodatage de rétablissement |
| T0+22 | Déclencher `supervision.yml` manuellement | Commentaire de retour à la normale, clôture automatique, durée calculée |
| T0+30 | Relever la courbe UptimeRobot | Creux de disponibilité daté, premier taux réel |

Compter 35 à 40 minutes. Laisser au moins une exécution planifiée tomber pendant la
panne : c'est ce qui démontre la granularité de 15 minutes annoncée dans le rapport,
alors que les déclenchements manuels ne démontrent que le mécanisme.

**Vérifier aussi que Sentry a reçu quelque chose.** Si aucune requête utilisateur n'a
lieu pendant la panne, le collecteur restera muet et c'est normal ; il suffit de charger
une page qui lit la base pour provoquer un `logger.error` réel et le voir remonter.

## 3 bis. Exercer aussi le chemin « dégradation » (version 1.3.1)

La panne de la section 3 met la sonde en `error`, pas en `degraded` : elle n'exerce donc
**pas** l'escalade ajoutée en 1.3.1, qui ouvre une issue majeure après trois exécutions
consécutives au-dessus du seuil de latence. Les deux chemins sont distincts et se
démontrent séparément.

Pour exercer celui-là sans ralentir la base pour de vrai, abaisser temporairement le
seuil au lieu de dégrader le service : dans `src/lib/supervision.ts`, passer
`DB_LATENCY_DEGRADED_MS` de 1000 à 1, déployer, et toute réponse normale sera lue comme
dégradée. Trois exécutions planifiées plus tard   45 minutes   l'issue `[DÉGRADATION]`
s'ouvre seule. Rétablir ensuite la valeur à 1000 : l'exécution suivante commente le retour
à la normale et referme l'issue.

Preuves à capturer : les trois exécutions successives montrant le compteur monter
(« Dégradations consécutives : 1, 2, 3 » dans les annotations de job), l'issue ouverte
avec son tableau d'indicateurs, et le commentaire de clôture.

Cet exercice modifie une constante du code : il se mène sur une branche, pas sur `main`,
et le retour à 1000 doit être vérifié avant toute autre livraison. Comme le précédent, il
se déclare pour ce qu'il est   un seuil abaissé volontairement, pas une base réellement
lente.

## 4. Ce qu'il faut capturer pendant

Rien de tout cela n'est reconstituable après coup. Capturer au fil de l'eau :

1. la réponse `curl` complète en `status: error` ;
2. la liste des exécutions de `supervision.yml`, montrant l'échec encadré de succès ;
3. le résumé du job en échec (« Sonde EN ÉCHEC : HTTP … (3 tentatives) ») ;
4. l'issue ouverte, tableau d'indicateurs visible ;
5. le fil de l'issue : commentaire de persistance, commentaire de rétablissement,
   mention de clôture avec la durée ;
6. la courbe UptimeRobot sur la journée ;
7. l'événement Sentry, si provoqué.

## 5. Ce qu'il faut écrire après

**Registre**   ajouter MCO-05 dans `docs/procedure-incidents.md` § 5, au format des
quatre autres fiches, avec la mention explicite « panne provoquée, exercice de
validation du <date> ». Canal de détection : sonde. Cette ligne fait passer la
répartition par canal de « sonde ou collecteur 0 » à 1.

**Rapport**   trois endroits :

- § 2.2, après les modalités de signalement : un paragraphe court donnant le résultat
  mesuré (délai réel entre la panne et l'ouverture de l'issue, durée calculée par le
  workflow, écart avec les 15 minutes annoncées) ;
- § 3.1, tableau du registre : la ligne MCO-05 et la répartition par canal corrigée ;
- § 5, remplacer « Le dispositif n'a jamais été éprouvé par un incident réel » par ce
  qui sera alors vrai : éprouvé par un exercice provoqué et daté, toujours pas par un
  incident subi. La nuance se garde, elle est honnête et elle tient.

**Taux de disponibilité**   le rapport déclare UptimeRobot « source de vérité du taux de
disponibilité » sans citer aucun pourcentage. Relever la valeur réelle sur la période
observée et l'inscrire en § 2.2, même si la période est courte : un chiffre mesuré sur
dix jours vaut mieux qu'un seuil annoncé sans mesure.

---

## 6. Deuxième volet : faire servir les modèles d'issue

L'exercice ci-dessus fait ouvrir une issue par le workflow. Il n'en fait toujours ouvrir
aucune par un humain via `anomalie.yml` ou `amelioration.yml`. Quatre défauts réels,
connus, ouverts et déjà cités dans le rapport peuvent être consignés aujourd'hui sans
rien inventer et sans antidater :

| Modèle | Sujet | Source dans le rapport |
|---|---|---|
| `anomalie.yml` | Avertissement lint `<img>` sur `/news` | Annexe B |
| `amelioration.yml` | Logique du tableau de bord hors couverture Jest | § 4.1, axe 2 |
| `amelioration.yml` | CSP en `Report-Only` avec `unsafe-inline` et `unsafe-eval` | § 4.1, axe 3 |
| `amelioration.yml` | Remplacement de `next-pwa` par `@serwist/next` | § 4.1, axe 4 |

Ces issues sont datées d'aujourd'hui et portent sur des défauts qui existent
aujourd'hui : elles sont vraies. Elles donnent au registre des numéros d'issue réels
auxquels le tableau d'arbitrage de la § 4.1 peut renvoyer, ce qui rattache les axes
d'amélioration à des tickets et non à un tableau rédigé dans un rapport.

**Ce qu'il ne faut pas faire** : ouvrir aujourd'hui des issues pour MCO-01 à MCO-04. Ces
anomalies datent de juillet et sont closes ; leur créer des tickets rétroactifs
produirait des artefacts dont la date contredit le récit, et le premier `git log` venu
le montrerait.

## 7. Volet optionnel : un observateur de premier niveau

Si tu veux que la section 4.3 repose sur autre chose qu'une mise en situation, l'exercice
de la section 3 suffit à l'accueillir sans travail supplémentaire : une personne, une
heure, à qui tu donnes le runbook et l'adresse de la sonde, et qui te signale la panne
avec ses propres mots pendant que tu la provoques. Elle ouvre l'issue depuis
`anomalie.yml`, consulte `/api/health`, reçoit ta réponse écrite. La trace est le fil de
l'issue.

C'est facultatif et ça ne change rien au reste du dossier. Si tu ne le fais pas, la
section 4.3 reste ce qu'elle est aujourd'hui, une mise en situation déclarée.
