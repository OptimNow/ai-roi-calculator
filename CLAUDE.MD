# CLAUDE.MD - AI Assistant Project Guide

**Last Updated:** January 11, 2026
**Project:** AI ROI Calculator
**Version:** v1.1
**Live Demo:** https://ai-roi-calculator.vercel.app

---

## Quick Start for AI Assistants

This document helps AI assistants (Claude, etc.) quickly understand and work with this codebase.

### What This Project Does

An interactive web application that calculates ROI for AI/LLM implementations using a 3-layer cost framework:
- **Layer 1 (Infrastructure):** Model inference costs (token-based pricing, cache optimization, multi-model routing)
- **Layer 2 (Harness):** Orchestration, retrieval, monitoring, tool APIs, operational overhead
- **Layer 3 (Business Value):** Four value methods (Cost Displacement, Revenue Uplift, Retention Uplift, Premium Monetization)

### Core Purpose

Help organizations make data-driven decisions about AI implementations by analyzing costs, value generation, break-even scenarios, and sensitivity analysis.

---

## Architecture Overview

### Tech Stack

```
Framework:    React 19.2.3
Language:     TypeScript
Build:        Vite
Styling:      Tailwind CSS (PostCSS config)
Charts:       Recharts
Icons:        Lucide React
Testing:      Vitest + React Testing Library
Deployment:   Vercel
```

### Key Design Patterns

1. **Single-Page Application:** All logic runs client-side (no backend)
2. **Client-Side State:** Uses React hooks (useState, useMemo, useCallback)
3. **LocalStorage Persistence:** Scenarios saved in browser storage
4. **Memoization:** Charts wrapped in React.memo for performance
5. **TypeScript Strict Mode:** Full type safety throughout

### Brand Identity

The full OptimNow brand identity is defined in `Skills/optimow_branding_skill/SKILL.md` (source of truth).

