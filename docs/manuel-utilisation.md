# Manuel d'utilisation — MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version | 1.0.0 |
| Public visé | Utilisateur final (motard gérant l'entretien de sa ou ses motos) |
| Date | 21 avril 2026 |

MotoTrack est une application web de gestion de garage moto : suivi d'entretien,
tableau de bord des échéances, actualités et météo. Elle est utilisable depuis un
navigateur ou installable en application (PWA) sur mobile.

---

## 1. Créer un compte et se connecter

1. Ouvrir l'application, cliquer sur **Commencer** (ou **Connexion**).
2. Sur `/register`, renseigner **nom, email, mot de passe** (min. 6 caractères) et confirmer.
3. Après validation, se connecter sur `/login`. Une session sécurisée (cookie) est ouverte
   pour 24 heures.
4. Se déconnecter à tout moment via **Déconnexion** dans le menu latéral.

> Les pages `Tableau de bord`, `Mon Garage` et `Historique` sont protégées : un visiteur
> non connecté est automatiquement redirigé vers la page de connexion.

## 2. Ajouter une moto au garage

1. Menu **Mon Garage** → **Ajouter une moto**.
2. Suivre le **wizard en 3 étapes** :
   - **Étape 1** — Marque (sélecteur avec drapeaux) et année. Le champ **Modèle** propose
     une autocomplétion issue de la base officielle NHTSA.
   - **Étape 2** — Détails : couleur, immatriculation (formatée automatiquement au format
     SIV `AB-123-CD`), numéro de série (VIN), kilométrage actuel.
   - **Étape 3** — Informations d'achat : date et prix (facultatifs).
3. **Valider** : la moto apparaît dans la liste du garage.

**Définir la moto principale** : dans **Mon Garage**, cliquer sur *« Définir comme moto
principale »*. Le badge **Principale** est déplacé sur la moto choisie ; le tableau de bord
s'appuie sur elle.

## 3. Enregistrer une intervention d'entretien

1. Menu **Historique** → **Ajouter une intervention** (ou depuis la fiche moto).
2. Renseigner : moto concernée, **type** (vidange, pneus, freins, chaîne, révision,
   réparation, autre), date, kilométrage, description et coût (facultatif).
3. **Valider**. L'intervention est ajoutée au carnet.

> 💡 Si le kilométrage saisi est supérieur au kilométrage actuel de la moto, celui-ci est
> **mis à jour automatiquement**.

**Filtrer l'historique** : dans **Historique**, cliquer sur la puce d'une moto pour
n'afficher que ses interventions.

## 4. Consulter le tableau de bord

Le **Tableau de bord** synthétise, pour la moto principale :

- la **dernière intervention** (type, description, date, kilométrage) ;
- les **prochaines échéances** calculées (vidange, chaîne, freins, pneus) avec kilométrage cible ;
- le **total des dépenses** d'entretien.

## 5. Modules complémentaires

| Module | Usage |
|---|---|
| **Pièces & Achat** | Liens d'achat dynamiques (eBay, LeBonCoin, Amazon) adaptés à votre moto |
| **Actu Moto** | Fil d'actualités moto (essais, MotoGP, nouveautés) via Google News |
| **Météo Pilote** | Conditions météo pour anticiper vos sorties |

## 6. Installer l'application sur mobile (PWA)

1. Ouvrir l'application dans le navigateur du téléphone.
2. Menu du navigateur → **Ajouter à l'écran d'accueil**.
3. MotoTrack s'installe comme une application autonome (icône, plein écran).

## 7. Accessibilité

L'application respecte les bonnes pratiques du **RGAA** : navigation au clavier, lien
d'évitement, étiquettes de formulaire, signalement accessible des erreurs de saisie,
langue déclarée et structure de titres cohérente.

## 8. Aide et support

MotoTrack est développé et maintenu par une seule personne : il n'existe pas de support
dédié. En cas de difficulté :

- vérifier que le service est opérationnel via la sonde d'état : `https://<domaine>/api/health`
  (réponse attendue : `{ "status": "ok", "db": "connected" }`) ;
- signaler une anomalie en ouvrant une **issue** sur le dépôt GitHub du projet, en précisant
  les étapes de reproduction, le comportement attendu et le comportement obtenu.
