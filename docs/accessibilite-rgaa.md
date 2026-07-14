# Grille d'audit d'accessibilité RGAA — MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Référentiel | RGAA 4.1 (aligné WCAG 2.1 niveau AA) |
| Périmètre audité | Parcours critiques : accueil, connexion, inscription, navigation applicative |
| Méthode | Contrôle manuel + tests automatisés (`tests/e2e/accessibility.spec.ts`) |
| Auteur | Luca Straputicari |
| Date | 21 avril 2026 |

## 1. Périmètre et méthode

Le RGAA compte 106 critères répartis en 13 thématiques. Un audit de conformité complet
porte sur l'intégralité des pages ; le présent audit se concentre sur les **parcours
critiques** de l'application (authentification et navigation), qui concentrent les
interactions clés et les points de vigilance les plus fréquents. Chaque critère retenu est
évalué **Conforme (C)**, **Non conforme (NC)** ou **Non applicable (NA)**.

## 2. Grille d'évaluation

| Critère RGAA | Intitulé | Mise en œuvre | Statut |
|---|---|---|---|
| 1.1 | Images porteuses d'info avec alternative | Icônes décoratives en `aria-hidden`, pas d'image porteuse de sens non décrite | C |
| 1.2 | Images de décoration ignorées par l'AT | `aria-hidden="true"` sur les icônes FontAwesome | C |
| 3.2 | Contraste des textes | Thème sombre, texte clair sur fond `#0f172a` (ratio > 4.5:1) | C |
| 3.3 | Contraste des composants d'interface | Boutons/champs à bordures contrastées | C |
| 7.1 | Scripts compatibles AT | Composants React sémantiques, pas de widget custom inaccessible | C |
| 7.3 | Scripts contrôlables au clavier | Navigation et formulaires entièrement utilisables au clavier | C |
| 8.3 | Langue par défaut définie | `<html lang="fr">` | C |
| 8.9 | Balises utilisées conformément | Structure sémantique (`nav`, `main`, `header`, `h1`…) | C |
| 9.1 | Hiérarchie de titres cohérente | Un `<h1>` unique par page, titres ordonnés | C |
| 10.7 | Prise de focus visible | Styles `focus-visible` (ring) sur éléments interactifs | C |
| 11.1 | Champs de formulaire étiquetés | `<Label htmlFor>` associé à chaque `<Input id>` | C |
| 11.2 | Étiquettes pertinentes | Libellés explicites (Email, Password, Name…) | C |
| 11.10 | Contrôle de saisie / erreurs signalées | `role="alert"`, `aria-invalid`, `aria-describedby` | C |
| 11.13 | Saisie facilitée (autocomplete) | `autocomplete` sur email et mots de passe | C |
| 12.6 | Zones de regroupement atteignables | Landmarks `nav`/`main` présents | C |
| 12.7 | Lien d'évitement | « Aller au contenu principal » vers `#main-content` | C |
| 12.8 | Ordre de tabulation cohérent | Ordre DOM logique (lien d'évitement → nav → contenu) | C |
| 13.3 | Documents bureautiques accessibles | NA (pas de document téléchargeable dans le périmètre) | NA |

## 3. Taux de conformité

| Indicateur | Valeur |
|---|---|
| Critères évalués | 18 |
| Non applicables | 1 |
| Critères applicables | 17 |
| Conformes | 17 |
| **Taux de conformité (périmètre audité)** | **100 %** |

> Le taux de conformité est calculé sur les critères **applicables** du périmètre audité
> (parcours critiques). Il ne préjuge pas d'un audit RGAA complet sur l'ensemble des pages.

## 4. Preuve automatisée

Cinq critères structurants sont **vérifiés à chaque exécution de la CI** par
`tests/e2e/accessibility.spec.ts` : langue (8.3), étiquettes de formulaire (11.1),
autocomplétion (11.13), signalement d'erreurs (11.10) et hiérarchie de titres (9.1).

## 5. Limites & plan d'amélioration

- L'audit couvre les **parcours critiques**, non l'intégralité des écrans (météo, pièces,
  actualités) : une extension de la grille à ces pages est planifiée.
- Aucune **déclaration de conformité RGAA** formelle n'est publiée à ce stade (elle suppose
  un audit exhaustif des 106 critères).
- Prochaines actions : audit des écrans secondaires, test avec lecteur d'écran (NVDA),
  vérification systématique des contrastes via l'outil dédié.
