# Cartographie des acteurs — MotoTrack

## Origine du projet

MotoTrack ne répond pas à la commande d'un client contractuel. Le besoin est issu d'une
analyse de marché menée en amont : l'entretien d'une moto repose encore massivement sur
des carnets papier ou des tableurs épars, les solutions existantes étant soit généralistes
(automobile), soit payantes, soit non francophones.

En l'absence de commanditaire externe, j'ai endossé le rôle de commanditaire pour cadrer
le produit : définition du périmètre, arbitrage des priorités, validation des livrables.
Ce double rôle est explicite et assumé — il implique que les décisions produit ne sont
adossées à aucune validation externe, limite discutée en conclusion du dossier.

## Réalisation

| Acteur | Rôle | Responsabilités |
|---|---|---|
| Luca Straputicari | Développeur unique | Cadrage, architecture, développement backend et frontend, tests, CI/CD, recette, documentation |

Le projet est réalisé **seul, de bout en bout**. Aucune répartition des tâches n'est donc
possible : la discipline habituellement portée par une équipe (revue de code, regard
extérieur sur une régression, validation par un tiers) est reportée sur l'outillage
automatisé — CI bloquante, harnais de tests, typage strict, lint. Ce transfert est un
choix méthodologique documenté, pas un pis-aller.

## Persona d'illustration

Pour ancrer les décisions produit dans un usage concret, le besoin est formalisé autour
d'une cible représentative : **un club de motards de loisir**, désigné à titre d'exemple
« MotoClub Alpes ». Cette figure est un **persona d'illustration, pas un donneur d'ordre** :
aucune des personnes ou validations évoquées par ce persona n'existe. Il sert à trancher
les arbitrages fonctionnels (« un membre du club aurait-il besoin de ceci ? »), rien de plus.

## Parties prenantes réelles

| Acteur | Rôle | Implication |
|---|---|---|
| Ynov Campus — Jury | Évalue la conformité du projet aux blocs de compétences | Soutenance finale |
| Référents pédagogiques | Accompagnement méthodologique | Intermittente — jalons |
| Vercel | Hébergement de l'application (production et previews) | Technique uniquement |
| Supabase | Base de données PostgreSQL managée en production | Technique uniquement |

## Utilisateurs finaux visés

| Profil | Description | Besoin principal |
|---|---|---|
| Motard amateur | Possède 1 à 2 motos, entretien en concession | Suivre l'historique d'entretien, ne pas rater une échéance |
| Motard confirmé | Possède plusieurs motos, fait lui-même son entretien | Gérer plusieurs motos, suivre coûts et pièces |
| Nouvel acheteur | Vient d'acquérir sa première moto | Enregistrer son véhicule, trouver des pièces en ligne |

Ces profils sont issus de l'analyse de marché du Bloc 1. **Ils n'ont pas été confrontés à
des utilisateurs réels** : le produit n'a pas fait l'objet d'une campagne de test
utilisateurs. C'est la principale limite de validation du projet.

## Périmètre du projet

**Inclus :**
- Gestion personnelle d'un garage multi-motos
- Suivi des interventions d'entretien avec historique
- Tableau de bord avec alertes d'échéances calculées
- Recherche de pièces détachées par moto
- Consultation d'actualités moto en temps réel

**Exclu :**
- Gestion de garage professionnel ou facturation
- Suivi de flotte d'entreprise
- Vue d'administration d'un parc collectif (le persona « club » sert au cadrage, pas au périmètre)
- Application mobile native (couvert partiellement par le mode PWA)
