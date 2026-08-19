# CLAUDE.MD - AI Assistant Project Guide

**Last Updated:** August 19, 2026
**Project:** AI ROI Calculator
**Version:** 0.6.0
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
4. **Memoization:** Charts wrapped in React.memo, with its **default shallow compare** — their
   data is memoized in App.tsx so prop identity is stable. Do not reintroduce custom
   comparators; the previous `JSON.stringify` ones existed only to paper over data arrays
   rebuilt inline on every render.
5. **Code splitting:** the three modals (HelpGuide, ScenarioManager, ScenarioComparison) are
   `React.lazy` and mounted only while open — ~73 kB off the critical path. App.tsx's
   conditional rendering (`{showHelp && <HelpGuide …>}`) is now the **only** gate: the modals
   no longer take an `isOpen` prop, so rendering one unconditionally would both fetch its
   chunk on first paint and leave it permanently open. Charts stay eager: they are visible on
   arrival and deferring them would trade bundle size for a layout shift.
6. **Vendor chunk:** `vite.config.ts` sends everything under `node_modules` to a single
   `vendor` chunk, so an app-only deploy invalidates ~24 kB gzip instead of ~205 kB. Keep it
   as one chunk — splitting React and Recharts apart makes the charts chunk evaluate before
   React is initialised (`undefined ... 'forwardRef'`), which the dev server does not reveal.
   **Verify bundle changes against `npm run build` + `npm run preview`, never the dev server.**
7. **Modal behaviour lives in `components/useDialog.ts`:** Escape to close, focus moved to the
   close button on open and returned to the trigger on close. All three modals use it and
   carry `role="dialog"` / `aria-modal` / `aria-labelledby`.
8. **TypeScript Strict Mode:** `"strict": true` in tsconfig.json, and it passes clean. Nothing in the build enforces it — Vite strips types without checking them — so `npm run typecheck` is the only gate.

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

**Accessibility:** WCAG 2.1 AA (ARIA labels, keyboard navigation, dialog semantics). Note the
brand rule is also an accessibility rule: chartreuse on white measures **1.46:1**, so it can
never carry text or a lone focus ring. Result figures are charcoal and chartreuse marks them
with a rule, bar or dot; inputs pair the chartreuse ring with a charcoal focus border.

---

## Project Structure

