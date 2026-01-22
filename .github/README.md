# GitHub Configuration

Ce dossier contient la configuration GitHub pour le repository.

## Workflows (Actions CI/CD)

### `workflows/ci.yml`

Workflow d'intégration continue qui s'exécute automatiquement :
- ✅ Sur chaque **Pull Request** vers `main`
- ✅ Sur chaque **push** sur `main` (après fusion)

**Ce qu'il vérifie :**
1. **Type checking** : Vérifie que le code TypeScript est valide
2. **Build** : S'assure que le projet compile sans erreur
3. **Bundle size** : Surveille la taille des fichiers de build

**Comment ça marche :**
- Les PRs ne peuvent pas être fusionnées si les checks échouent
- Vous voyez les résultats directement dans l'interface GitHub
- Les erreurs sont affichées avec des logs détaillés

## Comment Tester Localement

Avant de pousser votre code, testez localement :

```bash
# Vérifier les types TypeScript
npx tsc --noEmit

# Builder le projet
npm run build

# Vérifier la taille du bundle
du -sh dist/
```

## Configuration Requise sur GitHub

Pour que les workflows fonctionnent correctement, assurez-vous de :

1. **Activer GitHub Actions**
   - Settings > Actions > General
   - Cochez "Allow all actions and reusable workflows"

2. **Configurer les Branch Protection Rules**
   - Settings > Branches > Add rule
   - Branch name pattern: `main`
   - Cochez "Require status checks to pass before merging"
   - Sélectionnez `build-and-test` dans les required checks

Voir le fichier `BRANCH_PROTECTION.md` à la racine pour les instructions détaillées.

## Ajouter de Nouveaux Workflows

Pour ajouter un nouveau workflow :
1. Créez un fichier `.yml` dans `workflows/`
2. Suivez la [documentation GitHub Actions](https://docs.github.com/en/actions)
3. Testez avec un commit sur une branche de test

## Ressources

- 📖 [Documentation GitHub Actions](https://docs.github.com/en/actions)
- 📖 [Syntaxe des workflows](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- 📖 [Actions Marketplace](https://github.com/marketplace?type=actions)
