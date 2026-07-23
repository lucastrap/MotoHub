# Manuel de mise à jour   MotoTrack

| Champ | Valeur |
|---|---|
| Projet | MotoTrack |
| Version courante | 1.0.0 |
| Public visé | Équipe technique / mainteneur |
| Date | 21 avril 2026 |

## 1. Politique de versionnement

Le projet suit le **Semantic Versioning** (`MAJEUR.MINEUR.CORRECTIF`) :

- **MAJEUR**   changement incompatible (ex. refonte du modèle de données) ;
- **MINEUR**   nouvelle fonctionnalité rétrocompatible ;
- **CORRECTIF**   correction de bogue rétrocompatible.

Toute évolution est consignée dans **`CHANGELOG.md`** et matérialisée par un **tag Git**
(`git tag v1.1.0`). L'historique complet est traçable via `git log` et les *Releases* GitHub.

## 2. Cycle de mise à jour (Git Flow simplifié)

```
develop ──▶ branche feature/xxx ──▶ Pull Request ──▶ CI verte ──▶ merge develop
                                                                      │
                                                          merge main ▼ (release)
                                                          tag vX.Y.Z + déploiement auto
```

1. Créer une branche depuis `develop` : `git checkout -b feature/ma-fonctionnalite`.
2. Développer **avec un test** de non-régression associé.
3. Ouvrir une **Pull Request** : la CI exécute lint, tests unitaires (couverture),
   build et tests e2e.
4. Après revue et CI verte, fusionner. La fusion sur `main` déclenche le déploiement Vercel.

## 3. Mettre à jour le schéma de base de données

Toute modification de `prisma/schema.prisma` nécessite une migration versionnée :

```bash
# 1. Créer la migration en développement (génère un dossier horodaté)
npx prisma migrate dev --name ajout_champ_xxx

# 2. Régénérer le client Prisma
npx prisma generate

# 3. En production, appliquer les migrations en attente
DATABASE_URL="<url_prod>" npx prisma migrate deploy
```

> ⚠️ **Point de vigilance** : après toute migration, exécuter `npx prisma generate`
> pour éviter les erreurs de typage (cf. BUG-03 du plan de correction des bogues).
> Le pipeline CI exécute `prisma migrate deploy` automatiquement avant le build.

## 4. Mettre à jour les dépendances

```bash
# Inspecter les mises à jour disponibles
npm outdated

# Mettre à jour dans le respect des contraintes de version
npm update

# Auditer les vulnérabilités connues
npm audit
```

Après mise à jour, **relancer toute la chaîne de vérification** (section 5) avant de
committer le nouveau `package-lock.json`.

## 5. Vérifications obligatoires avant publication

| Étape | Commande | Critère |
|---|---|---|
| Typage | `npx tsc --noEmit` | Aucune erreur |
| Qualité | `npm run lint` | Aucune erreur |
| Tests unitaires | `npm run test` | 100 % vert, seuils de couverture respectés |
| Tests e2e | `npm run test:e2e` | 100 % vert |
| Build | `npm run build` | Succès |

Ces cinq étapes sont **répliquées par la CI** : une PR ne peut être fusionnée que si elles
sont toutes vertes.

## 6. Publier une nouvelle version

```bash
# 1. Mettre à jour la version et le CHANGELOG
npm version minor          # incrémente package.json + crée le tag Git

# 2. Documenter la version dans CHANGELOG.md (section [X.Y.Z]   date)

# 3. Pousser la branche et le tag
git push origin main --follow-tags
```

Le déploiement en production est ensuite déclenché automatiquement par GitHub Actions.

## 7. Procédure de retour arrière (rollback)

- **Application** : Vercel → *Deployments* → promouvoir le dernier déploiement stable.
- **Base de données** : créer une migration corrective (`prisma migrate dev`) plutôt que de
  supprimer une migration déjà déployée, afin de préserver l'intégrité de l'historique.