```
ai-roi-calculator/
├── App.tsx                     # Main application component (~1,520 lines)
│                               # Contains all state management and orchestration
├── components/
│   ├── Charts.tsx              # Memoized CostValueChart, CostBreakdownChart,
│   │                           # ROICurveChart & TornadoChart
│   ├── ErrorBoundary.tsx       # Top-level error boundary
│   ├── HelpGuide.tsx           # Comprehensive modal with step-by-step instructions
│   ├── InputComponents.tsx     # MoneyInput, NumberInput, PercentInput, SectionHeader
│   ├── ModelPicker.tsx         # Searchable model dropdown fed by the OptimToken catalog
│   ├── ScenarioComparison.tsx  # Side-by-side comparison with bar charts
│   ├── ScenarioManager.tsx     # Save/load/delete/export/import scenarios
│   └── useDialog.ts            # Modal behaviour shared by the three overlays:
│                               # Escape to close, focus in on open / back out on close
│                               # NOTE: form sections (value, cost model) and the results
│                               # dashboard are inline JSX in App.tsx, not separate components
├── utils/
│   ├── calculations.ts         # Core ROI calculation logic
│   │                           # All formulas for costs, value, break-even, sensitivity
│   ├── modelCatalog.ts         # Model price catalog: live fetch from OptimToken API,
│   │                           # localStorage cache, embedded snapshot fallback, preset helper
│   ├── deepLink.ts             # Scenario handover from OptimToken (?useCase=&volume=&model=&batch=)
│   ├── scenario.ts             # Validates + migrates saved scenarios at both untrusted
│   │                           # boundaries (JSON import, localStorage). NOT synced to the MCP
│   └── format.ts               # pluralize() + Intl money formatters, SHARED with the MCP server
├── types.ts                    # TypeScript interfaces (UseCaseInputs, Scenario, etc.)
├── constants.ts                # Presets for common use cases (support, content, etc.)
├── index.tsx                   # React app entry point
├── index.css                   # Tailwind v4 import + @config + custom CSS
├── index.html                  # HTML shell: metadata (OG, Twitter, JSON-LD, manifest) + GA4 with hostname guard
├── public/
│   ├── methodology.html        # GENERATED from METHODOLOGY.md — never hand-edit
│   ├── robots.txt              # Crawler directives + sitemap reference
│   ├── sitemap.xml             # Search engine sitemap (home + methodology)
│   ├── llms.txt                # LLM-discoverability descriptor (link-list convention)
│   ├── manifest.webmanifest    # PWA manifest
│   └── images/                 # Logo.png, favicon.jpg
├── scripts/
│   ├── build-methodology.mjs   # METHODOLOGY.md -> public/methodology.html (runs on prebuild)
│   └── refresh-model-snapshot.mjs  # Regenerates the embedded price snapshot (weekly CI)
├── .github/workflows/          # refresh-model-snapshot.yml
├── vercel.json                 # Security headers, SPA rewrite, immutable cache on /assets/*,
│                               # day cache on /images/*, /favicon.ico redirect, canonical host
├── vite.config.ts              # Vite build config: dev server on port 3000, single vendor chunk
├── vitest.config.ts            # Test config — node by default, jsdom per-file, pool: threads,
│                               # passWithNoTests: false. See "Testing Philosophy"
├── tailwind.config.js          # Tailwind v4 configuration
├── postcss.config.js           # PostCSS with Tailwind plugin
├── tsconfig.json               # TypeScript configuration
├── METHODOLOGY.md              # Complete mathematical specification
├── ROADMAP.md                  # Product development plan
├── UAT_SCENARIOS.md            # User acceptance testing guide
├── SEO.md                      # Discoverability decisions + known gaps (read before
│                               # touching index.html metadata, robots, sitemap or llms.txt)
├── CONTRIBUTING.md             # Contribution guide (written in French)
└── DEPLOYMENT.md               # Vercel deployment instructions
```

---

## Key Files to Understand

### 1. `types.ts` - Data Model
All TypeScript interfaces:
- `UseCaseInputs`: The main input state (general, fixed, infra, harness, value)
- `Scenario`: Saved calculation snapshot (name, inputs, metrics, timestamp, color, optional
  `schemaVersion`). Absent `schemaVersion` means it predates versioning — `utils/scenario.ts`
  backfills rather than rejects it.
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
The main component (~1,520 lines):
- State management for all inputs
- Preset loading logic
- Scenario CRUD operations with localStorage
- Results calculation (memoized with useMemo)
- UI layout and component composition
- Export/import JSON functionality
- Copy-to-clipboard markdown summary with visual feedback
- Responsive header (icons hidden on mobile, compact spacing)

**`results` vs `baselineResults`.** `results` runs `calculateROI(inputs, modifiers)` and is
what the dashboard renders. `baselineResults` drops the sensitivity modifiers and is what
**saving a scenario, the JSON export and the Markdown summary** all use. Keep it that way: a
scenario records unmodified `inputs`, so pairing them with slider-modified figures produced a
record where `results !== calculateROI(inputs)` — the saved card and the reloaded scenario
disagreed, and the simulator's own caption already promised sliders are not saved.

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

**Changing a preset value is not a local edit.** `constants.ts` is synced to the MCP server
like `calculations.ts` is, and METHODOLOGY.md ends with a worked end-to-end example built on
the `support` preset's actual numbers. So a preset change means three things, not one:

1. the calculator itself,
2. METHODOLOGY.md's "Appendix: Worked Example" if `support` moved — inputs **and** every
   figure derived from them, since the example carries the arithmetic through to ROI, payback
   and break-even volume,
3. the MCP's golden scenarios, via `npm run sync:engine` and `generate-goldens.mjs` there.

