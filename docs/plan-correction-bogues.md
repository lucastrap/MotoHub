# Plan de correction des bogues — MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version | 1.0.0 |
| Auteur | Luca Straputicari |
| Sources d'anomalies | Cahier de recettes, exécution CI, revue de code, audit qualité |
| Date | 21 avril 2026 |

## 1. Processus de traitement

Chaque anomalie suit un cycle formalisé :

1. **Détection** — recette manuelle (cahier de recettes), échec d'un test automatisé
   (Jest/Playwright), échec de pipeline CI, ou revue de code.
2. **Qualification** — enregistrement dans le suivi (GitHub Issues) avec :
   identifiant, sévérité (bloquant / majeur / mineur), composant, étapes de reproduction.
3. **Analyse** — recherche de la cause racine, identification du point d'amélioration.
4. **Correction** — développement du correctif sur une branche dédiée, ajout d'un test
   de non-régression.
5. **Vérification** — le test associé passe, la CI est verte, la recette est rejouée.
6. **Clôture** — fusion sur `main`, traçée dans le `CHANGELOG.md`.

**Échelle de sévérité :**

| Sévérité | Définition | Délai cible |
|---|---|---|
| 🔴 Bloquant | Empêche le build, le déploiement ou une fonctionnalité critique | Immédiat |
| 🟠 Majeur | Dégrade une fonctionnalité sans contournement simple | 48 h |
| 🟡 Mineur | Gêne cosmétique ou d'ergonomie, contournement possible | Prochaine itération |

---

## 2. Registre des anomalies détectées et traitées

### BUG-01 — Couverture de tests unitaires très insuffisante 🔴

| Champ | Détail |
|---|---|
| Détection | Audit qualité — `jest --coverage` |
| Analyse | La couverture de la couche logique s'établissait à **6,4 %** ; les seuils du projet étaient fixés artificiellement bas (5 %), masquant l'absence de tests sur les routes API, le middleware et les librairies. Risque de régression majeur et non-conformité au critère « les tests couvrent la majorité du code ». |
| Correction | Rédaction d'un harnais couvrant les routes `auth`, `motorcycles`, `maintenances`, `health`, `news`, `motorcycle-models`, le middleware et les librairies. Relèvement des seuils de couverture, rendus bloquants en CI (statements 90 %, functions 90 %, lines 90 %, branches 80 %). |
| Vérification | Harnais porté à **142 tests / 23 suites**, tous verts. Couverture de la couche logique : **95,94 % statements · 88,28 % branches · 98,14 % functions · 96,74 % lines** (mesure `jest --coverage`, cf. `jest.config.js`). |
| Statut | ✅ Résolu |

### BUG-02 — Jest exécutait les tests Playwright 🟠

| Champ | Détail |
|---|---|
| Détection | Exécution de `npm run test` — 2 suites en échec |
| Analyse | Jest ramassait les fichiers `tests/e2e/*.spec.ts` (destinés à Playwright), provoquant des erreurs d'import et un pipeline instable. Cause racine : absence de `testPathIgnorePatterns`. |
| Correction | Ajout de `testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/']` dans `jest.config.js`. |
| Vérification | Séparation nette : Jest (unitaire) / Playwright (e2e). Suites 100 % vertes. |
| Statut | ✅ Résolu |

### BUG-03 — Client Prisma périmé : erreur de typage `isPrimary` 🔴

| Champ | Détail |
|---|---|
| Détection | `tsc --noEmit` — `TS2353: 'isPrimary' does not exist` dans `api/motorcycles/[id]/route.ts` |
| Analyse | Le champ `isPrimary` existait bien dans `schema.prisma` mais le client Prisma généré n'avait pas été régénéré après migration. Le build de production aurait échoué. |
| Correction | Régénération du client via `npx prisma generate`. |
| Vérification | `tsc --noEmit` sans erreur. |
| Statut | ✅ Résolu |

### BUG-04 — Étape de lint CI bloquante (config ESLint absente) 🟠

