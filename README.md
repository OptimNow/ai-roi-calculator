# AI ROI Calculator

> Built by [OptimNow](https://optimnow.io). Work out whether an AI project pays for itself,
> with live model prices, the operational costs everyone forgets, and arithmetic you can
> audit line by line.

[![Live app](https://img.shields.io/badge/live-airoicalculator.optimnow.io-ACE849?labelColor=2C2C2C)](https://airoicalculator.optimnow.io)
[![Prices](https://img.shields.io/badge/prices-OptimToken-7C3AED)](https://optimtoken.optimnow.io)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-73%20passing-brightgreen)](#testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](./LICENSE)

**[Open the calculator](https://airoicalculator.optimnow.io)** · [Methodology](METHODOLOGY.md)

---

## Overview

Most AI business cases are built on two numbers: a token price copied off a pricing page,
and a saving someone estimated in a meeting. Both are usually wrong, and neither survives
contact with a CFO.

Token prices move, and the published rate is rarely what you pay once prompt caching and
batch processing enter the picture. The model itself is often the smaller half of the bill:
orchestration, retrieval, monitoring and guardrails run on every request and rarely appear
in the estimate at all. On the value side, "productivity gains" is not a number a finance
team can put in a plan.

This calculator uses a 3-layer framework that matches how production AI systems are billed,
and shows its working at every step.

### The three layers

**Layer 1, infrastructure.** Model inference, priced from the live
[OptimToken](https://optimtoken.optimnow.io) catalog: input and output rates plus the
provider's published prompt-cache read and batch prices. Supports multi-model routing, flat
per-request contracts, and retries (a retried call is charged again, so it belongs here).

**Layer 2, harness.** Orchestration, retrieval and vector search, tool APIs, logging,
guardrails, egress and storage. Entered per 1,000 calls, which is how vendors quote them.

**Layer 3, business value.** 4 archetypes: cost displacement, revenue uplift, retention
uplift and premium monetization. Each carries a realization rate, because a technically
successful output does not automatically become money.

### What you get out

ROI, net monthly benefit, payback, unit cost and break-even volume, plus a cumulative-profit
curve, a tornado chart ranking which assumption moves ROI most, and unlimited saved scenarios
for side-by-side comparison. Every formula is documented in [METHODOLOGY.md](METHODOLOGY.md),
so stakeholders can check the arithmetic instead of trusting it.

---

## Model prices stay current

Prices come from the [OptimToken](https://optimtoken.optimnow.io) catalog, which tracks
250+ models and refreshes daily. Pick a model from the dropdown and its rates fill in,
including the cache and batch prices its provider publishes.

The catalog resolves in order: a browser cache under 24h old, then the live API, then a stale
cache, then a snapshot embedded in the app. The interface states which layer answered and the
date the prices were published, so a figure never appears without its provenance.

Models are repriced automatically whenever the catalog resolves. Two exceptions are
deliberate: a model you priced by hand keeps your negotiated rate, and a scenario loaded from
storage keeps the prices it recorded, because it is the record of a decision made on a date.

Arriving from the hub with `?useCase=&volume=&model=&batch=` preloads the scenario, so a
comparison there continues here without retyping.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build to dist/
npm run preview    # serve the production build
npm test           # 73 tests
```

Requires Node.js 20+. No API keys, no backend, no account.

To refresh the embedded price snapshot used as the offline fallback:

```bash
npm run refresh:models
```

A weekly GitHub Action runs the same script. It refuses to write a snapshot that drops a
model any preset depends on, since that would break the app at import time.

---

## Using it

1. **Load a preset.** 11 scenarios covering support deflection, knowledge Q&A, meeting and
   call summaries, marketing content, coding, invoice processing, agent workflows,
   e-commerce recommendations, retention and premium features. Each is bound to a real model
   with token counts matching the pricing hub's profiles.

2. **Define value and scope.** Use case, unit, monthly volume, then a value archetype and its
   drivers, then a realization rate. An equation preview shows how the three rates combine.

3. **Set the cost model.** Pick a model or enter custom pricing, set token counts, add the
   harness costs. Advanced mode adds multi-model routing, cache hit rate, retry rate and ops
   overhead.

4. **Read the results.** Two accounts are in play, and they answer different questions.
   Break-even volume asks *how many* units a month cover your costs. Payback asks *how long*
   until the setup is repaid. The in-app help works both through with a worked example.

5. **Stress-test it.** Sensitivity sliders move volume, realization, cost and value without
   touching your inputs. The tornado chart ranks what matters.

---

## Project structure

```text
ai-roi-calculator/
├─ App.tsx                       # state, layout, results panel
├─ types.ts                      # UseCaseInputs, ModelParams, Scenario
├─ constants.ts                  # 11 presets, bound to catalog models
├─ components/
│  ├─ Charts.tsx                 # ROI curve, cost/value, breakdown, tornado
│  ├─ ModelPicker.tsx            # catalog dropdown + billing basis + cost fields
│  ├─ InputComponents.tsx        # money, number, percent, section header
│  ├─ HelpGuide.tsx              # in-app guide
│  ├─ ScenarioManager.tsx        # save, load, export, import
│  ├─ ScenarioComparison.tsx     # side-by-side comparison
│  └─ ErrorBoundary.tsx
├─ utils/
│  ├─ calculations.ts            # the engine: all cost, value and ROI formulas
│  ├─ modelCatalog.ts            # live prices, cache, snapshot, repricing
│  ├─ deepLink.ts                # scenario handover from the pricing hub
│  └─ format.ts                  # shared display rules
├─ scripts/refresh-model-snapshot.mjs
├─ METHODOLOGY.md                # full mathematical specification
├─ UAT_SCENARIOS.md              # 11 acceptance scenarios
└─ DEPLOYMENT.md
```

Tests sit beside the code they cover, as `*.test.ts`.

---

## Testing

73 tests run under Vitest, covering the calculation engine and the modules around it:

```bash
npm test
```

They cover all 4 value methods, cache-read and batch pricing, per-call billing, routing
blends, retry attribution, break-even and payback, deep-link parsing and validation, catalog
repricing, and display formatting. Edge cases include zero volume, 0% and 100% realization,
negative margins and models that have left the catalog.

[UAT_SCENARIOS.md](UAT_SCENARIOS.md) holds 11 manual acceptance scenarios for interface work.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 with TypeScript in strict mode |
| Build | Vite |
| Styling | Tailwind CSS v4 via PostCSS |
| Charts | Recharts |
| Icons | Lucide React |
| Tests | Vitest |
| Hosting | Vercel |

All calculation runs in the browser. Scenarios are saved to `localStorage` and never leave
your machine. The only network call fetches the public price catalog, which sends no data
about your scenario.

Analytics (GA4 and Vercel Analytics) record anonymous usage events: page views, preset loads,
exports, model selections. No input values, no scenario data, no personal information.

---

## Deployment

Push to `main` and Vercel deploys. [DEPLOYMENT.md](DEPLOYMENT.md) covers configuration, static
asset troubleshooting and cache clearing.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OptimNow/ai-roi-calculator)

---

## The rest of the family

| | |
|---|---|
| [**OptimToken**](https://optimtoken.optimnow.io) | Compare what 250+ models cost per request, with caching and batch factored in. Source of this calculator's prices. |
| **MCP server** | The same engine as an MCP tool, so an assistant can size a business case in conversation. Repository opening shortly. |
| [**cloud-finops-skills**](https://github.com/OptimNow/cloud-finops-skills) | FinOps knowledge for AI agents: AWS, Azure, GCP, AI inference, SaaS. |

The MCP server consumes this repository's engine verbatim through a sync script, so both
answer the same question with the same number.

---

## Contributing

Issues and pull requests are welcome. Changes to `utils/calculations.ts` need a matching test
and a METHODOLOGY update, and they ripple into the MCP server through its engine sync.

## License

MIT. See [LICENSE](./LICENSE).

---

Questions about your own AI cost estimate? [Talk to OptimNow](https://www.optimnow.io/contact).
