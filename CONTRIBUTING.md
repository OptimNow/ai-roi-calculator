# 🤝 Contributing Guide

Thanks for your interest in contributing to the **AI ROI Calculator**! This project is open
source and all contributions are welcome.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Environment Setup](#environment-setup)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Tests](#tests)
- [Need Help?](#need-help)

---

## Code of Conduct

This project follows a simple code of conduct:
- 🤝 Be respectful and kind
- 💬 Communicate constructively
- 🎯 Stay focused on improving the project
- 🙏 Accept constructive criticism gracefully

---

## Ways to Contribute

### 🐛 Report a Bug
1. Check that the bug has not already been reported in [Issues](https://github.com/OptimNow/ai-roi-calculator/issues)
2. Open a new issue with the `bug` label
3. Describe the problem in detail:
   - What were you trying to do?
   - What did you expect to happen?
   - What happened instead?
   - How can it be reproduced? (precise steps)
   - Screenshots if possible

If the bug is a wrong **number** rather than a broken interface, include the inputs you used.
[METHODOLOGY.md](METHODOLOGY.md) documents every formula, so a report that names the metric and
the inputs can usually be turned into a failing test straight away.

### 💡 Propose a Feature
1. Open an issue with the `enhancement` label
2. Explain clearly:
   - The problem the feature solves
   - How it should work
   - Why it is useful to users

### 🔧 Fix a Bug or Add a Feature
1. Pick an existing issue or create one
2. Comment on the issue to say you are working on it
3. Follow the [Pull Request Process](#pull-request-process) below

### 📖 Improve the Documentation
Documentation can always be improved! Corrections, clarifications and additions are welcome.

---

## Environment Setup

### Prerequisites

Make sure you have installed:
- **Node.js**: version 20.x or later
- **npm**: version 10.x or later
- **Git**: to clone the repository

### Installation

1. **Fork the repository**
   - Click the "Fork" button at the top right of the GitHub page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ai-roi-calculator.git
   cd ai-roi-calculator
   ```

3. **Add the original repository as a remote**
   ```bash
   git remote add upstream https://github.com/OptimNow/ai-roi-calculator.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

### Check that everything works

```bash
# Check types — Vite does NOT typecheck, so this is the only gate
npm run typecheck

# Check the build works
npm run build

# Run the tests
npm test
```

---

## Pull Request Process

### 1. Create a Branch

Always create a new branch for your changes:

```bash
# Make sure you are up to date with the original repository
git checkout main
git pull upstream main

# Create a new branch with a descriptive name
git checkout -b fix/bug-description
# or
git checkout -b feature/feature-name
```

**Branch naming convention:**
- `fix/...` for bug fixes
- `feature/...` for new features
- `docs/...` for documentation changes
- `refactor/...` for refactoring

### 2. Make your Changes

- Write clean, readable code
- Follow the [Code Standards](#code-standards)
- Add tests where needed
- Update the documentation where needed

### 3. Test your Changes

Before submitting, make sure that:
```bash
# Types pass
npm run typecheck

# Tests pass
npm test

# The build works
npm run build
```

### 4. Commit your Changes

Use clear, descriptive commit messages:

```bash
git add .
git commit -m "fix: correct ROI calculation for negative values"
```

**Commit message convention:**
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation change
- `style:` formatting changes (no code impact)
- `refactor:` code refactoring
- `test:` adding or changing tests
- `chore:` maintenance tasks

### 5. Push to your Fork

```bash
git push origin fix/bug-description
```

### 6. Open a Pull Request

1. Go to your fork on GitHub
2. Click **"Compare & pull request"**
3. Fill in the PR template with:
   - **Clear title**: a one-line summary
   - **Description**: what changes and why?
   - **Linked issue**: add `Closes #123` if your PR resolves an issue
   - **Tests**: how did you test your changes?
   - **Screenshots**: if relevant (UI changes)

4. Wait for code review

### 7. Respond to Feedback

- Maintainers may request changes
- Reply to comments and push new commits as needed
- New commits are added to the PR automatically

### 8. Merge

Once approved by the maintainers, your PR will be merged! 🎉

---

## Code Standards

### TypeScript

- **Use TypeScript** for all new code
- **Type parameters and return values explicitly**
- **Avoid `any`** wherever possible
- Use the types defined in `types.ts`

Example:
```typescript
// ✅ Good — explicit types, imported from types.ts
import type { UseCaseInputs, CalculationResults } from '../types';

export const calculateROI = (inputs: UseCaseInputs): CalculationResults => {
  // ...
};

// ❌ Avoid — implicitly `any` parameters
export const calculateROI = (inputs) => {
  // ...
};
```

`calculateROI` above is the engine's real signature (`utils/calculations.ts`): it takes the
full inputs object and returns the full results object, not two numbers.

### React

- **Functional components** with hooks
- **Typed props** with TypeScript
- **PascalCase naming** for components
- **One component per file** (except very small ones)

Example:
```typescript
// ✅ Good
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

- **Tailwind CSS** for all styles
- **Utility classes** rather than custom CSS
- **Responsive design**: use the `sm:`, `md:`, `lg:` prefixes
- **Dark mode**: not implemented yet (contributions welcome!)

### File Structure

```
/
├── components/          # Components and their tests
│   ├── Charts.tsx              # 4 memoized charts
│   ├── HelpGuide.tsx           # In-app guide (modal)
│   ├── InputComponents.tsx     # MoneyInput, NumberInput, PercentInput
│   ├── ModelPicker.tsx         # Model picker (OptimToken catalog)
│   ├── ScenarioComparison.tsx
│   ├── ScenarioManager.tsx
│   └── ErrorBoundary.tsx
├── utils/              # Business logic and utilities
│   ├── calculations.ts         # The ROI engine (a single pure function)
│   ├── modelCatalog.ts         # Model prices: fetch, cache, embedded snapshot
│   ├── deepLink.ts             # URL parameters handed over by the hub
│   ├── scenario.ts             # Validation/migration of saved scenarios
│   ├── format.ts               # Money formatting and pluralisation
│   └── *.test.ts               # One test file per module
├── public/             # Static assets served as-is
│   ├── methodology.html        # GENERATED from METHODOLOGY.md — do not edit
│   └── images/                 # Icons and social card, generated by scripts/
├── scripts/            # Build scripts (price snapshot, methodology page, icons)
├── App.tsx             # Main component (~1,450 lines)
├── types.ts            # TypeScript type definitions
└── constants.ts        # Constants and presets
```

**Careful — five files are synced to another repository.**
`utils/calculations.ts`, `types.ts`, `constants.ts`, `utils/modelCatalog.ts` and
`utils/format.ts` are copied verbatim into the MCP server
([ai-roi-calculator-mcp](https://github.com/OptimNow/ai-roi-calculator-mcp)). They must compile
under a stricter `tsconfig` and run on Node, so keep type-only imports explicit (`import type`)
and do not assume any browser global exists. A change to the engine also needs a test and a
`METHODOLOGY.md` update.

**Generated files — never edit by hand.** `public/methodology.html` (from `METHODOLOGY.md`),
`public/images/icon-*.png`, `public/images/og-image.png`, `public/favicon.ico`, and the
embedded price snapshot inside `utils/modelCatalog.ts`. Each has a script under `scripts/`.

---

## Tests

### Running Tests

```bash
# All tests
npm test

# Watch mode (during development)
npm test -- --watch

# With coverage
npm test -- --coverage
```

### Writing Tests

Tests live next to the module they cover: `utils/*.test.ts` and `components/*.test.tsx`.
**Vitest** runs in the `node` environment by default; a component test opts into a DOM with a
`// @vitest-environment jsdom` docblock on the very first line of the file. Use `vi.fn()`, never
`jest.fn()` — there is no jest here.

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { calculateROI } from './calculations';
import { DEFAULT_INPUTS } from '../constants';
import { ValueMethod } from '../types';

describe('calculateROI', () => {
  it('caps churn reduction at the baseline churn rate', () => {
    const result = calculateROI({
      ...DEFAULT_INPUTS,
      valueMethod: ValueMethod.RETENTION,
      baselineChurnRate: 0.5,
      churnReductionAbsolute: 5.0, // ten times the churn that actually happens
      customersImpactedPerMonth: 10000,
      annualValuePerCustomer: 1200,
      successRate: 100,
    });

    expect(result.totalMonthlyValue).toBeCloseTo(5000, 0);
  });
});
```

**When to add tests:**
- New functions under `utils/`
- Bug fixes (regression tests)
- Complex business logic

---

## Need Help?

### Resources

- **README.md**: user documentation
- **METHODOLOGY.md**: the calculator's mathematical specification
- **CLAUDE.MD**: guide for working with Claude Code
- **ROADMAP.md**: planned features
- **SEO.md**: search and discoverability decisions, and known gaps
- **UAT_SCENARIOS.md**: acceptance test scenarios

### Communication

- 💬 **GitHub Issues**: for technical questions
- 📧 **Email**: [contact@optimnow.io](mailto:contact@optimnow.io) for general questions
- 🐛 **Bugs**: open an issue with the `bug` label
- 💡 **Ideas**: open an issue with the `enhancement` label

### New to GitHub?

No problem! Here are a few resources to get started:
- [GitHub Guide: Fork a Repo](https://docs.github.com/en/get-started/quickstart/fork-a-repo)
- [GitHub Guide: Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [Git Basics Guide](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

---

## Checklist Before Submitting

Before opening your PR, check that:

- [ ] Types pass (`npm run typecheck`) — Vite will not do this for you
- [ ] My code builds without errors (`npm run build`)
- [ ] Tests pass (`npm test`)
- [ ] I tested my changes manually
- [ ] I added tests where needed
- [ ] I updated the documentation where needed
- [ ] My commit follows the naming convention
- [ ] My branch is up to date with `main` (`git pull upstream main`)
- [ ] I removed any commented-out or debug code

---

## Licence

By contributing to this project, you agree that your contributions are published under the same
licence as the project (see LICENSE).

---

**🙏 Thanks for contributing to the AI ROI Calculator!**

Every contribution, large or small, helps improve the project for everyone.