Check the blast radius before merging: in the `support` scenario the variable costs are small
enough that fixed-cost amortization dominates, so a change of a few thousand dollars in
one-time costs can halve the headline ROI.

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
npm test           # Run unit + component tests (121 cases)
npm run typecheck  # tsc --noEmit under strict. Vite does NOT typecheck, so run this before pushing
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
4. **Preserve brand colors:** Chartreuse (#ACE849) fills primary actions and marks things —
   never as text, and never as the only signal (it is 1.46:1 on white)
5. **Test responsive design:** Check mobile and desktop layouts. Put heights on chart *cells*,
   not on the grid that wraps them, or stacked mobile charts get a fraction of the space.

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

**Only defined for value methods whose total value scales with volume.** The derivation
cancels volume out of both sides, which needs `grossValuePerUnit` to be volume-invariant.
Under **Retention Uplift** it is not: total value comes from `customersImpactedPerMonth`, an
input independent of volume, and the per-unit figure is back-derived by dividing by volume —
so value x volume is a constant and the equation has no solution of that shape. It returned
7,051 on the shipped preset at a volume already earning +$1,253/month. Retention now returns
`undefined`: the two break-even **insight** cards hide, and the KPI card reads N/A with the
subtitle **"Doesn't scale with volume"**. It must not say "negative margin" there — that is
the subtitle for a genuinely negative unit margin, and the retention preset is undefined here
while earning a healthy positive one. Premium Monetization keeps break-even: App.tsx
synchronises `subscribers` with `monthlyVolume`, so the per-unit margin is real at baseline.

### Layer 1 Cost (Infrastructure)
Two model slots, blended by `routingSimplePercent`. There is no third "fallback" tier.
Cache applies to input tokens only, and a published cache-read price beats the manual
discount. **Retries are billed here**, because a retried call is charged by the provider.

Under batch, `inputPrice`/`outputPrice` are the published batch rates where the provider has
them (both must exist, or batch is ignored for that slot). The extra halving applies **only to
a published cache-read price** — never to the manual-discount fallback, which is already
derived from the batch base price:

```typescript
// per slot, token-priced models
inputPrice     = useBatch ? batchInputPricePer1M  : pricePer1MInputTokens
outputPrice    = useBatch ? batchOutputPricePer1M : pricePer1MOutputTokens

cacheReadPrice = cachedInputPricePer1M !== undefined
  ? cachedInputPricePer1M * (useBatch ? 0.5 : 1)   // published rate, halved under batch
  : inputPrice * (1 - cachedTokenDiscount / 100)   // manual fallback, NOT halved again

effectiveInput = cacheReadPrice * hitRate + inputPrice * (1 - hitRate)

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
- **LocalStorage:** Scenarios saved locally, never sent to servers. Treated as untrusted on
  read — `utils/scenario.ts` shape-checks and migrates every entry, and drops what it cannot
  render. An unvalidated import used to be persisted before it crashed, so the crash came
  back on every reload until the user cleared site data. Validation checks **types, not just
  presence**: `migrateInputs` rebuilds each field from the defaults and keeps a stored value
  only when its `typeof` matches, because a present-but-mistyped field is the more dangerous
  case — `monthlyVolume: null` multiplies as 0 through all of `calculateROI` and only throws
  later, in the scenario list. `valueMethod` is checked against the enum (an unknown one falls
  through the switch and silently reports zero value), and the model slots' optional identity
  and published-rate fields are **not** inherited from the defaults, since a custom-priced
  model is defined by their absence.
- **Catalog cache:** `readStoredCatalog()` shape-checks every cached model with the same
  `isValidModel` the API path uses. Skipping that let string prices reprice onto the form and
  NaN every cost metric for the next 24 hours.
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
| `volume` | Monthly volume | Rounded **before** the positivity check, capped at 1e9; junk ignored. (Rounding after it let `0.4` through as a volume of zero, which the break-even card divided by.) |
| `model` | `modelId` (`provider-slug/model-slug`, same as hub model page URLs) | Must match the slug pattern; unknown model falls back to the preset's, with a notice |
| `batch` | Async batch processing | `1`/`true`/`0`/`false` |

Everything is optional and independently validated — a malformed value is ignored rather than failing the load. Applied at mount for preset/volume/batch; the model waits for the catalog, since the embedded snapshot only carries the top models and one picked from the hub's full catalog may not exist until the live fetch lands.

A dismissible banner confirms what carried over. (Both form sections are expanded by default, so a handed-over model is visible on arrival.)

**When adding a preset**, check `HUB_USE_CASE_TO_PRESET` in `utils/deepLink.ts` if the hub has a matching use case under a different key.

## Cost Model Entry (Layer 1 & 2)

**Billing basis** — `ModelParams.useCallPricing` / `costPerCall` are surfaced in `components/ModelPicker.tsx` (`ModelCostInputs`) as a per-token / per-call toggle, shown only on custom-priced models: the hub catalog is entirely token-priced, so a catalog model always has a $/1M rate. Switching to per-call detaches the catalog identity, because the model's $/1M, cache and batch rates no longer describe the cost. A per-call model ignores tokens, cache and batch in `calculations.ts`; retries still apply.

**Harness entry unit** — harness costs are stored per unit but entered per 1,000 by default (`harnessPer1k` in App.tsx), because vendors quote per 1,000 calls. This is a display transform only: `harnessValue()` scales for display, `updateHarness()` scales back and rounds to kill floating-point residue. A running subtotal sits under the fields, and flags when Simple mode is hiding lines that still cost money.

All seven harness fields now have a control — `networkEgressCostPerUnit` was summed in `calculations.ts` but had no UI, so presets charged it invisibly.

## Discoverability: the static methodology page

The app is a client-rendered SPA whose served HTML is an empty `<div id="root">`. Googlebot
renders JS and sees the app, but non-rendering fetchers — GPTBot, ClaudeBot, PerplexityBot,
CCBot, most social unfurlers — see only the `<noscript>` block. The one genuinely citable asset
this project owns, the 1,000-line mathematical specification, lived only on GitHub, so every
answer an AI search engine could give about this methodology cited github.com, not optimnow.io.

`public/methodology.html` fixes that: ~6,600 words of specification, zero JavaScript (the only
`<script>` is the `TechArticle` JSON-LD), on the product's own domain.

- **Generated, never hand-edited.** `scripts/build-methodology.mjs` renders METHODOLOGY.md with
  `marked` (a devDependency — it never reaches the client bundle). `prebuild` runs it, so a
  Vercel deploy always ships a page matching the markdown. `npm run check:methodology` fails if
  the committed copy is stale.
- **METHODOLOGY.md stays the single source of truth.** Edit the markdown, never the HTML.
- h2 headings get GitHub-style anchor ids and feed the in-page table of contents. Tables are
  wrapped in an `overflow-x: auto` box so the page body never scrolls sideways on mobile.
- Linked from the header `BookOpen` icon, the value summary card, `public/llms.txt`,
  `public/sitemap.xml` and the `<noscript>` block — that last one is what non-JS crawlers follow.

Static files in `public/` are served ahead of the SPA rewrite in `vercel.json`, so
`/methodology.html` resolves to the page and not to `index.html`.

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

**Test Coverage:** 121 tests across 6 files — `calculations` (38), `deepLink` (18), `format`
(11), `modelCatalog` (11), `scenario` (21) under `utils/`, plus `InputComponents` (22) under
`components/`:
- All 4 value methods
- Break-even calculations, including the methods that deliberately report none
- Sensitivity analysis
- Edge cases and error conditions
- Scenario validation and migration: rejected shapes, mistyped fields, backfilled fields,
  unrecognised value methods, recomputed results
- Clamping, blur normalization and label association in `components/InputComponents.tsx`

**Assert values, not self-consistency.** Four assertions once could not fail: one compared
`grossValuePerUnit` with `totalMonthlyValue / effectiveMonthlyVolume`, which is the same
quantity by construction (`x <= x`, passing with the clamp deleted); two asserted only `> 0`
and passed if the multiplier under test were ignored; one derived its expected ROI from the
result object using the implementation's own formula. Pin hand-computed numbers, and confirm
a new test fails against the unfixed code before trusting it.

**Two environments, one config.** `vitest.config.ts` runs everything in `node` by default and
`include`s both `utils/**/*.test.ts` and `components/**/*.test.tsx`. A component test opts into
a DOM with a `// @vitest-environment jsdom` docblock on its first line — jsdom costs real
startup time, so the pure calculation tests are deliberately left out of it. Component test
files also need `import '@testing-library/jest-dom/vitest'` for the `toBeInTheDocument` /
`toHaveValue` matchers. Use `vi.fn()`, never `jest.fn()` — there is no jest here.

**`pool: 'threads'` is deliberate.** Vitest's default `forks` pool times out spawning workers
on some Windows machines and — the dangerous part — exits 0 having run nothing, so a red suite
looks green. `passWithNoTests: false` is the second half of that guard.

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

**Caching:** `vercel.json` sets `max-age=31536000, immutable` on `/assets/(.*)`, whose
filenames Vite content-hashes, and a one-day `stale-while-revalidate` on `/images/(.*)`, whose
filenames are **not** hashed — `immutable` would be wrong there. `index.html` deliberately
keeps Vercel's revalidating default — it is the file that must never be stale, since it points
at the hashed bundles. `/favicon.ico` redirects to the real icon; without it the request fell
through the SPA rewrite and every crawler got `index.html` back as 200 text/html.

**Canonical host:** `vercel.json` `308`s `ai-roi-calculator.vercel.app` to
`airoicalculator.optimnow.io`. The `has: host` condition matches that exact hostname, so
preview deployments on `ai-roi-calculator-<hash>.vercel.app` are untouched.

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

**Current state (August 2026, v0.6.0).** Live model prices from OptimToken with automatic
repricing, per-token and per-call billing, published cache-read and batch rates, deep links
from the hub, per-1,000 harness entry, 121 tests, WCAG 2.1 AA.

**Known gap, needs a design asset rather than code:** `og:image` points at `Logo.png`, a
1323x270 banner where a `summary_large_image` card wants 1200x630, so every social share crops
it. The same missing asset set (PNG icons at 16/32/180/192/512) is what keeps the PWA in
`manifest.webmanifest` from being installable. Both are marked with TODOs in `index.html`.

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
- Chartreuse (#ACE849) fills primary actions; never use it as text or as a lone focus ring
- **Tailwind v4:** the `bg-opacity-*` / `text-opacity-*` / `border-opacity-*` utilities no
  longer exist. Use the `/N` modifier (`bg-black/50`). The old ones compile to nothing, so the
  surfaces render at full strength and the mistake is invisible in a diff.

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
npm run typecheck              # tsc --noEmit under strict

# Model prices
npm run refresh:models         # Regenerate the embedded price snapshot

# Methodology page
npm run build:methodology      # Regenerate public/methodology.html from METHODOLOGY.md
npm run check:methodology      # Fail if the committed page is stale

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
- **SEO.md:** Discoverability decisions and the standing list of known gaps
- **CONTRIBUTING.md:** Contribution guide (French)
- **DEPLOYMENT.md:** Vercel deployment guide
- **HelpGuide.tsx:** In-app user guide

### External Resources
- **React Docs:** https://react.dev/
- **TypeScript Docs:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Recharts:** https://recharts.org/en-US/api
- **Vite:** https://vitejs.dev/guide/

### Project Links
- **Live Demo:** https://airoicalculator.optimnow.io (https://ai-roi-calculator.vercel.app is the Vercel default, kept working)
- **Developer:** OptimNow (https://www.optimnow.io)
- **Repository:** GitHub (see package.json for URL)

---

## Final Notes for AI Assistants

### Context Window Management
This is a large codebase (App.tsx alone is ~1,520 lines). When working on specific features:
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
