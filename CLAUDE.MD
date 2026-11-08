# CLAUDE.MD - AI Assistant Project Guide

**Last Updated:** August 19, 2026
**Project:** AI ROI Calculator
**Version:** 0.6.0
**Live Demo:** https://airoicalculator.optimnow.io (custom domain) / https://ai-roi-calculator.vercel.app (Vercel default)

---

## Commits and pull requests

Do not add `Co-Authored-By`, `Claude-Session` or "Generated with Claude Code" lines to commit messages or pull request descriptions.

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

   **The job opens a pull request and merges it; it does not push to main.** It used to, and that broke silently the day the ruleset on main started requiring a pull request (19 Aug 2026): every subsequent run did all the work and died at the push with `GH013 - Changes must be made through a pull request`, leaving the snapshot frozen at its 17 Aug values for a week. Two things made it hard to notice, and both are worth remembering. A scheduled run that fails sends no mail anyone reads, so the only signal was the red mark on a page nobody opens. And `ai-roi-calculator-mcp`'s weekly `sync-engine` kept reporting success throughout, because a frozen engine is an engine with nothing to sync: **green there means "unchanged", not "current"**, so it can never be the thing that tells you this job has stopped.

When adding a preset, use `presetModel('Provider', 'Model Name', inTokens, outTokens)` so it inherits a real identity and published cache/batch rates.

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
# main is protected by a ruleset: every change arrives as a pull request.
# A direct `git push origin main` is rejected with GH013, whoever you are.
git status                     # Check status
git checkout -b my-change      # Branch first
git add .                      # Stage all changes
git commit -m "message"        # Commit with message
git push -u origin my-change   # Push the branch
gh pr create                   # Open the pull request

# Vercel (via GitHub)
# Production deploys from main, so a merged pull request is what ships.
```

## Where the rest lives

`docs/DESIGN.md` holds the other sections of this file, moved verbatim on 2026-11-08. It is not
loaded automatically: read the section your task touches. A reference to "CLAUDE.md, <section>"
means that section in `docs/DESIGN.md`.

Sections in `docs/DESIGN.md`:

- Architecture Overview
- Project Structure
- Key Files to Understand
- Development Workflow
- Common Tasks for AI Assistants
- Critical Calculation Formulas
- Deep Links from the OptimToken
- Cost Model Entry (Layer 1 & 2)
- Discoverability: the static methodology page
- Analytics & Event Tracking
- Testing Philosophy
- Deployment
- Sister projects
- Roadmap Context
- Known Limitations
- Troubleshooting Guide
- Code Style Guidelines
- Getting Help
- Final Notes for AI Assistants

## Maintaining this file

Keep this file under 200 lines. It holds what an agent needs in every session. A new decision, its reasoning or its history goes into the matching section of `docs/DESIGN.md`, or a new section listed above. Add a rule here only if an agent would break something without it.

