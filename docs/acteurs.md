# Cartographie des acteurs — MotoTrack

## Commanditaire

| Acteur | Organisation | Rôle | Implication |
|---|---|---|---|
| Marc Duvalier | MotoClub Alpes — Président | Commanditaire principal, valide les livrables et le budget | Forte — points hebdomadaires |
| Sophie Arnaud | MotoClub Alpes — Responsable numérique | Exprime les besoins fonctionnels, interface entre le club et l'équipe | Forte — présente à chaque sprint review |

## Équipe projet

| Acteur | Rôle | Responsabilités |
|---|---|---|
| Luca Straputicari | Chef de projet & Développeur fullstack (lead) | Architecture, développement backend et frontend, coordination de l'équipe |
| Thomas Renard | Développeur backend | API Routes, Prisma ORM, gestion de la base de données, CI/CD |
| Sarah Morel | Développeuse frontend | Composants React, intégration Tailwind, formulaires, pages dashboard |
| Karim Benali | Designer UX/UI | Maquettes Figma, système de design dark theme, identité visuelle |
| Julie Fontaine | QA / Testeur | Rédaction et exécution du cahier de recettes, remontée des anomalies |

## Parties prenantes secondaires

| Acteur | Rôle | Implication |
|---|---|---|
| Ynov Campus — Jury | Évalue la conformité du projet aux blocs de compétences | Soutenance finale |
| Référents pédagogiques | Accompagnement méthodologique | Intermittente — jalons |
| Hébergeur (Vercel / Supabase) | Fournit l'infrastructure de production | Technique uniquement |

## Utilisateurs finaux

| Profil | Description | Besoin principal |
|---|---|---|
| Membre MotoClub (motard amateur) | Possède 1 à 2 motos, entretien en concession | Suivre l'historique d'entretien, ne pas rater une échéance |
| Motard confirmé | Possède plusieurs motos, fait lui-même son entretien | Gérer plusieurs motos, suivre coûts et pièces |
| Nouvel acheteur | Vient d'acquérir sa première moto | Enregistrer son véhicule, trouver des pièces en ligne |
| Administrateur du club | Supervise les membres du MotoClub Alpes | Vue globale du parc moto de l'association |

## Périmètre du projet

**Inclus :**
- Gestion personnelle d'un garage multi-motos
- Suivi des interventions d'entretien avec historique
- Tableau de bord avec alertes d'échéances calculées
- Recherche de pièces détachées par moto
- Consultation d'actualités moto en temps réel

**Exclu :**
- Gestion de garage professionnel ou facturation client
- Suivi de flotte d'entreprise
- Application mobile native (couvert partiellement par le mode PWA)
