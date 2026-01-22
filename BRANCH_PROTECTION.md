# 🛡️ Protection de la Branche Principale

Ce guide vous explique comment protéger votre branche `main` sur GitHub pour éviter les modifications accidentelles ou non autorisées.

## Pourquoi protéger la branche `main` ?

Quand vous mettez votre repository en **open source**, les contributeurs externes ne peuvent **jamais** pousser directement sur vos branches. Ils peuvent seulement créer des **Pull Requests** (PRs).

Cependant, la protection de branche est importante pour :
- ✅ Vous protéger **vous-même** contre des erreurs
- ✅ Protéger vos **collaborateurs directs** (qui ont accès write)
- ✅ Imposer des **revues de code** avant fusion
- ✅ Exiger que les **tests automatiques** passent
- ✅ Maintenir un **historique propre** et stable

---

## Configuration sur GitHub (Interface Web)

### Étape 1 : Accéder aux paramètres du repository

1. Allez sur votre repository GitHub : `https://github.com/OptimNow/ai-roi-calculator`
2. Cliquez sur **"Settings"** (⚙️ en haut à droite)
3. Dans le menu de gauche, cliquez sur **"Branches"** (section "Code and automation")

### Étape 2 : Ajouter une règle de protection

1. Sous "Branch protection rules", cliquez sur **"Add branch protection rule"**
2. Dans le champ **"Branch name pattern"**, tapez : `main`

### Étape 3 : Configurer les protections recommandées

Cochez les options suivantes (configuration pour débutant) :

#### ✅ Protection de base
- **Require a pull request before merging**
  - Cochez : **"Require approvals"** (1 approval minimum)
  - ⚠️ Laissez décoché : "Dismiss stale pull request approvals..." (pas nécessaire pour débuter)

#### ✅ Protection contre les push forcés
- **Do not allow bypassing the above settings**
  - Empêche même les admins de contourner les règles

- **Require status checks to pass before merging** (si vous utilisez GitHub Actions)
  - Cochez cette option
  - Après votre premier workflow, ajoutez les checks requis :
    - `build-and-test` (le nom de votre job CI)

#### ✅ Protections additionnelles (optionnel mais recommandé)
- **Require linear history** : Force un historique Git propre (pas de merge commits complexes)
- **Require deployments to succeed** : Si vous utilisez Vercel (déjà configuré)

### Étape 4 : Sauvegarder

Cliquez sur **"Create"** ou **"Save changes"** en bas de la page.

---

## Configuration Recommandée selon Votre Niveau

### 🟢 Débutant (Seul sur le projet)
```
✅ Require a pull request before merging
✅ Require approvals (1)
✅ Do not allow bypassing
```
**Résultat** : Vous ne pouvez plus pousser directement sur `main`. Vous devez créer des branches et des PRs.

### 🟡 Intermédiaire (Avec collaborateurs)
```
✅ Require a pull request before merging
✅ Require approvals (1-2)
✅ Require status checks (CI/CD)
✅ Do not allow bypassing
✅ Require linear history
```
**Résultat** : Toutes les contributions passent par une revue + tests automatiques.

### 🔴 Avancé (Équipe avec rôles)
```
✅ Toutes les protections ci-dessus
✅ Restrict who can push (seulement certains rôles)
✅ Require signed commits
✅ Include administrators (même les admins suivent les règles)
```
**Résultat** : Protection maximale avec vérifications strictes.

---

## Workflow avec Protection Activée

Une fois la protection activée, voici comment travailler :

### 1. Créer une branche de travail
```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 2. Faire vos modifications et commit
```bash
git add .
git commit -m "Ajout de ma fonctionnalité"
```

### 3. Pousser votre branche
```bash
git push -u origin feature/ma-nouvelle-fonctionnalite
```

### 4. Créer une Pull Request
- Allez sur GitHub
- Cliquez sur **"Compare & pull request"**
- Décrivez vos changements
- Cliquez sur **"Create pull request"**

### 5. Attendre les vérifications
- ✅ GitHub Actions exécute les tests
- ✅ Revue de code (si configurée)
- ✅ Toutes les vérifications passent

### 6. Fusionner la PR
- Cliquez sur **"Merge pull request"**
- Confirmez avec **"Confirm merge"**
- Supprimez la branche (optionnel mais recommandé)

---

## Vérifier que la Protection Fonctionne

Pour tester que votre protection fonctionne :

```bash
# Essayer de pousser directement sur main (devrait échouer)
git checkout main
git commit --allow-empty -m "Test protection"
git push origin main
```

**Résultat attendu** :
```
remote: error: GH006: Protected branch update failed
remote: error: Changes must be made through a pull request
```

✅ **Si vous voyez cette erreur, votre protection fonctionne !**

---

## FAQ - Questions Fréquentes

### Q: Si je suis le seul développeur, ai-je besoin de protection ?
**R:** Oui ! Même seul, cela vous force à créer des PRs. C'est une bonne pratique qui :
- Déclenche vos tests automatiques avant fusion
- Crée un point de revue avant chaque changement
- Vous empêche de pousser du code cassé par accident

### Q: Comment fusionner ma propre PR si je suis seul ?
**R:** Vous pouvez :
1. Approuver et fusionner votre propre PR (si les tests passent)
2. Ou désactiver temporairement "Require approvals" dans les settings

### Q: Que se passe-t-il si les tests échouent ?
**R:** GitHub vous empêche de fusionner la PR tant que les tests ne passent pas. Vous devez corriger le code et pousser de nouveaux commits sur votre branche.

### Q: Puis-je contourner les règles en cas d'urgence ?
**R:** Si vous êtes admin et que "Do not allow bypassing" n'est pas coché, vous pouvez temporairement désactiver la règle dans Settings > Branches. Mais **ne le faites qu'en dernier recours**.

### Q: Les contributeurs open source peuvent-ils pousser sur main ?
**R:** **Non, jamais.** Sur GitHub, les contributeurs externes (fork & PR) ne peuvent jamais pousser directement. Ils créent des PRs que vous devez approuver et fusionner.

---

## Ressources Complémentaires

- 📖 [Documentation officielle GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- 📖 [Guide des Pull Requests](https://docs.github.com/en/pull-requests)
- 📄 Voir aussi : `CONTRIBUTING.md` pour les règles de contribution

---

## Résumé - Checklist de Configuration

- [ ] Aller dans Settings > Branches sur GitHub
- [ ] Créer une règle pour la branche `main`
- [ ] Cocher "Require a pull request before merging"
- [ ] Cocher "Require approvals" (au moins 1)
- [ ] Cocher "Require status checks" si vous avez CI/CD
- [ ] Cocher "Do not allow bypassing"
- [ ] Sauvegarder la règle
- [ ] Tester en essayant de pousser directement sur main (devrait échouer)

---

**🎉 Une fois configuré, votre branche `main` sera protégée contre les modifications directes !**

Pour toute question, consultez le fichier `CONTRIBUTING.md` ou ouvrez une issue sur GitHub.
