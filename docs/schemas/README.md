# Schémas du dossier Bloc 2   MotoTrack

Diagrammes au format [Mermaid](https://mermaid.js.org/) (`.mmd`) référencés dans le rapport `text.md`.
Chaque schéma remplace un placeholder `📸 [SCHÉMA]` du dossier.

| Fichier | Schéma | Section du rapport | Norme | Source |
| --- | --- | --- | --- | --- |
| `01-environnements.mmd` | Promotion des environnements local → preview → production, avec gates CI | §3.2 | Environment promotion flow | `ci.yml`, tableau §3.2 |
| `02-pipeline-ci.mmd` | Pipeline CI/CD : 3 jobs, `needs:`, conditions PR/main, cibles Supabase | §3.4 | CI/CD pipeline | `.github/workflows/ci.yml` |
| `03-architecture-couches.mmd` | Architecture en couches (n-tier) + règle de dépendance | §4.1 | Layered / n-tier | §4.1 |
| `04-mcd-erd.mmd` | Modèle de données : User → Motorcycle → Maintenance / Reminder | §4.1 | ERD / Merise (MCD) | `prisma/schema.prisma` |
| `05-pyramide-tests.mmd` | Pyramide de tests : 142 unitaires/intégration · 22 e2e | §6.2 | Test Pyramid (Cohn/Fowler) | §6.2 |
| `06-sequence-entretien.mmd` | Séquence d'enregistrement d'un entretien (identité→validation→propriété→écriture) | §5.1 | UML Sequence | §5.1 |
| `07-deploiement-infra.mmd` | Vue physique : appareil ↔ Vercel (Edge + serverless) ↔ Supabase ↔ APIs externes | §3.2 · §4.6 | UML Deployment | §3.2 · §4.6 · §5.4 |
| `08-processus-bogues.mmd` | Processus de correction des bogues (test-avant-correctif) | §7.4 | Process flow | §7.4 |
| `09-branches-git.mmd` | Modèle de branches Git : main / develop / feature / fix | §3.5 | Git graph (Gitflow) | §3.5 |

## Comment rendre les schémas en image (pour le PDF)

Aucun outil à installer   au choix :

- **mermaid.live** : ouvrir <https://mermaid.live>, coller le contenu d'un `.mmd`, exporter en PNG/SVG.
- **VS Code** : extension *Markdown Preview Mermaid Support* ou *Mermaid Preview* → aperçu direct du `.mmd`.
- **GitHub** : les blocs Mermaid s'affichent nativement dans les fichiers Markdown rendus.
- **CLI** (si besoin d'automatiser) :
  ```bash
  npx -y @mermaid-js/mermaid-cli -i 04-mcd-erd.mmd -o 04-mcd-erd.png
  ```

> Les couleurs (`classDef`) reprennent la charte sombre de l'application (fond `#0a0a0a`, rouge `#e60026`).
> Elles sont optionnelles : un rendu par défaut reste lisible si le thème pose problème à l'export.
