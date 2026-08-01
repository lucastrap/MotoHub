# Supervision de MotoTrack

Ce qui est surveillé en production, avec quels seuils, et la marche à suivre quand une alerte tombe. Dernière mise à jour : 28/07/2026.

## 1. Périmètre

| Composant | Supervisé | Défaillance possible |
|---|---|---|
| Application Next.js (Vercel) | oui | Déploiement cassé, fonction en erreur, quota atteint |
| Base PostgreSQL (Supabase) | oui | Instance suspendue, pooler saturé, quota dépassé |
| Authentification (JWT) | indirectement | Secret absent ou invalide, plus aucune connexion possible |
| API NHTSA (modèles de motos) | non | Service tiers indisponible |
| Flux RSS Google News | non | Flux indisponible |
| API météo | non | Service tiers indisponible |

Les trois services tiers alimentent des pages secondaires. Leur indisponibilité ne touche ni le garage ni le suivi d'entretien, et je ne peux de toute façon ni la corriger ni la contourner : une alerte sans action associée finit par être ignorée.

L'authentification est couverte indirectement. `getJwtSecretKey()` provoque un arrêt immédiat si le secret manque, donc la sonde tombe avec le reste.

## 2. Indicateurs et seuils

Disponibilité :

| Indicateur | Source | Seuil |
|---|---|---|
| Code HTTP de `/api/health` | sonde | ≠ 200 |
| Champ `status` | sonde | `error` |
| `latencyMs` (aller-retour base) | sonde | > 500 ms, état `degraded` |
| Temps de réponse total | curl | > 15 s (délai d'attente) |
| Disponibilité mensuelle | UptimeRobot | < 99 % |

Erreurs applicatives : toute occurrence est remontée dans Sentry, qu'il s'agisse d'une exception non rattrapée, d'un `logger.error(...)` ou d'un `logger.warn(...)`.

Expérience utilisateur : LCP > 2,5 s, INP > 200 ms, CLS > 0,1, mesurés par Vercel Speed Insights. Ce sont les seuils Core Web Vitals publiés par Google.

Sur le seuil de 500 ms : la latence observée via le pooler Supabase se compte en dizaines de millisecondes. Plus bas, chaque démarrage à froid d'une fonction serverless déclencherait une alerte. Plus haut, l'utilisateur aurait déjà abandonné. Le seuil est déclaré dans `src/lib/supervision.ts` et repris par la route, les tests et la réponse de la sonde (champ `thresholdMs`), pour qu'il ne puisse pas diverger d'un endroit à l'autre.

## 3. Sondes

### 3.1 `GET /api/health`

```jsonc
{
  "status": "ok",              // ok | degraded | error
  "db": "connected",
  "latencyMs": 38,             // aller-retour réel vers PostgreSQL
  "timestamp": "2026-07-28T09:15:04.221Z",
  "version": "1.2.0",
  "environment": "production",
  "commit": "a265c88",         // rattache l'alerte au déploiement exact
  "uptimeSeconds": 1042,
  "checks": {
    "database": { "status": "ok", "latencyMs": 38, "thresholdMs": 500 }
  }
}
```

Trois points de conception :

- La sonde exécute un vrai `SELECT 1` au lieu de renvoyer un statut constant. Une sonde qui répond OK pendant que la base est morte donne une fausse assurance.
- `export const dynamic = "force-dynamic"` est indispensable : sans cette directive, Next met la route en cache au build et la sonde renverrait indéfiniment l'état constaté à la compilation, application éteinte comprise.
- Le mode dégradé répond 200 et non 503. Un 503 déclencherait le retrait du trafic par les mécanismes amont alors que le service, lent, fonctionne toujours.

### 3.2 Sonde interne (GitHub Actions)

`.github/workflows/supervision.yml`, exécution planifiée toutes les 15 minutes. Anti-rebond : trois tentatives espacées de 20 secondes avant de déclarer un incident, pour ne pas alerter sur un aléa réseau isolé.

### 3.3 Sonde externe (UptimeRobot)

La sonde interne ne peut pas se surveiller elle-même : GitHub exécute les tâches planifiées en « meilleur effort », sans garantie de ponctualité, donc l'absence d'alerte ne prouve rien.

| Paramètre | Valeur |
|---|---|
| Type | HTTP(s) avec recherche de mot-clé |
| URL | `https://<production>/api/health` |
| Mot-clé attendu | `"status":"ok"` |
| Intervalle | 5 minutes |
| Alerte | Courriel, après 1 échec confirmé |

UptimeRobot sert de source de vérité pour le taux de disponibilité ; la sonde interne sert à ouvrir un ticket automatiquement.

### 3.4 Collecteur d'erreurs (Sentry)

Une sonde de disponibilité ne voit que « l'application répond ou non ». Elle ne voit pas l'erreur qui frappe un seul utilisateur sur un seul parcours.

- Le SDK `@sentry/nextjs` capture les exceptions non rattrapées côté navigateur, côté serveur et dans le runtime Edge.
- Un transport Winston (`src/lib/sentryTransport.ts`) remonte en plus les erreurs rattrapées. Les routes API interceptent leurs erreurs et répondent en 500 ; sans ce pont, elles n'apparaîtraient nulle part.

Données personnelles : `sendDefaultPii: false`, corps de requête et cookies retirés dans `beforeSend`, masquage intégral du texte dans les rejeux de session. Le corps d'une requête `/api/auth/*` contient un mot de passe.

## 4. Signalement

| Événement | Canal | Délai de détection |
|---|---|---|
| Application injoignable | Courriel UptimeRobot | ≤ 5 min |
| Application injoignable, confirmée 3 fois | Issue GitHub `incident` + notification | ≤ 15 min |
| Retour à la normale | Commentaire et clôture automatique de l'issue | ≤ 15 min |
| Erreur serveur non rattrapée | Courriel Sentry | immédiat |
| Latence base > 500 ms | Message Sentry, niveau `warning` | immédiat |
| Vulnérabilité de dépendance | Pull request Dependabot | hebdomadaire |

Le canal principal est l'issue GitHub plutôt que le courriel, parce qu'elle porte un état ouvert/fermé, un horodatage de début et de fin, et qu'elle se retrouve six mois plus tard. Le workflow commente l'issue existante au lieu d'en créer une seconde, et la referme en calculant la durée d'indisponibilité. Le registre d'incidents se remplit donc sans intervention.

Il n'y a ni astreinte, ni escalade, ni destinataire de repli : je suis seul sur le projet. Une alerte reçue à 3 h du matin sera traitée le matin. C'est acceptable pour un carnet d'entretien consulté quelques fois par mois, ça ne le serait pas pour un service transactionnel.

## 5. Runbook : levée d'une alerte d'indisponibilité

**1. Confirmer.**

```bash
curl -i https://<production>/api/health
```

- 200 : fausse alerte. Consigner en commentaire, refermer, et regarder quel réglage l'a produite.
- 503 : la base est en cause, passer en 2.
- Aucune réponse ou délai dépassé : l'application est en cause, passer en 3.

**2. Base injoignable.** Vérifier l'état de l'instance sur le tableau de bord Supabase : suspension pour inactivité, quota dépassé, incident fournisseur. Vérifier ensuite que `DATABASE_URL` pointe sur le pooler (port 6543) dans le scope Production de Vercel, une connexion directe depuis une fonction serverless épuisant le nombre de connexions.

**3. Application injoignable.** Ouvrir les journaux de la fonction sur Vercel. Comparer le champ `commit` de la dernière réponse saine avec le déploiement courant. Si l'incident suit un déploiement, faire le retour arrière d'abord et analyser ensuite : Vercel → Deployments → dernier déploiement stable → Promote to Production.

**4. Qualifier et consigner.** Suivre `docs/procedure-incidents.md` : sévérité, cause racine, correctif, test de non-régression.

**5. Renseigner la cause racine avant clôture.** L'issue se referme automatiquement au retour à la normale, mais un incident refermé sans cause identifiée reviendra.

## 6. Limites connues

- L'ouverture d'incident a une granularité de 15 minutes. Une panne de dix minutes entre deux exécutions peut échapper à la sonde interne ; UptimeRobot, à 5 minutes, réduit l'angle mort sans le supprimer.
- La volumétrie de la base n'est pas surveillée. Une saturation du quota de stockage Supabase produirait une panne que la sonde signalerait sans l'expliquer.
- Il n'y a pas de tableau de bord unifié : les indicateurs sont répartis entre Vercel, Sentry et UptimeRobot. Praticable pour un mainteneur unique, insuffisant pour une équipe d'astreinte.

Ces trois points sont documentés plutôt que corrigés : au regard de l'usage réel de l'application, les corriger coûterait plus cher que le risque qu'ils portent.
