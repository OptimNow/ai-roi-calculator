# CLAUDE.MD - AI Assistant Project Guide

**Last Updated:** August 15, 2026
**Project:** AI ROI Calculator
**Version:** 0.5.0
**Live Demo:** https://airoicalculator.optimnow.io (custom domain) / https://ai-roi-calculator.vercel.app (Vercel default)

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
Testing:      Vitest
Deployment:   Vercel
```

### Key Design Patterns

1. **Single-Page Application:** All logic runs client-side (no backend)
2. **Client-Side State:** Uses React hooks (useState, useMemo, useCallback)
3. **LocalStorage Persistence:** Scenarios saved in browser storage
4. **Memoization:** Charts wrapped in React.memo for performance
5. **TypeScript Strict Mode:** Full type safety throughout

### Brand Identity

The full OptimNow brand identity is the `optimnow-brand` skill (source of truth), which lives in its own repository, `optimow_branding_skill`. It is **not** vendored into this one, so invoke the skill instead of looking for a local path.

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

**Logo assets:** the ones this app actually ships are in `public/images/` (Logo.png, favicon.jpg). The full set lives in the brand skill's `Ressources/Logos/`.

**Accessibility:** WCAG 2.1 AA compliant (ARIA labels, keyboard navigation)

---

## Project Structure

```
ai-roi-calculator/
├── App.tsx                     # Main application component (~1,400 lines)
│                               # Contains all state management and orchestration
├── components/
│   ├── Charts.tsx              # Memoized ROICurveChart & TornadoChart
│   ├── ErrorBoundary.tsx       # Top-level error boundary
│   ├── HelpGuide.tsx           # Comprehensive modal with step-by-step instructions
│   ├── InputComponents.tsx     # MoneyInput, NumberInput, PercentInput, SectionHeader
│   ├── ModelPicker.tsx         # Searchable model dropdown fed by the OptimToken catalog
│   ├── ScenarioComparison.tsx  # Side-by-side comparison with bar charts
│   └── ScenarioManager.tsx     # Save/load/delete/export/import scenarios
│                               # NOTE: form sections (value, cost model) and the results
│                               # dashboard are inline JSX in App.tsx, not separate components
├── utils/
│   ├── calculations.ts         # Core ROI calculation logic
│   │                           # All formulas for costs, value, break-even, sensitivity
│   ├── modelCatalog.ts         # Model price catalog: live fetch from OptimToken API,
│   │                           # localStorage cache, embedded snapshot fallback, preset helper
│   ├── deepLink.ts             # Scenario handover from OptimToken (?useCase=&volume=&model=&batch=)
│   └── format.ts               # pluralize() + Intl money formatters, SHARED with the MCP server
├── types.ts                    # TypeScript interfaces (UseCaseInputs, Scenario, etc.)
├── constants.ts                # Presets for common use cases (support, content, etc.)
├── index.tsx                   # React app entry point
├── index.css                   # Tailwind v4 import + @config + custom CSS
├── index.html                  # HTML shell: metadata (OG, Twitter, JSON-LD, manifest) + GA4 with hostname guard
├── public/
│   ├── robots.txt              # Crawler directives + sitemap reference
│   ├── sitemap.xml             # Search engine sitemap
│   ├── llms.txt                # LLM-discoverability descriptor
│   ├── manifest.webmanifest    # PWA manifest
│   └── images/                 # Logo.png, favicon.jpg
├── scripts/
│   └── refresh-model-snapshot.mjs  # Regenerates the embedded price snapshot (weekly CI)
├── .github/workflows/          # refresh-model-snapshot.yml
├── vite.config.ts              # Vite build configuration (dev server on port 3000)
├── vitest.config.ts            # Test config — node by default, jsdom per-file, see "Testing Philosophy"
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
- `ModelParams`: One model's identity and prices (`modelId`, input/output, cache-read, batch, `pricedAt`, or `useCallPricing` + `costPerCall`)
- Routing is two slots, `primaryModel` and `secondaryModel`, blended by `routingSimplePercent`. There is no `ModelTier` type and no third fallback slot.

