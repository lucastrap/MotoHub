# Cahier de recettes — MotoTrack

## Informations générales

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version testée | 1.0.0 |
| Environnement | localhost:3000 + PostgreSQL Docker |
| Rédigé et exécuté par | Luca Straputicari |
| Date | 18 avril 2026 |

> **Note de méthode.** Le projet étant mené seul, la recette est rédigée et exécutée par la
> même personne que celle qui a développé l'application. C'est une limite réelle : un
> rédacteur qui connaît le code teste spontanément les chemins qu'il a prévus. Pour la
> réduire, les scénarios ont été dérivés des user stories du Bloc 1 (et non du code), et
> chaque fonctionnalité clé décline au moins un cas nominal, un cas d'erreur et un cas
> limite. La majorité des scénarios est en outre rejouée automatiquement à chaque push,
> ce qui les soustrait à ma bienveillance de relecteur.

---

## Module 1 — Authentification

### RT-01 : Inscription d'un nouvel utilisateur

| Champ | Détail |
|---|---|
| Précondition | Aucun compte existant avec cet email |
| Étapes | 1. Accéder à `/register` · 2. Renseigner nom, email, mot de passe · 3. Soumettre |
| Résultat attendu | Redirection vers `/dashboard`, cookie `token` posé |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-02 : Inscription avec email déjà utilisé

| Champ | Détail |
|---|---|
| Précondition | Compte existant avec l'email `test@mototrack.local` |
| Étapes | 1. Accéder à `/register` · 2. Saisir l'email déjà enregistré · 3. Soumettre |
| Résultat attendu | Message d'erreur affiché, pas de redirection |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-03 : Connexion avec identifiants valides

| Champ | Détail |
|---|---|
| Précondition | Compte existant |
| Étapes | 1. Accéder à `/login` · 2. Saisir email et mot de passe corrects · 3. Soumettre |
| Résultat attendu | Redirection vers `/dashboard` |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-04 : Connexion avec mot de passe incorrect

| Champ | Détail |
|---|---|
| Précondition | Compte existant |
| Étapes | 1. Accéder à `/login` · 2. Saisir mot de passe erroné · 3. Soumettre |
| Résultat attendu | Message d'erreur, pas de redirection |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-05 : Accès à une page protégée sans être connecté

| Champ | Détail |
|---|---|
| Précondition | Utilisateur non connecté (pas de cookie `token`) |
| Étapes | 1. Accéder directement à `/dashboard` |
| Résultat attendu | Redirection automatique vers `/login` |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

---

## Module 2 — Gestion du garage

### RT-06 : Ajout d'une moto — formulaire complet

| Champ | Détail |
|---|---|
| Précondition | Utilisateur connecté |
| Données de test | Marque : Yamaha · Modèle : MT-07 · Année : 2022 · Kilométrage : 12 500 · Plaque : AB-123-CD |
| Étapes | 1. Accéder à `/garage/new` · 2. Compléter les 3 étapes du wizard · 3. Soumettre |
| Résultat attendu | Moto créée, visible dans `/garage` |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-07 : Ajout d'une moto — format immatriculation invalide

| Champ | Détail |
|---|---|
| Données de test | Plaque : `123ABC` (hors format SIV) |
| Étapes | 1. Saisir une immatriculation invalide · 2. Soumettre |
| Résultat attendu | Erreur de validation affichée, formulaire non soumis |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-08 : Définir une moto comme principale

| Champ | Détail |
|---|---|
| Précondition | Compte avec 2 motos : Yamaha MT-07 et Honda CB650R |
| Étapes | 1. Accéder à `/garage` · 2. Cliquer "Définir comme moto principale" sur la Honda |
| Résultat attendu | Badge "Principale" sur la Honda, retiré de la Yamaha |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-09 : Autocomplete modèle via NHTSA

| Champ | Détail |
|---|---|
| Étapes | 1. Wizard step 1 — sélectionner "Yamaha" + année 2022 · 2. Cliquer dans le champ Modèle |
| Résultat attendu | Liste de modèles Yamaha 2022 proposée (MT-07, MT-09, R1…) |
| Résultat obtenu | Conforme — 12 modèles retournés |
| Statut | ✅ Passé |

---

## Module 3 — Entretien

### RT-10 : Ajout d'une intervention

| Champ | Détail |
|---|---|
| Données de test | Moto : Yamaha MT-07 · Type : Vidange · Date : 15/04/2026 · Km : 13 200 · Coût : 89€ |
| Étapes | 1. Accéder à `/maintenance/new` · 2. Remplir le formulaire · 3. Soumettre |
| Résultat attendu | Intervention enregistrée, visible dans le carnet |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-11 : Mise à jour automatique du kilométrage

| Champ | Détail |
|---|---|
| Précondition | Moto à 12 500 km |
| Étapes | 1. Ajouter une intervention à 13 200 km · 2. Consulter la fiche moto |
| Résultat attendu | Kilométrage moto mis à jour à 13 200 km automatiquement |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

### RT-12 : Filtre par moto dans l'historique