| Champ | Détail |
|---|---|
| Détection | `npm run lint` — invite interactive (aucun `.eslintrc`) |
| Analyse | En l'absence de configuration ESLint, `next lint` passe en mode interactif : le job CI se serait bloqué ou aurait échoué. |
| Correction | Ajout de `.eslintrc.json` (`next/core-web-vitals`) avec ajustement raisonné de deux règles inadaptées à une application francophone (`react/no-unescaped-entities` désactivée, `no-img-element` en avertissement). |
| Vérification | `next lint` s'exécute sans interaction, code de sortie 0. |
| Statut | ✅ Résolu |

### BUG-05 — Absence d'accessibilité sur les formulaires 🟠

| Champ | Détail |
|---|---|
| Détection | Audit RGAA |
| Analyse | Les messages d'erreur des formulaires n'étaient pas exposés aux technologies d'assistance (pas de `role="alert"`, pas de `aria-invalid`/`aria-describedby`), aucun lien d'évitement, icônes non masquées, attributs d'autocomplétion absents. |
| Correction | Ajout des liaisons ARIA sur les formulaires login/register, lien d'évitement + `nav[aria-label]` + `aria-current` dans `AppLayout`, `aria-hidden` sur les icônes décoratives, attributs `autocomplete`. |
| Vérification | 5 tests e2e d'accessibilité (`accessibility.spec.ts`) verts. |
| Statut | ✅ Résolu |

### BUG-06 — Incohérence de nommage de l'application 🟡

| Champ | Détail |
|---|---|
| Détection | Revue de code |
| Analyse | Plusieurs libellés coexistaient dans l'interface : « MotoTrack Pro », « MotoTracker Pro », « MotoTracker ». Impact sur l'image de marque et la cohérence du produit. |
| Correction | Uniformisation sur **MotoTrack** dans l'interface (pages auth, navigation, manifeste PWA, `package.json`). |
| Vérification | Test unitaire et e2e vérifiant l'affichage du nom. |
| Statut | ✅ Résolu |

---

## 3. Anomalies fonctionnelles de recette

La campagne de recette **finale** (17 scénarios, 18 avril 2026, version 1.0.0) n'a révélé
aucune anomalie fonctionnelle : les 17 scénarios sont passés.

Ce résultat ne signifie pas que le développement s'est déroulé sans incident. Les anomalies
fonctionnelles rencontrées **au cours des incréments précédents** sont consignées dans le
journal de `suivi-avancement.md` — notamment **A-03** (inscription cassée par une migration
non appliquée), **A-04** (`useGLTF` appelé dans un try/catch, hook React invalide) et
**A-06** (champs optionnels vides sérialisés en `""`, rejetés en 400 par Zod). Elles ont
été corrigées avant la recette finale, ce qui explique qu'elle soit verte.

Les anomalies du registre ci-dessus (BUG-01 à BUG-06) relèvent quant à elles de la
**qualité technique** (tests, configuration, accessibilité, cohérence) et ont été détectées
par l'outillage mis en place — couverture, typage, lint, audit — et non par la recette.

**Ce que cette répartition dit du dispositif :** l'outillage attrape ce qu'il sait mesurer
(typage, seuils, règles de lint) ; la recette manuelle attrape ce qui se voit à l'écran.
Aucun des deux n'attrape ce à quoi je n'ai pas pensé — c'est précisément le rôle que
tiendrait une revue par un pair, absente ici.

## 4. Analyse des points d'amélioration

| Point d'amélioration | Action de fond engagée |
|---|---|
| Non-régression | Harnais de 142 tests unitaires (23 suites) + 22 tests e2e, exécutés à chaque push (CI) |
| Fiabilité du build | Typage strict vérifié, client Prisma régénéré, lint verrouillé |
| Accessibilité | Conformité RGAA sur les parcours critiques, testée automatiquement |
| Sécurité | Cartographie OWASP Top 10 (voir `securite-owasp.md`) |
| Observabilité | Endpoint `/api/health` + logs structurés Winston |

Chaque correctif est accompagné d'un test automatisé garantissant la non-réapparition du
défaut, conformément à l'exigence de prévention des régressions.
