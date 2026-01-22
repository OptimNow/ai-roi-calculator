# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au **AI ROI Calculator** ! Ce projet est open source et nous accueillons toutes les contributions.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Configuration de l'Environnement](#configuration-de-lenvironnement)
- [Processus de Pull Request](#processus-de-pull-request)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Besoin d'Aide ?](#besoin-daide-)

---

## Code de Conduite

Ce projet suit un code de conduite simple :
- 🤝 Soyez respectueux et bienveillant
- 💬 Communiquez de manière constructive
- 🎯 Restez concentré sur l'amélioration du projet
- 🙏 Acceptez les critiques constructives avec gratitude

---

## Comment Contribuer

Il existe plusieurs façons de contribuer :

### 🐛 Signaler un Bug
1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](https://github.com/OptimNow/ai-roi-calculator/issues)
2. Ouvrez une nouvelle issue avec le label `bug`
3. Décrivez le problème de manière détaillée :
   - Qu'avez-vous essayé de faire ?
   - Qu'attendiez-vous comme résultat ?
   - Qu'avez-vous obtenu à la place ?
   - Comment reproduire le bug ? (étapes précises)
   - Captures d'écran si possible

### 💡 Proposer une Fonctionnalité
1. Ouvrez une issue avec le label `enhancement`
2. Expliquez clairement :
   - Le problème que cette fonctionnalité résout
   - Comment elle devrait fonctionner
   - Pourquoi elle est utile pour les utilisateurs

### 🔧 Corriger un Bug ou Ajouter une Fonctionnalité
1. Choisissez une issue existante ou créez-en une
2. Commentez l'issue pour signaler que vous travaillez dessus
3. Suivez le [Processus de Pull Request](#processus-de-pull-request) ci-dessous

### 📖 Améliorer la Documentation
La documentation peut toujours être améliorée ! N'hésitez pas à proposer des corrections, clarifications ou ajouts.

---

## Configuration de l'Environnement

### Prérequis

Assurez-vous d'avoir installé :
- **Node.js** : version 18.x ou supérieure
- **npm** : version 9.x ou supérieure
- **Git** : pour cloner le repository

### Installation

1. **Forkez le repository**
   - Cliquez sur le bouton "Fork" en haut à droite de la page GitHub

2. **Clonez votre fork**
   ```bash
   git clone https://github.com/VOTRE-USERNAME/ai-roi-calculator.git
   cd ai-roi-calculator
   ```

3. **Ajoutez le repository original comme remote**
   ```bash
   git remote add upstream https://github.com/OptimNow/ai-roi-calculator.git
   ```

4. **Installez les dépendances**
   ```bash
   npm install
   ```

5. **Lancez le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`

### Vérifier que tout fonctionne

```bash
# Vérifier que le build fonctionne
npm run build

# Lancer les tests
npm test
```

---

## Processus de Pull Request

### 1. Créer une Branche

Créez toujours une nouvelle branche pour vos modifications :

```bash
# Assurez-vous d'être à jour avec le repository original
git checkout main
git pull upstream main

# Créez une nouvelle branche avec un nom descriptif
git checkout -b fix/description-du-bug
# ou
git checkout -b feature/nom-de-la-fonctionnalite
```

**Convention de nommage des branches :**
- `fix/...` pour les corrections de bugs
- `feature/...` pour les nouvelles fonctionnalités
- `docs/...` pour les modifications de documentation
- `refactor/...` pour les refactorisations de code

### 2. Faites vos Modifications

- Écrivez du code propre et lisible
- Suivez les [Standards de Code](#standards-de-code)
- Ajoutez des tests si nécessaire
- Mettez à jour la documentation si nécessaire

### 3. Testez vos Modifications

Avant de soumettre, assurez-vous que :
```bash
# Les tests passent
npm test

# Le build fonctionne
npm run build
```

### 4. Committez vos Changements

Utilisez des messages de commit clairs et descriptifs :

```bash
git add .
git commit -m "fix: correction du calcul du ROI pour les valeurs négatives"
```

**Convention des messages de commit :**
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` modification de documentation
- `style:` changements de formatage (sans impact sur le code)
- `refactor:` refactorisation de code
- `test:` ajout ou modification de tests
- `chore:` tâches de maintenance

### 5. Poussez vers votre Fork

```bash
git push origin fix/description-du-bug
```

### 6. Ouvrez une Pull Request

1. Allez sur votre fork sur GitHub
2. Cliquez sur **"Compare & pull request"**
3. Remplissez le template de PR avec :
   - **Titre clair** : résumé en une ligne
   - **Description** : qu'est-ce qui change et pourquoi ?
   - **Issue liée** : mettez `Closes #123` si votre PR résout une issue
   - **Tests** : comment avez-vous testé vos changements ?
   - **Captures d'écran** : si pertinent (changements UI)

4. Attendez la revue de code

### 7. Répondez aux Retours

- Les mainteneurs peuvent demander des modifications
- Répondez aux commentaires et poussez de nouveaux commits si nécessaire
- Les nouveaux commits seront automatiquement ajoutés à la PR

### 8. Fusion

Une fois approuvée par les mainteneurs, votre PR sera fusionnée ! 🎉

---

## Standards de Code

### TypeScript

- **Utilisez TypeScript** pour tout nouveau code
- **Typez explicitement** les paramètres et retours de fonction
- **Évitez `any`** autant que possible
- Utilisez les types définis dans `types.ts`

Exemple :
```typescript
// ✅ Bon
function calculateROI(costs: number, benefits: number): number {
  return (benefits - costs) / costs * 100;
}

// ❌ Éviter
function calculateROI(costs, benefits) {
  return (benefits - costs) / costs * 100;
}
```

### React

- **Composants fonctionnels** avec hooks
- **Props typées** avec TypeScript
- **Nommage PascalCase** pour les composants
- **Un composant par fichier** (sauf composants très petits)

Exemple :
```typescript
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Styling

- **Tailwind CSS** pour tous les styles
- **Classes utilitaires** plutôt que CSS custom
- **Responsive design** : utilisez les préfixes `sm:`, `md:`, `lg:`
- **Dark mode** : pas encore implémenté (contributions bienvenues !)

### Structure des Fichiers

```
/
├── components/          # Composants réutilisables
│   ├── ResultsDisplay.tsx
│   └── ...
├── utils/              # Logique métier et utilitaires
│   ├── calculations.ts
│   └── calculations.test.ts
├── images/             # Assets statiques
├── App.tsx             # Composant principal
├── types.ts            # Définitions de types TypeScript
└── constants.ts        # Constantes et presets
```

---

## Tests

### Lancer les Tests

```bash
# Tous les tests
npm test

# Tests en mode watch (pendant le développement)
npm test -- --watch

# Tests avec couverture
npm test -- --coverage
```

### Écrire des Tests

Les tests sont dans `utils/calculations.test.ts`. Utilisez **Vitest** pour les tests unitaires.

Exemple :
```typescript
import { describe, it, expect } from 'vitest';
import { calculateROI } from './calculations';

describe('calculateROI', () => {
  it('devrait calculer le ROI correctement', () => {
    const result = calculateROI(100, 150);
    expect(result).toBe(50);
  });

  it('devrait gérer les valeurs nulles', () => {
    const result = calculateROI(0, 100);
    expect(result).toBe(Infinity);
  });
});
```

**Quand ajouter des tests :**
- Nouvelles fonctions dans `utils/`
- Corrections de bugs (test de non-régression)
- Logique métier complexe

---

## Besoin d'Aide ?

### Ressources

- **README.md** : Documentation utilisateur
- **METHODOLOGY.md** : Spécifications mathématiques du calculateur
- **CLAUDE.MD** : Guide pour travailler avec Claude Code
- **ROADMAP.md** : Fonctionnalités prévues

### Communication

- 💬 **Issues GitHub** : pour les questions techniques
- 📧 **Email** : [contact@optimnow.io](mailto:contact@optimnow.io) pour les questions générales
- 🐛 **Bugs** : ouvrez une issue avec le label `bug`
- 💡 **Idées** : ouvrez une issue avec le label `enhancement`

### Débutant sur GitHub ?

Pas de problème ! Voici quelques ressources pour débuter :
- [Guide GitHub : Fork a Repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [Guide GitHub : Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Guide Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

---

## Checklist avant de Soumettre

Avant d'ouvrir votre PR, vérifiez que :

- [ ] Mon code compile sans erreur (`npm run build`)
- [ ] Les tests passent (`npm test`)
- [ ] J'ai testé mes changements manuellement
- [ ] J'ai ajouté des tests si nécessaire
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] Mon commit suit les conventions de nommage
- [ ] Ma branche est à jour avec `main` (`git pull upstream main`)
- [ ] J'ai supprimé tout code commenté ou de debug

---

## Licence

En contribuant à ce projet, vous acceptez que vos contributions soient publiées sous la même licence que le projet (voir LICENSE).

---

**🙏 Merci de contribuer au AI ROI Calculator !**

Chaque contribution, petite ou grande, aide à améliorer le projet pour tous les utilisateurs.
