# Protection de la Branche Main

## Pourquoi ?

Quand votre repository est **open source**, les contributeurs externes ne peuvent **jamais** pousser directement sur vos branches. Ils doivent créer des Pull Requests que vous devez approuver.

**Mais vous devriez quand même activer la protection** pour :
- Vous protéger vous-même contre les erreurs
- Protéger vos collaborateurs directs
- Imposer des revues de code avant fusion

---

## Actions à Faire sur GitHub

### 1. Accéder aux Paramètres
- Allez sur `https://github.com/OptimNow/ai-roi-calculator`
- Cliquez sur **Settings** (⚙️ en haut à droite)
- Dans le menu de gauche : **Branches** (section "Code and automation")

### 2. Créer la Règle de Protection
- Cliquez sur **"Add branch protection rule"**
- **Branch name pattern** : tapez `main`

### 3. Cocher ces Options (Minimum)

✅ **Require a pull request before merging**
- Cochez aussi : **"Require approvals"** → mettez 1

✅ **Do not allow bypassing the above settings**

### 4. Sauvegarder
- Cliquez sur **"Create"** en bas de page

---

## C'est Tout !

Maintenant vous ne pourrez plus pousser directement sur `main`. Vous devrez créer des branches et des Pull Requests.

### Workflow avec Protection

```bash
# 1. Créer une branche
git checkout -b feature/ma-fonctionnalite

# 2. Faire vos modifications
git add .
git commit -m "Description"

# 3. Pousser la branche
git push -u origin feature/ma-fonctionnalite

# 4. Aller sur GitHub
# Cliquez sur "Compare & pull request"
# Créez la PR et fusionnez-la
```

---

**Pour plus de détails sur comment contribuer, voir `CONTRIBUTING.md`**