### 2. `calculations.ts` - Business Logic
Exports exactly one pure function, `calculateROI(inputs, modifiers)`. Everything else is
internal to it: Layer 1 blending with cache and batch pricing, Layer 2 harness sum with the
overhead multiplier, the four value methods, break-even volume and payback.

Sensitivity is not a separate function either. App.tsx calls `calculateROI` repeatedly with
different `modifiers` and compares the results.

**This module is shared verbatim with the MCP server** (see "Sister projects"). A change here
ripples there through its sync script, so it needs a test and a METHODOLOGY update.

### 3. `App.tsx` - Orchestration
The main component (~1,400 lines):
- State management for all inputs
- Preset loading logic
- Scenario CRUD operations with localStorage
- Results calculation (memoized with useMemo)
- UI layout and component composition
- Export/import JSON functionality
- Copy-to-clipboard markdown summary with visual feedback
- Responsive header (icons hidden on mobile, compact spacing)

### 4. `constants.ts` - Presets
11 predefined use cases aligned with [OptimToken](https://optimtoken.optimnow.io/):
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

Every preset is bound to a real catalog model through `presetModel(provider, model, inTokens, outTokens)`, so it carries a `modelId`, a `pricedAt` date and the provider's published cache and batch rates. Current bindings: Claude Haiku 4.5, Claude Sonnet 5, Gemini 3.7 Flash, GPT-5.4, Kimi K2.6, DeepSeek V4 Flash 0423, MiniMax M3. Token profiles and cache hit rates match OptimToken's own use-case profiles. India-based cost defaults for harness and labour fields.

---

## Development Workflow

### Running Locally

```bash
npm install
npm run dev        # Start dev server on http://localhost:3000
npm run build      # Production build to dist/
npm run preview    # Preview production build
```

### Testing

```bash
npm test           # Run unit + component tests (95 cases)
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
2. **Update App.tsx:** Add the form branch in the inline value section (there is no ValueSection component)
3. **Update calculations.ts:** Add a case to the `switch (inputs.valueMethod)` inside `calculateROI` (there is no separate calculateValuePerUnit function)
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
breakEvenVolume = ceil(monthlyAmortizedFixedCost / (grossValuePerUnit - layer2CostPerUnit))
```

`layer2CostPerUnit` is the full variable cost per unit, Layer 1 included (see below), so the
denominator is the real unit margin. Undefined when that margin is zero or negative: no
volume ever covers the fixed costs. 0 when there are no fixed costs to cover.

### Layer 1 Cost (Infrastructure)
Two model slots, blended by `routingSimplePercent`. There is no third "fallback" tier.
Cache applies to input tokens only, and a published cache-read price beats the manual
discount. **Retries are billed here**, because a retried call is charged by the provider.

```typescript
// per slot, token-priced models
cacheReadPrice   = cachedInputPricePer1M ?? inputPrice * (1 - cachedTokenDiscount / 100)
cacheReadPrice   = useBatch ? cacheReadPrice * 0.5 : cacheReadPrice   // batch halves it
effectiveInput   = cacheReadPrice * hitRate + inputPrice * (1 - hitRate)

layer1CostPerUnit = (blendedInput + blendedOutput + blendedCall) * (1 + retryRate)
```

`retryRate` is a fraction (0.05, not 5). Call-priced models carry no token breakdown, so
cache and batch do not touch them; retries still do.

### Layer 2 Cost (Harness)
**Layer 2 is cumulative: it contains Layer 1.** The overhead multiplier applies to the sum,
not to the harness alone. The 7 harness fields are the ones in `types.ts`.

```typescript
harnessSum = orchestrationCostPerUnit + retrievalCostPerUnit + toolApiCostPerUnit
           + loggingMonitoringCostPerUnit + safetyGuardrailsCostPerUnit
           + networkEgressCostPerUnit + storageCostPerUnit

layer2CostPerUnit = (layer1CostPerUnit + harnessSum) * overheadMultiplier
```

### Layer 3 Value (depends on method)
See `METHODOLOGY.md` for complete formulas for all 4 value methods.

---

## Data Privacy & Security

- **No Backend:** All calculations run in browser
- **Model prices (read-only fetch):** The app fetches the public model-price catalog from `https://optimtoken.optimnow.io/api/llm-models` (anonymous GET, CORS-open, no user data sent) and caches it in localStorage for 24h. An embedded snapshot in `utils/modelCatalog.ts` is the offline fallback. See "Model Price Freshness" below.
- **LocalStorage:** Scenarios saved locally, never sent to servers
- **Analytics:** GA4 (`G-188H55KPFM`) + Vercel Analytics. Both track anonymous usage events (page views, mode toggle, preset loads, exports, OptimNow CTA clicks). **No input values, no scenario data, no PII** are ever sent — only event names and the use-case label (which is a preset name like "Customer Support Bot", not user-entered content).
- **GA4 hostname guard:** GA4 `config` and `event` calls are gated by a regex matching only `optimnow.io` (and subdomains) + `localhost`. Forks deployed elsewhere will load `gtag.js` but never fire any tracking — protects shared OptimNow analytics from pollution.
- **Export Only:** User manually exports data as JSON if desired

---

## Model Price Freshness

Prices come from the [OptimToken](https://optimtoken.optimnow.io), which refreshes daily. Three layers keep the calculator in sync:

1. **Runtime fetch** (`utils/modelCatalog.ts`): `fetchModelCatalog()` resolves in this order — fresh localStorage cache (< 24h) → live API → stale cache → embedded snapshot. It never rejects; `catalog.source` reports which layer answered, and the UI shows it ("Live prices · OptimToken · <date>").

   **Domain gotcha:** the hub was renamed to **OptimToken** at `optimtoken.optimnow.io`. The former `aipricinghub.optimnow.io` 308-redirects there (configured in Vercel, not in the hub repo). That redirect response carries no `Access-Control-Allow-Origin` header, so a cross-origin fetch aimed at the old domain fails outright — only the final response sets the header. `API_URLS` therefore lists the current domain first and the old one as a fallback, in case the two are ever swapped back. Human-facing links use `PRICING_HUB_URL`.

2. **Auto-repricing** (`repriceModels()`): whenever the catalog resolves, every model in the form carrying a `modelId` is repriced against it — input/output, cache-read and batch prices, plus `pricedAt`. Applied on mount, on manual refresh, on preset load and on reset. Two deliberate exceptions:
   - **Custom-priced models** (no `modelId`) are never touched — that's how negotiated rates survive.
   - **Scenarios loaded from storage** keep their recorded prices, because loading one doesn't change the catalog. A scenario is the record of a decision at a point in time. (Hitting refresh afterwards *will* reprice it — that's an explicit user action.)

3. **Snapshot refresh** (`npm run refresh:models`): regenerates the embedded fallback between the `SNAPSHOT-START` / `SNAPSHOT-END` markers. Run weekly by `.github/workflows/refresh-model-snapshot.yml`. The script parses `presetModel()` calls out of `constants.ts` and **aborts if any preset's model has left the catalog** — otherwise `presetModel()` would throw at import and take the app down. Never hand-edit the snapshot block.

When adding a preset, use `presetModel('Provider', 'Model Name', inTokens, outTokens)` so it inherits a real identity and published cache/batch rates.

## Deep Links from the OptimToken

The hub hands a scenario over so the calculator opens on the same footing (`utils/deepLink.ts`):

```
https://airoicalculator.optimnow.io/?useCase=supportTicket&volume=100000&model=anthropic/claude-haiku-4-5&batch=1
```

| Param | Meaning | Validation |
|---|---|---|
| `useCase` (or `preset`) | Hub use-case key, mapped to a preset key | Unknown key ignored. Two keys diverge: `supportTicket`→`support`, `invoiceProcessing`→`invoice` |
| `volume` | Monthly volume | Positive number, capped at 1e9; junk ignored |
| `model` | `modelId` (`provider-slug/model-slug`, same as hub model page URLs) | Must match the slug pattern; unknown model falls back to the preset's, with a notice |
| `batch` | Async batch processing | `1`/`true`/`0`/`false` |

Everything is optional and independently validated — a malformed value is ignored rather than failing the load. Applied at mount for preset/volume/batch; the model waits for the catalog, since the embedded snapshot only carries the top models and one picked from the hub's full catalog may not exist until the live fetch lands.

A dismissible banner confirms what carried over. (Both form sections are expanded by default, so a handed-over model is visible on arrival.)

**When adding a preset**, check `HUB_USE_CASE_TO_PRESET` in `utils/deepLink.ts` if the hub has a matching use case under a different key.

## Cost Model Entry (Layer 1 & 2)

**Billing basis** — `ModelParams.useCallPricing` / `costPerCall` are surfaced in `components/ModelPicker.tsx` (`ModelCostInputs`) as a per-token / per-call toggle, shown only on custom-priced models: the hub catalog is entirely token-priced, so a catalog model always has a $/1M rate. Switching to per-call detaches the catalog identity, because the model's $/1M, cache and batch rates no longer describe the cost. A per-call model ignores tokens, cache and batch in `calculations.ts`; retries still apply.

**Harness entry unit** — harness costs are stored per unit but entered per 1,000 by default (`harnessPer1k` in App.tsx), because vendors quote per 1,000 calls. This is a display transform only: `harnessValue()` scales for display, `updateHarness()` scales back and rounds to kill floating-point residue. A running subtotal sits under the fields, and flags when Simple mode is hiding lines that still cost money.

All seven harness fields now have a control — `networkEgressCostPerUnit` was summed in `calculations.ts` but had no UI, so presets charged it invisibly.

## Analytics & Event Tracking

GA4 is wired in `index.html` via `window.trackEvent(eventName, params)`. From TypeScript, always call it with optional chaining to avoid runtime errors and TS complaints:

```ts
(window as any).trackEvent?.('event_name', { key: 'value' });
```

**Currently tracked events** (App.tsx, except `model_selected` which fires from `components/ModelPicker.tsx`):

| Event | Trigger | Params |
|---|---|---|
| `optimnow_cta_clicked` | OptimNow logo click in header | `{ source: 'airoicalculator_header' }` |
| `mode_switched` | Simple/Advanced toggle | `{ mode: 'simple' \| 'advanced' }` |
| `preset_loaded` | Preset dropdown selection | `{ preset_key: string }` |
| `results_exported` | JSON download or Markdown copy | `{ format: 'json' \| 'markdown', use_case: string }` |
| `model_selected` | Model picked from the OptimToken catalog | `{ model_id: string, slot: 'primary' \| 'secondary' }` |
| `deeplink_loaded` | Arrived from the hub with a scenario in the URL | `{ source: 'aipricinghub', use_case: string, model_id: string, volume: number }` |

When adding new tracking: keep events business-meaningful (decision points, conversions, drop-offs), never log raw input values, and stick to the `(window as any).trackEvent?.(...)` pattern — do **not** add a global `window.trackEvent` TS declaration.

---

## Testing Philosophy

1. **Unit Tests:** the pure modules under `utils/`
2. **Edge Cases:** Zero, negative, NaN, Infinity handling
3. **Component Tests:** Input validation and accessibility, rendered with React Testing Library
4. **Manual Testing:** Use UAT_SCENARIOS.md for acceptance testing

**Test Coverage:** 95 tests across 5 files — `calculations` (33), `deepLink` (18), `format`
(11), `modelCatalog` (11) under `utils/`, plus `InputComponents` (22) under `components/`:
- All 4 value methods
- Break-even calculations
- Sensitivity analysis
- Edge cases and error conditions
- Clamping, blur normalization and label association in `components/InputComponents.tsx`

**Two environments, one config.** `vitest.config.ts` runs everything in `node` by default and
`include`s both `utils/**/*.test.ts` and `components/**/*.test.tsx`. A component test opts into
a DOM with a `// @vitest-environment jsdom` docblock on its first line — jsdom costs real
startup time, so the pure calculation tests are deliberately left out of it. Component test
files also need `import '@testing-library/jest-dom/vitest'` for the `toBeInTheDocument` /
`toHaveValue` matchers. Use `vi.fn()`, never `jest.fn()` — there is no jest here.

**Input validation is lenient on change, strict on blur.** `NumberInput`, `MoneyInput` and
`PercentInput` only call `onChange` for a parseable value, and normalize an empty or
out-of-range field on blur. Assert clearing and negative-value behaviour with
`fireEvent.blur`, not `fireEvent.change` — clamping mid-keystroke would fight the user.

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

## Sister projects

This repository does not stand alone. Two other projects depend on it, and one feeds it.

| Project | Relationship |
|---|---|
| [OptimToken](https://optimtoken.optimnow.io) (repo: `cloud-sparkle-compare`) | **Feeds this one.** Publishes the model price catalog consumed by `modelCatalog.ts`, and links here with a prefilled scenario. |
| [ai-roi-calculator-mcp](https://github.com/OptimNow/ai-roi-calculator-mcp) | **Consumes this one.** Copies `calculations.ts`, `types.ts`, `constants.ts`, `modelCatalog.ts` and `format.ts` verbatim through its `scripts/sync-engine.mjs`. |

**What this means when you edit the engine.** Those five files are the contract. Change one
and the MCP is stale until someone runs `npm run sync:engine` there; its CI checks on every PR
and weekly, so the drift surfaces on its own. They also compile under a stricter `tsconfig`
(`verbatimModuleSyntax`, `noUnusedLocals`) and run on Node, so keep type-only imports explicit
and do not assume browser globals exist.

The two once drifted apart, and the same preset returned a 7-point different ROI depending on
which tool you asked. The sync script and the golden-scenario suite exist to stop that
recurring.

## Roadmap Context

**Current state (August 2026, v0.5.0).** Live model prices from OptimToken with automatic
repricing, per-token and per-call billing, published cache-read and batch rates, deep links
from the hub, per-1,000 harness entry, 95 tests, WCAG 2.1 AA.

**Not built.** Self-hosted GPU cost modelling, Monte Carlo confidence intervals, Excel export,
user accounts, sharing.

See `ROADMAP.md` for full details.

---

## Known Limitations

1. **No self-hosted GPU pricing.** Token-based and flat per-request billing are both supported; amortising your own GPUs is not.

2. **Fixed Analysis Horizon:** No dynamic month selection yet (uses input field).

3. **No User Accounts:** LocalStorage only, no cross-device sync.

4. **Limited Export:** JSON and Markdown only, no Excel.

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
npm test                       # Run tests (vitest run)

# Model prices
npm run refresh:models         # Regenerate the embedded price snapshot

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
This is a large codebase (App.tsx alone is ~1,400 lines). When working on specific features:
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
- `main` is the default branch and auto-deploys to Vercel, so work on a branch and open a PR
- Sessions often run in a git worktree under `.claude/worktrees/`, which can sit behind `main`. Check before assuming the file you are reading is current.
- See git log for commit message style

---

**This document was created to help AI assistants quickly understand and contribute to the AI ROI Calculator project. Keep it updated as the project evolves.**