| Champ | Détail |
|---|---|
| Précondition | 2 motos avec des interventions distinctes |
| Étapes | 1. Accéder à `/maintenance` · 2. Cliquer sur le chip "Yamaha MT-07" |
| Résultat attendu | Seules les interventions de la MT-07 affichées |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

---

## Module 4 — Tableau de bord

### RT-13 : Affichage de la dernière intervention

| Champ | Détail |
|---|---|
| Précondition | Au moins une intervention enregistrée pour la moto principale |
| Étapes | 1. Accéder à `/dashboard` |
| Résultat attendu | Type, description, date et kilométrage de la dernière intervention affichés |
| Résultat obtenu | Conforme — vidange du 15/04/2026 affichée |
| Statut | ✅ Passé |

### RT-14 : Affichage des prochaines échéances

| Champ | Détail |
|---|---|
| Étapes | 1. Accéder à `/dashboard` |
| Résultat attendu | 4 échéances calculées (vidange, chaîne, freins, pneus) avec km cible |
| Résultat obtenu | Conforme — prochaine vidange à 19 200 km affichée |
| Statut | ✅ Passé |

---

## Module 5 — Supervision

### RT-15 : Endpoint de santé

| Champ | Détail |
|---|---|
| Étapes | 1. Appeler `GET /api/health` |
| Résultat attendu | HTTP 200 · `{ status: "ok", db: "connected", latencyMs: <100 }` |
| Résultat obtenu | HTTP 200 · `{ status: "ok", db: "connected", latencyMs: 4 }` |
| Statut | ✅ Passé |

---

## Module 6 — Sécurité (contrôle d'accès)

### RT-16 : Isolation des données entre utilisateurs

| Champ | Détail |
|---|---|
| Type | Test de sécurité (contrôle d'accès — OWASP A01) |
| Précondition | Utilisateur A connecté ; une moto appartient à l'utilisateur B |
| Étapes | 1. Appeler `PATCH /api/motorcycles/{id_moto_B}` avec la session de A |
| Résultat attendu | HTTP 404 — la ressource d'autrui est invisible, aucune modification |
| Résultat obtenu | Conforme — 404 retourné |
| Statut | ✅ Passé |

### RT-17 : Rejet d'un jeton expiré ou invalide

| Champ | Détail |
|---|---|
| Type | Test de sécurité (authentification — OWASP A07) |
| Précondition | Cookie `token` altéré ou expiré |
| Étapes | 1. Accéder à `/dashboard` avec un jeton invalide |
| Résultat attendu | Redirection vers `/login` (jeton non vérifié) |
| Résultat obtenu | Conforme |
| Statut | ✅ Passé |

---

## Traçabilité — scénarios ↔ tests automatisés

Chaque scénario de recette est rejoué automatiquement (non-régression). Correspondance :

| Scénario | Test automatisé associé |
|---|---|
| RT-01 à RT-05 (auth) | `tests/e2e/auth.spec.ts`, `tests/unit/api/login.test.ts`, `register.test.ts` |
| RT-07 (format SIV) | `tests/unit/formatPlate.test.ts`, `motorcycleSchema.test.ts` |
| RT-10, RT-11 (entretien, km) | `tests/unit/api/maintenances.test.ts` |
| RT-15 (santé) | `tests/e2e/api-health.spec.ts`, `tests/unit/api/health.test.ts` |
| RT-16 (isolation) | `tests/unit/api/motorcycles-id.test.ts` (cas 404), `maintenances.test.ts` (cas 403) |
| RT-17 (jeton) | `tests/unit/middleware.test.ts`, `tests/unit/auth.test.ts` |

---

## Bilan

| Statut | Nombre |
|---|---|
| Passé | 17 |
| Echoué | 0 |
| Non testé | 0 |
| **Total** | **17** |

**Conclusion** : la campagne de recette finale, jouée le 18 avril 2026 sur la version 1.0.0,
ne révèle plus d'anomalie fonctionnelle : les 17 scénarios passent.

Cette conclusion mérite d'être lue avec les réserves suivantes, qui sont les miennes :

- **Ce résultat porte sur la recette finale, pas sur l'histoire du projet.** Les anomalies
  rencontrées au cours des incréments précédents sont consignées dans
  `suivi-avancement.md` (journal A-01 à A-07) et analysées dans `plan-correction-bogues.md`.
  Un cahier vert du premier coup n'existe pas ; celui-ci est vert *à la fin*.
- **11 des 17 scénarios sont adossés à des tests automatisés** (voir la table de traçabilité
  ci-dessus), rejoués à chaque push. Les 6 restants — RT-06 (ajout moto, formulaire complet),
  RT-08 (moto principale), RT-09 (autocomplete NHTSA), RT-12 (filtre historique),
  RT-13 et RT-14 (dashboard) — ne sont vérifiés que manuellement. C'est là que le risque de
  régression est le plus élevé, et c'est le premier chantier d'extension du harnais.
- **Aucun utilisateur externe n'a exécuté cette recette.** Elle valide la conformité aux
  spécifications que j'ai moi-même écrites, pas l'adéquation du produit à un besoin réel.