**Colors:**
- **Charcoal (#2C2C2C):** Dark sections, headers, all text
- **Light Grey (#F4F4F4):** Preferred background (over white)
- **White (#FFFFFF):** Use sparingly
- **Dark Grey (#C1C1C1):** Borders, dividers
- **Chartreuse (#ACE849):** Accent ONLY — icons, badges, data highlights
- **Green rules:** Never for text, never large backgrounds, one accent per element, use like punctuation

**Typography (Google Fonts):**
- **Headlines:** Manrope Bold
- **Body:** Almarai Regular
- **Labels/Callouts:** Ayuthaya

**Visual Style:**
- No gradients, no shadows, no textures
- Flat, minimal, system-diagram inspired
- Clean geometry: circles, lines, bars

**Logo assets:** `Skills/optimow_branding_skill/Ressources/Logos/`
- **Accessibility:** WCAG 2.1 AA compliant (ARIA labels, keyboard navigation)

---

## Project Structure

```
ai-roi-calculator/
├── App.tsx                     # Main application component (55KB, 1500+ lines)
│                               # Contains all state management and orchestration
├── components/
│   ├── Charts.tsx              # Memoized ROICurveChart & TornadoChart
│   ├── FixedCostsSection.tsx   # Integration, training, change management costs
│   ├── GeneralInputsSection.tsx # Volume, success rate, horizon, unit name
│   ├── HarnessSection.tsx      # Layer 2: orchestration, retrieval, tools, monitoring
│   ├── HelpGuide.tsx           # Comprehensive modal with step-by-step instructions
│   ├── InfrastructureSection.tsx # Layer 1: model costs, tokens, cache, routing
│   ├── ResultsDashboard.tsx    # 5 KPI cards + cost breakdown + insights + charts
│   ├── ScenarioComparison.tsx  # Side-by-side comparison with bar charts
│   ├── ScenarioManager.tsx     # Save/load/delete/export/import scenarios
│   ├── SensitivitySimulator.tsx # Multiplier-based what-if testing
│   └── ValueSection.tsx        # Layer 3: 4 value method forms
├── utils/
│   └── calculations.ts         # Core ROI calculation logic (20KB, 600+ lines)
│                               # All formulas for costs, value, break-even, sensitivity
├── types.ts                    # TypeScript interfaces (UseCaseInputs, Scenario, etc.)
├── constants.ts                # Presets for common use cases (support, content, etc.)
├── index.tsx                   # React app entry point
├── index.css                   # Tailwind directives + custom CSS
├── index.html                  # HTML shell with metadata
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind v4 configuration
├── postcss.config.js           # PostCSS with Tailwind plugin
├── tsconfig.json               # TypeScript configuration
├── METHODOLOGY.md              # Complete mathematical specification
├── ROADMAP.md                  # Product development plan
├── UAT_SCENARIOS.md            # User acceptance testing guide
└── DEPLOYMENT.md               # Vercel deployment instructions
```

---

## Key Files to Understand

### 1. `types.ts` - Data Model
All TypeScript interfaces:
- `UseCaseInputs`: The main input state (general, fixed, infra, harness, value)
- `Scenario`: Saved calculation snapshot (name, inputs, metrics, timestamp, color)
- `ValueMethod`: Four options (costDisplacement, revenueUplift, retentionUplift, premiumMonetization)
- `ModelTier`: Primary, secondary, fallback (for advanced multi-model routing)

### 2. `calculations.ts` - Business Logic
Core calculation functions (pure functions, fully tested):
- `calculateROI()`: Main entry point, returns all metrics
- `calculateModelCost()`: Layer 1 with cache optimization and routing
- `calculateHarnessCost()`: Layer 2 with retry overhead
- `calculateValuePerUnit()`: Layer 3 based on selected value method
- `calculateBreakEvenVolume()`: Volume needed for positive ROI
- `calculateBreakEvenMonths()`: Months to recoup fixed costs
- `calculateSensitivityAnalysis()`: ±20% variable impact on ROI

### 3. `App.tsx` - Orchestration
The main component (1500+ lines):
- State management for all inputs
- Preset loading logic
- Scenario CRUD operations with localStorage
- Results calculation (memoized with useMemo)
- UI layout and component composition
- Export/import JSON functionality
- Copy-to-clipboard markdown summary with visual feedback
- Responsive header (icons hidden on mobile, compact spacing)

### 4. `constants.ts` - Presets
11 predefined use cases aligned with [AI Pricing Hub](https://aipricinghub.optimnow.io/):
- Customer Support Bot (Cost Displacement)
- Knowledge Q&A (Cost Displacement)
- Meeting Summary (Cost Displacement)
- Marketing Content (Cost Displacement)
- Coding Task (Cost Displacement)
- Invoice Processing (Cost Displacement)
- Call Summary (Cost Displacement)
- Agent Workflow (Cost Displacement)
- E-commerce Recommendations (Revenue Uplift)
- Customer Retention AI (Retention Uplift)
- AI Premium Features (Premium Monetization)

Each preset includes realistic token counts and model pricing mapped to real providers (GPT-4o mini, Claude Haiku 4.5, Claude Sonnet 4.6). India-based cost defaults for harness/labor fields.

---

## Development Workflow

### Running Locally

```bash
npm install
npm run dev        # Start dev server on http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

### Testing

```bash
npm test           # Run unit tests (30+ test cases)
```

### Making Changes

**IMPORTANT: Code Quality Standards**

1. **No Over-Engineering:**
   - Only add features explicitly requested
   - Don't refactor code unless necessary
   - Keep solutions simple and focused
   - Avoid adding comments/docs to unchanged code

2. **TypeScript First:**
   - All new code must be fully typed
   - No `any` types unless absolutely necessary
   - Use strict mode

3. **Accessibility:**
   - All interactive elements need ARIA labels
   - Maintain keyboard navigation support
   - Test with screen readers

4. **Performance:**
   - Memoize expensive calculations with useMemo
   - Memoize chart components with React.memo
   - Avoid unnecessary re-renders

5. **Testing:**
   - Add unit tests for new calculation logic
   - Test edge cases (zero, negative, NaN)
   - Validate input ranges

---

## Common Tasks for AI Assistants

### Task: Add a New Input Field

1. **Update types.ts:** Add field to appropriate interface
2. **Update constants.ts:** Add default value to presets
3. **Update component:** Add input in relevant section (General/Fixed/Infra/Harness/Value)
4. **Update calculations.ts:** Use new field in calculation logic
5. **Update tests:** Add test cases for new field
6. **Update HelpGuide.tsx:** Document new field if needed

### Task: Add a New Value Method

1. **Update types.ts:** Add new value method to ValueMethod type
2. **Update ValueSection.tsx:** Create new form section with switch case
3. **Update calculations.ts:** Add new calculateValuePerUnit case
4. **Update constants.ts:** Add preset examples using new method
5. **Update METHODOLOGY.md:** Document formula and theory
6. **Add tests:** Create test cases in calculations.test.ts

### Task: Fix a Calculation Bug

1. **Read calculations.ts:** Understand current formula
2. **Read METHODOLOGY.md:** Verify intended formula
3. **Check tests:** See if test expectations are correct
4. **Fix calculation:** Update formula in calculations.ts
5. **Update tests:** Adjust test expectations if needed
6. **Test edge cases:** Zero, negative, very large numbers

### Task: Update UI Component

1. **Check types.ts:** Understand data structure
2. **Read component file:** Understand current implementation
3. **Maintain accessibility:** Keep ARIA labels and keyboard nav
4. **Preserve brand colors:** Use Chartreuse (#ACE849) for primary actions
5. **Test responsive design:** Check mobile and desktop layouts

---

## Important Constraints & Rules

### DO:
- ✅ Use TypeScript strict mode
- ✅ Add ARIA labels for accessibility
- ✅ Memoize expensive computations
- ✅ Write unit tests for calculation changes
- ✅ Follow existing code style
- ✅ Keep calculations in calculations.ts (separation of concerns)
- ✅ Preserve client-side-only architecture (no backend calls)

### DON'T:
- ❌ Add backend/server code (it's client-side only)
- ❌ Remove existing tests without replacement
- ❌ Break TypeScript strict mode
- ❌ Add dependencies without discussion
- ❌ Change brand colors (#ACE849 is sacred)
- ❌ Add features not explicitly requested
- ❌ Refactor working code unnecessarily
- ❌ Add time estimates to roadmap items

---

## Critical Calculation Formulas

### ROI Percentage
```typescript
roi = ((totalValue - totalCost) / totalCost) * 100
```

### Break-even Volume
```typescript
breakEvenVolume = monthlyAmortizedFixedCost / (grossValuePerUnit - layer2CostPerUnit)
```

### Layer 1 Cost (Infrastructure)
```typescript
modelCost = (primaryCost * primaryPct + secondaryCost * secondaryPct + fallbackCost * fallbackPct) * volume
cachedCost = modelCost * cacheHitRate * cacheDiscount
finalCost = modelCost - cachedCost
```

### Layer 2 Cost (Harness)
```typescript
harnessBaseCost = orchestrationCost + retrievalCost + toolAPICost + loggingCost + monitoringCost + safetyCost + egressCost + storageCost
retryMultiplier = 1 + (retryRate / 100)
harnessCost = harnessBaseCost * retryMultiplier * overheadMultiplier * volume
```

### Layer 3 Value (depends on method)
See `METHODOLOGY.md` for complete formulas for all 4 value methods.

---

## Data Privacy & Security

- **No Backend:** All calculations run in browser
- **LocalStorage:** Scenarios saved locally, never sent to servers
- **No Analytics:** No tracking or data collection
- **No API Calls:** Completely offline-capable after initial load
- **Export Only:** User manually exports data as JSON if desired

---

## Testing Philosophy

1. **Unit Tests:** All calculation functions in calculations.ts
2. **Edge Cases:** Zero, negative, NaN, Infinity handling
3. **Integration Tests:** Component input validation
4. **Manual Testing:** Use UAT_SCENARIOS.md for acceptance testing

**Test Coverage:** 30+ test cases covering:
- All 4 value methods
- Break-even calculations
- Sensitivity analysis
- Edge cases and error conditions

---

## Deployment

**Platform:** Vercel
**Branch:** `main` (auto-deploys on push)
**Build Command:** `npm run build`
**Output Directory:** `dist/`

**Important:** After Tailwind config changes, clear Vercel cache:
```bash
# See DEPLOYMENT.md for full instructions
```

---

## Roadmap Context

### Current Version: v1.1 (January 2026)
**Status:** Phase 1 Complete
- ✅ Core 3-layer ROI calculator
- ✅ 4 value methods
- ✅ What-If scenarios with unlimited comparisons
- ✅ Break-even analysis with ROI curve
- ✅ Sensitivity analysis with tornado chart
- ✅ 30+ unit tests
- ✅ WCAG 2.1 AA accessibility

### Next Version: v1.2 (Q2 2026)
**Focus:** Advanced Projections
- 🚀 Self-hosted model pricing (GPU cost modeling)
- 🚀 Confidence intervals (Monte Carlo simulation)
- 🚀 Export to Excel with formulas
- 🚀 Preset customization

See `ROADMAP.md` for full details.

---

## Known Limitations

1. **API-Only Pricing:** Currently assumes token-based API pricing (OpenAI, Anthropic, etc.). Self-hosted GPU pricing coming in v1.2.

2. **Fixed Analysis Horizon:** No dynamic month selection yet (uses input field).

3. **No User Accounts:** LocalStorage only, no cross-device sync.

4. **Limited Export:** JSON only, Excel export coming in v1.2.

5. **No Collaboration:** Single-user application, no sharing features.

---

## Troubleshooting Guide

### Issue: Calculation Results Seem Wrong
1. Check `calculations.ts` for formula bugs
2. Verify input validation in component
3. Check METHODOLOGY.md for correct formula
4. Add console.logs to debug intermediate values
5. Write failing test case first

### Issue: Component Not Re-rendering
1. Check if state is properly updated (use functional setState)
2. Verify useMemo dependencies array
3. Check React.memo comparison function for charts
4. Look for mutation of state objects (use spread operator)

### Issue: TypeScript Errors
1. Check types.ts for interface definitions
2. Verify all fields are properly typed
3. Use type assertions only when necessary
4. Run `npm run build` to see full type errors

### Issue: Accessibility Failures
1. Verify ARIA labels on all inputs
2. Check keyboard navigation (Tab, Enter, Escape)
3. Test with screen reader (NVDA, JAWS, VoiceOver)
4. Ensure all interactive elements have visible focus states

---

## Code Style Guidelines

### TypeScript
- Use `interface` for object shapes, `type` for unions
- Prefer `const` over `let`
- Use arrow functions for components and callbacks
- Destructure props and state

### React
- Functional components only (no class components)
- Use hooks (useState, useMemo, useCallback, useEffect)
- Memoize expensive calculations
- Keep components under 500 lines (extract when larger)

### CSS/Tailwind
- Use Tailwind utility classes first
- Add custom CSS only when necessary
- Mobile-first responsive design
- Use Chartreuse (#ACE849) for primary actions

### Comments
- JSDoc for function documentation
- Inline comments for complex logic only
- Don't comment obvious code
- Explain "why" not "what"

---

## Useful Commands

```bash
# Development
npm run dev                    # Start dev server

# Building
npm run build                  # Production build
npm run preview                # Preview production build

# Testing
npm test                       # Run tests
npm run test:coverage          # Run tests with coverage

# Git workflow
git status                     # Check status
git add .                      # Stage all changes
git commit -m "message"        # Commit with message
git push origin main           # Push to main branch

# Vercel (via GitHub)
git push origin main           # Auto-deploys to production
```

---

## Getting Help

### Documentation
- **README.md:** User-facing documentation
- **METHODOLOGY.md:** Complete mathematical specification
- **ROADMAP.md:** Product development plan
- **UAT_SCENARIOS.md:** User acceptance testing scenarios
- **DEPLOYMENT.md:** Vercel deployment guide
- **HelpGuide.tsx:** In-app user guide

### External Resources
- **React Docs:** https://react.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org/en-US/api
- **Vite:** https://vitejs.dev/guide/

### Project Links
- **Live Demo:** https://ai-roi-calculator.vercel.app
- **Developer:** OptimNow (https://www.optimnow.io)
- **Repository:** GitHub (see package.json for URL)

---

## Final Notes for AI Assistants

### Context Window Management
This is a large codebase (App.tsx alone is 1500+ lines). When working on specific features:
1. Read only the files you need
2. Use types.ts as the single source of truth for data structures
3. Refer to METHODOLOGY.md for formula verification
4. Check constants.ts for default values

### Communication Style
- Be concise and specific
- Reference file paths and line numbers when discussing code
- Ask clarifying questions before making assumptions
- Propose changes before implementing (especially breaking changes)

### Version Control Awareness
- Current branch is `main`
- Repository is clean (no uncommitted changes)
- Recent commits focus on Phase 1 completion
- See git log for commit message style

---

**This document was created to help AI assistants quickly understand and contribute to the AI ROI Calculator project. Keep it updated as the project evolves.**
