# AI ROI Calculator - Methodology & Mathematical Specification

**Version:** 1.5
**Last Updated:** August 17, 2026
**Authors:** OptimNow Team
**Purpose:** Comprehensive documentation of the ROI calculation methodology for transparency, auditability, and academic rigor.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Framework Overview](#framework-overview)
3. [Mathematical Foundations](#mathematical-foundations)
4. [Layer 1: Infrastructure Costs](#layer-1-infrastructure-costs)
5. [Layer 2: Harness & Operational Costs](#layer-2-harness--operational-costs)
6. [Layer 3: Business Value Methods](#layer-3-business-value-methods)
7. [ROI Metrics Calculation](#roi-metrics-calculation)
8. [Break-even Analysis](#break-even-analysis)
9. [Sensitivity Analysis](#sensitivity-analysis)
10. [Assumptions & Limitations](#assumptions--limitations)
11. [References & Citations](#references--citations)

---

## Executive Summary

The AI ROI Calculator uses a **3-layer framework** to comprehensively model the total cost of ownership (TCO) and business value of AI/LLM implementations. This methodology separates concerns into:

1. **Infrastructure Layer**: Direct model inference costs
2. **Harness Layer**: Operational overhead and auxiliary systems
3. **Business Value Layer**: Quantified economic benefits via four distinct methods

The calculator produces rigorous ROI metrics including percentage return, payback period, break-even analysis, and cumulative profit projections. All calculations are transparent, auditable, and based on industry-standard financial formulas.

---

## Framework Overview

### Design Philosophy

The 3-layer architecture prevents common pitfalls in AI cost estimation:

- **Underestimation**: Many organizations only account for API costs, ignoring orchestration, monitoring, and integration overhead
- **Oversimplification**: Single-value methods fail to capture diverse use cases (cost savings vs. revenue generation)
- **Opacity**: Black-box calculators erode trust; our methodology is fully documented

### Layer Definitions

| Layer | Component | What It Captures | Industry Analog |
|-------|-----------|------------------|-----------------|
| **L1** | Infrastructure | Model inference, tokens, API calls | AWS EC2/Lambda costs |
| **L2** | Harness | Orchestration, retrieval, monitoring, DevOps | AWS CloudWatch, VPC, ECS overhead |
| **L3** | Business Value | Revenue, cost savings, retention, subscriptions | Revenue/EBITDA impact |

---

## Mathematical Foundations

### Notation & Conventions

| Symbol | Description | Units |
|--------|-------------|-------|
| `V` | Monthly volume (units processed) | units/month |
| `S` | Realization rate | % (0-100) |
| `C₁` | Layer 1 cost per unit | $/unit |
| `C₂` | Layer 2 cost per unit | $/unit |
| `Cf` | Fixed costs (one-time) | $ |
| `A` | Amortization period (spreads fixed costs into monthly cost) | months |
| `N` | Analysis horizon (length of the ROI curve chart only) | months |
| `GV` | Gross value per unit | $/unit |
| `NV` | Net value per unit (after realization rate) | $/unit |
| `ROI` | Return on Investment | % |
| `M` | Sensitivity multiplier | scalar (1.0 = baseline) |

### Key Principles

1. **Additive Costs**: All cost components sum linearly
2. **Multiplicative Success**: Value scales by realization rate (`S/100`)
3. **Amortization**: Fixed costs are spread over the amortization period `A`, which is a separate input from the analysis horizon `N`
4. **Monthly Frame**: Every headline metric except payback is a monthly figure; `N` never enters `calculateROI()`, it only sets how far the ROI curve chart runs
5. **Conservative Estimation**: When uncertain, favor higher costs / lower value

---

## Layer 1: Infrastructure Costs

### Where the Prices Come From

Model prices are not typed in by default: they are selected from the
[OptimToken](https://optimtoken.optimnow.io) catalog through the model picker, which
resolves in this order and never fails — fresh browser cache (< 24h) → live hub API →
stale cache → the catalog snapshot embedded in the app. The UI states which layer answered
and the date the prices were published.

A selected model carries an **identity** alongside its prices (`modelId`, `modelName`,
`provider`, `pricedAt`) plus the provider's published **cache-read** and **batch** rates,
which is what makes the optimizations below computable rather than guessed.

**Auto-repricing.** Whenever the catalog resolves — on load, on a manual refresh, on preset
load and on reset — every model carrying a `modelId` is repriced to the current rates
(input, output, cache-read, batch, and `pricedAt`). Two deliberate exceptions:

- **Custom-priced models** (no `modelId`) are never touched. Editing any price field, or
  switching the billing basis to per call, drops the identity — that is how a negotiated
  rate survives a refresh, and it stops a scenario from claiming a model's name with prices
  it no longer uses.
- **Scenarios loaded from storage** keep their recorded prices, because loading one does not
  change the catalog. A scenario is the record of a decision at a point in time. An explicit
  refresh afterwards will reprice it.

**Presets.** The 11 example profiles are each bound to a real catalog model, with token
profiles aligned to the hub's business use-case profiles, so a preset and the hub agree on
the cost basis before any of your own numbers are entered.

**Deep links.** The hub can hand a scenario over via
`?useCase=&volume=&model=&batch=`; each parameter is validated independently and ignored if
unknown. The model is applied once the catalog has loaded, since the embedded snapshot only
carries the top models.

---

### Token-Based Pricing

**Formula:**
```
C₁_base = [(Ti / 1,000,000) × Pi] + [(To / 1,000,000) × Po]
```

**Where:**
- `Ti` = Average input tokens per unit
- `To` = Average output tokens per unit
- `Pi` = Price per 1M input tokens ($)
- `Po` = Price per 1M output tokens ($)

**Rationale:** Industry-standard API pricing (OpenAI, Anthropic, Google) charges per million tokens.

---

### Call-Based Pricing (Alternative)

**Formula:**
```
C₁_base = Pc
```

**Where:**
- `Pc` = Price per API call ($)

**How to select it:** in the Infrastructure (Layer 1) section, choose "Custom pricing" for the model, then switch the billing basis to **per call**. It is offered only on custom-priced models because the OptimToken catalog is entirely token-priced.

**Use Case:** services billed per request rather than per token, in three families:

1. **Non-text modalities**, where a token has no meaning — OCR and document extraction billed per page (AWS Textract, Google Document AI, Azure Document Intelligence), image generation billed per image, transcription billed per minute of audio.
2. **Tooling around the model** — web search APIs (per query), rerankers (per search), moderation endpoints (per transaction). These usually belong in Layer 2 rather than Layer 1.
3. **Negotiated contracts** — a committed rate such as "$0.12 per document processed", where modelling the contract as signed is more honest than reverse-engineering a token count.

**Interactions:** a per-call model ignores token counts, prompt-cache discounts and batch rates entirely — there is no token quantity for them to act on. Retries still apply, since a retried call is billed again.

---

### Model Routing Strategy

Blends primary (cheaper, simpler) and secondary (expensive, complex) models.

**Formula:**
```
C₁_blended = (C₁_primary × Rp) + (C₁_secondary × Rs)
```

**Where:**
- `Rp` = Routing percentage to primary model (e.g., 70%)
- `Rs` = 1 - Rp (routing to secondary model)

**Example:**
- Primary: Claude Haiku 4.5 @ $1.00/1M input tokens → 70% traffic
- Secondary: Claude Sonnet 5 @ $2.00/1M input tokens → 30% traffic
- Blended cost reduces overall spend while maintaining quality for complex queries

---

### Batch Processing (Async Workloads)

When the workload tolerates delayed responses (document processing, summaries, scoring),
most providers offer a batch API at roughly -50%. When batch processing is enabled and the
selected model has published batch rates (sourced from the OptimToken), those rates
replace the list prices:

```
Pi_base = Pi_batch  (if batch enabled and published, else Pi)
Po_base = Po_batch  (if batch enabled and published, else Po)
```

Models without published batch rates keep list prices even when batch is enabled.

---

### Cache Optimization

**Formula (aligned with the OptimToken's optimized cost):**
```
P_cache_read = published cache-read price     (halved again under batch)
             | Pi_base × (1 - Dr)             (manual fallback when no published rate)

Pi_effective = P_cache_read × Hr + Pi_base × (1 - Hr)
C₁_cached    = (Ti / 1M) × Pi_effective + (To / 1M) × Po_base
```

**Where:**
- `Hr` = Cache hit rate (share of input tokens served from the prompt cache, 0-100%)
- `Dr` = Manual cached-token discount (%, 0-100) — used **only** when the model carries no published cache-read price
- Example: Claude Haiku 4.5 lists input at $1.00/1M and cache reads at $0.10/1M (90% off); with a 50% hit rate the effective input price is $0.55/1M

**Rationale:**
- **Input tokens** can be cached (prompt templates, system instructions)
- **Output tokens** cannot be cached (unique responses)
- When a model is picked from the OptimToken catalog, its published cache-read price is used; providers apply the batch discount to cache reads too, hence the halving under batch

---

### Retry Logic

**Formula:**
```
C₁_with_retries = C₁_cached × (1 + Rr)
```

**Where:**
- `Rr` = Retry rate (0.1 = 10% of calls retry once). Entered as a percentage in the UI ("Retry Rate", Advanced mode) and stored as a 0-1 fraction.

**Rationale:** API failures, timeouts, and rate limits necessitate retries. Conservative estimate assumes full model cost for retries (no caching benefit on retry).

**Layer placement:** the retry multiplier belongs to **Layer 1**, not Layer 2 — a retry re-runs
the model, while harness components (storage, logging, egress) are not re-incurred. The UI
puts the control under the harness block for convenience, but the cost lands in Layer 1 and
is visible there in the Unit Economics table. Per-call models are multiplied the same way: a
retried call is billed again.

---

### Layer 1 Final Cost

**Per Unit:**
```
C₁ = C₁_with_retries × M_cost
```

**Monthly:**
```
C₁_monthly = C₁ × V × M_volume
```

**Where:**
- `M_cost` = Cost sensitivity multiplier (default 1.0)
- `M_volume` = Volume sensitivity multiplier (default 1.0)

---

## Layer 2: Harness & Operational Costs

### Component Breakdown

| Component | Symbol | Description | Typical Range |
|-----------|--------|-------------|---------------|
| Orchestration | `Co` | LangChain, agent frameworks, workflow logic | $0.001 - $0.01/unit |
| Retrieval | `Cr` | Vector DB queries (Pinecone, Weaviate), embeddings | $0.001 - $0.05/unit |
| Tool APIs | `Ct` | External API calls (web search, calculators, databases) | $0.00 - $0.10/unit |
| Logging/Monitoring | `Cl` | CloudWatch, DataDog, LangSmith traces | $0.0001 - $0.001/unit |
| Safety Guardrails | `Cg` | Content moderation, PII detection APIs | $0.0001 - $0.005/unit |
| Network Egress | `Cn` | Data transfer out of cloud provider | $0.00001 - $0.0005/unit |
| Storage | `Cs` | S3, RDS for conversation history | $0.00001 - $0.0005/unit |

All seven have an input control. Simple mode shows Orchestration and Retrieval only; the
other five keep their preset values and are still charged (the running subtotal under the
fields states this).

**Entry unit:** these services are almost always quoted per 1,000 calls, so the block
defaults to a **per 1,000** entry mode. This is a display transform only — values are stored
per unit — and a toggle switches back to per-unit entry.

---

### Harness Sum

**Formula:**
```
H_sum = Co + Cr + Ct + Cl + Cg + Cn + Cs
```

---

### Combined Layer 1 + Layer 2 Cost Per Unit

**Formula:**
```
C₂ = (C₁_with_retries + H_sum) × Oh × M_cost
```

**Important Note:** Despite the notation `C₂`, this represents the **total variable cost per unit** combining:
- Layer 1 (infrastructure/model inference with retries)
- Layer 2 (harness components)
- Overhead multiplier applied to the sum

**Where:**
- `Oh` = Overhead multiplier (1.0 - 1.5). Entered in the UI as **Ops Overhead**, a percentage
  (Advanced mode): 10% means `Oh = 1.1`.
  - 1.0 = Perfectly optimized system (0%)
  - 1.1 = 10% DevOps/maintenance overhead
  - 1.2-1.5 = Early-stage systems with inefficiencies (20-50%)

**Rationale:** Overhead captures:
- Failed requests consuming resources but not generating value
- Development/testing traffic
- Idle infrastructure costs
- Monitoring/alerting overhead

---

### Total Monthly Operating Cost

**Formula:**
```
C_monthly_var = C₂ × V × M_volume
```

**Note:** `C₂` already includes both Layer 1 and Layer 2 costs, so this gives total monthly variable operating costs.

---

## Layer 3: Business Value Methods

The calculator supports **four distinct value quantification methods**, selected based on the use case's economic impact mechanism.

---

### Method 1: Cost Displacement

**Use Cases:** Customer support automation, document processing, data entry

**Formula:**
```
GV = [(Bh × min(Dr × M_value, 100)) - (Rrc × Rr)] × (S / 100)
```

**Where:**
- `Bh` = Baseline human cost per unit ($)
- `Dr` = Deflection rate (% of work AI handles without escalation)
- `Rrc` = Residual review cost per unit ($)
- `Rr` = Residual review rate (% of AI outputs requiring human review)
- `M_value` = Value sensitivity multiplier (1.0 at baseline)

> `M_value` scales the deflection rate, capped at 100%, and **not** the residual review
> term — see [Sensitivity Analysis](#sensitivity-analysis). Writing it against the whole
> bracket instead, as this formula previously did, overstates the residual cost by the
> same factor and diverges from the engine whenever `Rrc × Rr > 0`.

**Example Calculation:**

**Inputs** (the Customer Support Bot preset):
- Baseline human cost: $0.50/ticket
- Deflection rate: 35% (AI resolves without human)
- Residual review rate: 5% (AI draft requires human review)
- Residual review cost: $0.10/ticket
- Realization rate: 90%

**Math:**
```
GV = [(0.50 × 0.35) - (0.10 × 0.05)] × 0.90
   = [0.175 - 0.005] × 0.90
   = 0.170 × 0.90
   = $0.153 per ticket
```

**Interpretation:** Each ticket saves $0.153 compared to pure human handling.

**Realization Rate Explanation (90%):**
- **What it means:** Technical realization rate - 90% of AI attempts produce usable output, 10% fail completely (timeouts, errors, no response)
- **Why 90% for this scenario:** Customer support systems face real-world variability (unclear questions, edge cases, system integrations). 90% is realistic for production chatbots.
- **Independence from deflection/review rates:** Realization rate is orthogonal to quality metrics. An AI can successfully generate output (counted in the 90%) that still requires human review (the 5% residual review rate). These are separate dimensions:
  - **Realization rate:** Did the AI produce output at all?
  - **Deflection rate:** Of successful outputs, how many fully resolve the issue?
  - **Review rate:** Of successful outputs, how many need human editing before use?

---

### Method 2: Revenue Uplift

**Use Cases:** E-commerce recommendations, personalized marketing, dynamic pricing

**Formula:**
```
GV = AOV × ΔConv × Gm × (S / 100) × M_value
```

**Where:**
- `AOV` = Average order value ($)
- `ΔConv` = Absolute conversion uplift (percentage points, e.g., 0.5 for 2.0% → 2.5%)
- `Gm` = Gross margin (% as decimal, e.g., 0.45 for 45%)

**Example Calculation:**

**Inputs:**
- Average order value: $85
- Baseline conversion: 3.0%
- Absolute uplift: +0.2 percentage points (3.0% → 3.2%)
- Gross margin: 45%
- Realization rate: 100% (all users see recommendations)

**Math:**
```
ΔConv = 0.002 (0.2 percentage points as decimal)
GV = 85 × 0.002 × 0.45 × 1.00
   = 0.17 × 0.45 × 1.00
   = $0.0765 per order
```

**At 100,000 orders/month (default recommendation preset):**
```
Total Value = 0.0765 × 100,000 = $7,650/month
```

**Note:** Absolute uplift ≠ relative uplift. 3% → 3.2% is:
- **Absolute:** +0.2 percentage points ✓ (enter this)
- **Relative:** +6.67% ✗ (do NOT enter this)

**Realization Rate Explanation (100%):**
- **What it means:** 100% of orders receive AI-generated recommendations without technical failures
- **Why 100% for this scenario:** E-commerce recommendation engines are typically stateless, pre-computed systems with high reliability. Unlike interactive chatbots, they serve cached/pre-generated recommendations, so technical failure rates approach zero in production.
- **No quality dependency:** Realization rate measures technical delivery, not recommendation quality. A poorly-targeted recommendation still counts as "successful" if delivered. The conversion uplift metric captures quality - if recommendations are bad, uplift will be low/zero.

---

### Method 3: Retention Uplift

**Use Cases:** Churn prevention, loyalty programs, proactive customer success

**Formula:**
```
Cra_effective = min(Cra × M_value, Cb)
Total_Value = (Ci × Cra_effective × (S / 100)) × (Av / 12)
```

**Where:**
- `Ci` = Customers impacted per month
- `Cb` = Baseline churn rate (percentage points)
- `Cra` = Churn reduction absolute (percentage points, e.g., 0.5 for 2.5% → 2.0%)
- `Cra_effective` = Churn reduction after the baseline cap
- `Av` = Annual value per customer ($)

**Why the cap:** the reduction cannot exceed the churn that was there to remove — retaining
more customers than were leaving is not an improvement, it is a negative churn rate. Uncapped,
a 5-point reduction entered against a 0.5% baseline "saved" 425 customers out of the 50 that
churn, and returned roughly 1,300% ROI from arithmetic alone. The cap is applied after the
sensitivity multiplier, so a Value slider above 1× cannot push past the baseline either.

**Example Calculation:**

**Inputs:**
- Customers impacted: 10,000/month
- Baseline churn: 2.5%/month
- Churn reduction: 0.5 percentage points absolute
- Annual customer value: $1,200
- Realization rate: 85%

**Math:**
```
Saved customers = 10,000 × 0.005 × 0.85 = 42.5 customers/month
Monthly value per saved customer = 1,200 / 12 = $100
Total Value = 42.5 × 100 = $4,250/month
```

**Interpretation:** Preventing 42.5 customers from churning each month generates $4,250 in retained revenue.

**Realization Rate Explanation (85%):**
- **What it means:** 85% of AI retention interventions execute successfully (personalized emails sent, proactive support tickets created, loyalty rewards delivered)
- **Why 85% for this scenario:** Retention systems integrate with multiple services (email platforms, CRM, support ticketing, payment systems). Integration complexity and external dependencies reduce reliability compared to standalone systems. 85% accounts for:
  - Email delivery failures
  - API timeouts with external services
  - Data availability issues (incomplete customer profiles)
  - Rate limiting on third-party platforms
- **Impact on value:** Only successful interventions contribute to churn reduction. If AI fails to reach a customer, no retention impact occurs for that customer.

---

### Method 4: Premium Monetization

**Use Cases:** AI-powered subscription tiers, freemium upgrades, add-on features

**Formula:**
```
Total_Value = (Ps - Cn) × Ns × (S / 100) × M_value
```

**Where:**
- `Ps` = Price per subscriber per month ($)
- `Cn` = Non-AI COGS per subscriber ($)
- `Ns` = Number of subscribers
- **UI behavior:** In Premium Monetization mode, the calculator keeps Monthly Volume and Total Subscribers synchronized so value and cost drivers stay consistent.

**Example Calculation:**

**Inputs** (the AI Premium Features preset):
- Subscription price: $15/month
- Non-AI COGS (hosting, support): $3/month
- Subscribers: 1,000
- Realization rate: 100%

**Math:**
```
Margin per subscriber = 15 - 3 = $12
Total Value = 12 × 1,000 × 1.00 = $12,000/month
```

**Realization Rate Explanation (100%):**
- **What it means:** 100% of premium AI features are available and functional for paying subscribers
- **Why 100% for this scenario:** Premium features have high uptime requirements. Subscribers paying specifically for AI capabilities expect near-perfect availability. Production systems typically achieve 99.9%+ uptime, modeled as 100% for monthly calculations.
- **Revenue model - Marginal vs Total:**
  - **Subscription price ($15/month):** This is the **marginal revenue** directly attributed to the AI premium feature, NOT the total subscription price
  - **Example:** If your base plan is $50/month and AI Premium tier is $65/month, enter $15 (the incremental revenue from AI)
  - **Rationale:** We only calculate ROI on the AI-specific revenue. If users would pay $50 regardless, that's not AI-attributable value
- **Non-AI COGS ($3/month):** Incremental costs to serve premium subscribers, EXCLUDING AI costs (which are in Layers 1 & 2):
  - **Hosting/infrastructure:** Additional database storage, CDN bandwidth, server capacity for premium users
  - **Customer support:** Premium support tiers, priority handling
  - **Payment processing:** Credit card fees on the premium increment
  - **Compliance/security:** Enhanced data protection for premium features
  - **Do NOT include:** AI model costs (already in Layer 1), orchestration (Layer 2), or fixed costs (amortized separately)

---

## ROI Metrics Calculation

### Net Monthly Benefit

**Formula:**
```
NMB = Total_Value - C_monthly_total
```

**Where:**
```
C_monthly_total = C_monthly_var + Cf_amortized
Cf_amortized = (Ci + Ct + Cm) / A
```

**Components:**
- `Ci` = Integration & development cost ($)
- `Ct` = Training & tuning cost ($)
- `Cm` = Change management cost ($)
- `A` = Amortization period (months, typically 12-36)

---

### ROI Percentage

**Formula:**
```
ROI% = (NMB / C_monthly_total) × 100
```

**Interpretation:**
- **ROI > 0%:** Project is profitable
- **ROI = 100%:** Returns double the investment each month
- **ROI < 0%:** Monthly losses

**This is a monthly ratio.** Both sides of the fraction are monthly figures: monthly value
against monthly cost (variable + amortized fixed). It is not annualized and not cumulative,
and the analysis horizon `N` plays no part in it — only the amortization period `A`, through
`Cf_amortized`. Lengthening `A` lowers monthly cost and therefore raises ROI; lengthening `N`
only stretches the ROI curve chart.

**Example:**
```
Monthly Value = $50,000
Monthly Cost = $12,000
NMB = 50,000 - 12,000 = $38,000
ROI% = (38,000 / 12,000) × 100 = 316.7%
```

---

### Payback Period

**Formula:**
```
NCB = V_total_monthly - C₂_monthly          (monthly cash net benefit, before amortization)
Payback_months = Cf_total / NCB  (if NCB > 0)
```

**Why NCB and not NMB:** `NMB` already subtracts the amortized fixed costs. Dividing
`Cf_total` by `NMB` would count the fixed costs twice (once in the numerator, once inside
the denominator). Payback is a cash metric: one-time investment divided by the monthly
cash the project generates before amortization.

**Special Cases:**
- `NCB ≤ 0`: "No Payback" (project never recoups fixed costs)
- `Cf_total = 0`: "Immediate" (no upfront investment)

**Example:**
```
Fixed costs = $25,000
Monthly cash net benefit = $8,000
Payback = 25,000 / 8,000 = 3.1 months
```

---

### Cumulative Profit Over Time

**Formula:**
```
CP(t) = -Cf_total + (NCB × t)
```

**Where:**
- `t` = Number of months elapsed
- `CP(0) = -Cf_total` (initial investment)
- Break-even occurs when `CP(t) = 0`

**Example Trajectory:**

| Month | Cumulative Profit |
|-------|-------------------|
| 0 | -$25,000 |
| 1 | -$17,000 |
| 2 | -$9,000 |
| 3 | -$1,000 |
| 4 | +$7,000 ← Break-even month 3.1 |
| 12 | +$71,000 |

---

## Break-even Analysis

### Break-even Volume

**Definition:** The monthly volume at which `Total Value = Total Cost` (net benefit = $0)

**Formula:**
```
V_breakeven = Cf_amortized / (GV - C₂)
```

**Where:**
- `GV - C₂` = Unit margin (value minus variable cost per unit)

**Derivation:**
```
At break-even: Total_Value = Total_Cost
GV × V_breakeven = (C₂ × V_breakeven) + Cf_amortized
GV × V_breakeven - C₂ × V_breakeven = Cf_amortized
V_breakeven × (GV - C₂) = Cf_amortized
V_breakeven = Cf_amortized / (GV - C₂)
```

**Example:**
```
Gross value per unit = $2.50
Variable cost per unit = $0.30
Amortized fixed cost = $2,000/month

Unit margin = 2.50 - 0.30 = $2.20
V_breakeven = 2,000 / 2.20 = 909 units/month
```

**Interpretation:** Need 909 units/month to cover all costs. Below this, project loses money.

**Special cases:**
- Unit margin ≤ 0: no break-even volume exists (the card shows "N/A")
- `Cf_amortized = 0` with a positive unit margin: break-even volume is 0 — every unit is profitable
- The result is rounded up to a whole unit
- **Retention Uplift: not reported.** See below.

**Scope: only value methods whose total value scales with volume.**

The derivation cancels `V_breakeven` out of both sides, which is only legitimate while `GV`
is itself independent of volume. Under Cost Displacement and Revenue Uplift it is: value is
defined per unit, and total value really is `GV × V`.

Under **Retention Uplift** it is not. Total value is driven by `Ci`, customers impacted per
month, which is a separate input from `V`; `GV` is then back-derived as `Total_Value / V`.
So `GV × V` is a constant, the two sides of the equation no longer both depend on volume,
and the formula returns a number with no meaning. On the shipped `retention` preset it
returned 7,051 units/month at a volume already earning +$1,253/month — not a floor, and off
by more than an order of magnitude from the volume that actually matters there.

Because more volume under Retention adds cost without adding value, the meaningful threshold
is a **ceiling** — `V_max = (Total_Value − Cf_amortized) / C₂`, the volume beyond which
running costs consume the fixed retention benefit. That is a different quantity than this
field reports, so `V_breakeven` is left undefined for Retention, rather than showing a floor
that points the wrong way. The break-even insight cards are hidden and the KPI reads N/A,
labelled "doesn't scale with volume" — not "negative margin", which would be untrue: the
retention preset is undefined here while earning a healthy positive margin.

*Premium Monetization is a borderline case:* total value is driven by subscriber count, but
the app keeps subscribers synchronised with monthly volume, so at baseline `GV` is genuinely
volume-invariant and the formula holds. It is still reported.

---

### Break-even Months (Time to Cumulative Break-even)

**Formula:**
```
M_breakeven = Cf_total / NCB   (if NCB > 0)
            | 0                (if Cf_total = 0 and NCB > 0)
            | undefined        (if NCB ≤ 0 — never recovers at this volume)
```

**What it measures:** the month at which cumulative cash flow crosses zero — that is, when
the one-time investment has been repaid — **at today's volume**. No volume growth is assumed.
It is the point where the ROI curve crosses the axis, which is exactly what the chart's
vertical marker points at.

**Relationship to payback.** They are the same quantity: `Cf_total / NCB`. Payback is
reported as a headline KPI, `M_breakeven` positions the chart marker. They agree by
construction, which is the point.

**Previous definition (removed).** This used to extrapolate volume growth:
`(V_breakeven − V_effective) / V_effective × 12`. Solving for the growth rate that would make
that correct gives `V_effective / 12` per month — an implied doubling every year that no
input expresses and nobody chose; it fell out of the `× 12` used to turn a dimensionless
ratio into months. On a stable-volume project the threshold is never reached, yet a month was
still displayed — and displayed on a cumulative-cash axis measuring something else entirely.
A chart could show the curve crossing zero at month 17 with the marker drawn at month 6.

---

### Visual Representation

The **ROI Curve Chart** plots `CP(t)` from month 0 to the analysis horizon `N`:

- **Y-axis:** Cumulative profit ($)
- **X-axis:** Months
- **Horizontal dashed line at y=0:** Break-even threshold
- **Vertical chartreuse line:** `M_breakeven` rounded up — the month the curve crosses zero.
  Absent when there are no fixed costs to repay, or when the project never recovers at this
  volume, since there is no crossing to mark
- **Green area fill:** under the cumulative-profit line

---

## Sensitivity Analysis

### Purpose

Test how ROI changes when key assumptions vary. Helps stakeholders understand:
- **Upside potential** (optimistic scenarios)
- **Downside risk** (pessimistic scenarios)
- **Critical variables** (which inputs most impact ROI)

---

### Multiplier System

Four independent multipliers modify baseline assumptions:

| Multiplier | Symbol | Affects | Range |
|------------|--------|---------|-------|
| Volume | `M_volume` | Monthly volume | 0.5x - 3.0x |
| Realization Rate | `M_realization` | AI quality/accuracy | 0.5x - 1.5x |
| Cost | `M_cost` | All Layer 1+2 costs | 0.5x - 2.0x |
| Value | `M_value` | All Layer 3 value drivers | 0.5x - 2.0x |

---

### Application Logic

**Modified Calculations:**
```
V_effective = V × M_volume
S_effective = clamp(S × M_realization, 0, 100)
C₁_effective = C₁ × M_cost
C₂_effective = C₂ × M_cost
GV_effective = GV × M_value   (applied to the value driver, see below)
```

**Where `M_value` actually acts:** on the value *driver* of the selected method, not on the
finished gross value — deflection rate (capped at 100%), absolute conversion uplift, churn
reduction, or subscriber margin. For Cost Displacement this means the residual review cost is
**not** scaled, so `GV` moves slightly more than proportionally with `M_value`.

**Example Scenario:**

**Conservative Case:**
- Volume: 0.8x (80% of expected)
- Realization Rate: 0.9x (90% of expected)
- Costs: 1.2x (20% higher than expected)
- Value: 0.9x (10% lower than expected)

**Result:** ROI drops from 320% to 180%, still profitable but reduced margin.

---

### Tornado Chart - Impact Ranking

**Purpose:** Visualize which variables have the most impact on ROI when varied by ±20%.

**Methodology:**

For each variable (Volume, Realization Rate, Costs, Value):
1. Calculate ROI at baseline (current inputs)
2. Calculate ROI at -20% (variable decreased by 20%)
3. Calculate ROI at +20% (variable increased by 20%)
4. Compute deviation from baseline: `Δ_low = ROI_low - ROI_baseline` and `Δ_high = ROI_high - ROI_baseline`
5. Compute impact range: `Range = |Δ_high - Δ_low|`
6. Sort variables by impact range (descending)

**Visualization:**

The tornado chart displays variables as horizontal bars:
- **Red bars (left):** Extend left from zero, showing ROI decrease when variable drops 20% (downside risk)
- **Green bars (right):** Extend right from zero, showing ROI increase when variable rises 20% (upside potential)
- **Vertical ranking:** Most impactful variables appear at the top
- **Symmetric center:** All bars pivot from zero baseline

**Example:**

If baseline ROI is 150%:
- Volume at -20%: ROI = 120% → `Δ_low = -30%`
- Volume at +20%: ROI = 180% → `Δ_high = +30%`
- Impact Range = 60%

---

### How to Interpret Tornado Charts

**Key Insights:**

1. **Focus on the top bars** - These variables have the most impact on your ROI. Small changes in these variables create large ROI swings.

2. **Asymmetric bars matter** - If the green bar is much longer than the red bar (or vice versa), it means upside and downside risks are unequal. This indicates non-linear relationships or threshold effects.

3. **Prioritize monitoring** - The top 1-2 variables in the tornado chart are your critical metrics to track and optimize in production.

**Key Takeaway:** Rank variables by impact range, then focus optimization efforts on the top 1-2 variables.

**Example Decision Making:**

If "Value" has the highest impact range (63%):
- **Action:** Invest in maximizing value delivered per unit (better AI quality, higher conversion rates)
- **Risk:** Even small degradation in value delivery will significantly reduce ROI
- **Opportunity:** Small improvements in value can dramatically boost ROI

If "Costs" has a smaller impact range (15%):
- **Insight:** Cost optimization is important but not as critical as value delivery
- **Strategy:** Don't obsess over minor cost reductions—focus resources on value enhancement instead

---

## Assumptions & Limitations

### Key Assumptions

1. **Linear Scaling:** Costs and value scale linearly with volume (no economies/diseconomies of scale)
2. **Constant Realization Rate:** AI quality remains stable over time (no model drift)
3. **Static Pricing:** API pricing doesn't change during the analysis period. Model prices are sourced live from the [OptimToken](https://optimtoken.optimnow.io) catalog (refreshed daily); the price date is recorded with each selection (`pricedAt`), catalog-backed models are repriced automatically, and hand-entered prices are left alone (see "Where the Prices Come From").
4. **Independent Variables:** Sensitivity multipliers don't interact (e.g., higher volume doesn't reduce unit costs)
5. **Immediate Value Realization:** Benefits accrue immediately when AI succeeds (no lag)
6. **API-Based Deployment:** Assumes managed-API pricing — pay-per-token, or a flat per-call rate. Self-hosted GPU economics (hardware amortization, utilization, electricity) are not modelled.

---

### Known Limitations

1. **No Time Value of Money:** Does not apply NPV discounting (reasonable for 12-24 month horizons)
2. **No Uncertainty Quantification:** Point estimates, not probability distributions (Monte Carlo planned for Phase 2)
3. **No Learning Curves:** Assumes constant efficiency (ignores optimization over time)
4. **Single Value Method:** Cannot model hybrid value (e.g., both cost savings AND revenue)
5. **Deterministic:** No random variation (real-world has stochastic fluctuations)

---

### When NOT to Use This Calculator

- **Very Early-Stage R&D:** If AI feasibility is unproven, ROI is speculative
- **Non-Quantifiable Value:** Cultural change, employee satisfaction, brand perception
- **Highly Variable Workflows:** If costs/value fluctuate 10x month-to-month
- **Multi-Year Horizons:** Beyond 36 months, NPV discounting becomes critical
- **Regulatory/Compliance Drivers:** If deployment is mandatory regardless of ROI

---

## Validation & Testing

### Unit Test Coverage

The `calculations.ts` module has ~28 test cases covering:

- Edge cases (zero volume, 100% realization rate, negative margins)
- All four value methods with representative scenarios
- Cache optimization, including published cache-read prices vs. the manual discount
- Batch rates, and per-call models ignoring token/cache/batch settings
- Model routing with various split percentages
- Break-even calculations across profitable/unprofitable scenarios
- Sensitivity multiplier interactions

**Test Suites:** `utils/calculations.test.ts`, plus `utils/modelCatalog.test.ts` (catalog
resolution, repricing) and `utils/deepLink.test.ts` (hub handover parsing). Input handling —
the clamping that keeps these formulas fed valid numbers — is covered separately in
`components/InputComponents.test.tsx`.

---

### Industry Benchmarks

Our methodology aligns with standard practices:

| Metric | Industry Standard | Our Implementation |
|--------|-------------------|---------------------|
| ROI Formula | `(Gain - Cost) / Cost × 100` | ✓ Matches |
| Payback Period | `Investment / Annual Cash Flow` | ✓ Matches (monthly) |
| TCO Components | Capex + Opex + Overhead | ✓ Fixed + Variable + Overhead |
| Cache Discount | Provider-published cache-read prices (typically 75-90% off input) | ✓ Taken per model from the OptimToken; manual discount only as fallback |
| Batch Discount | Provider batch APIs, typically -50% | ✓ Applied per model where published |

---

## References & Citations

### Academic Foundations

1. **TCO Modeling:** Gartner TCO Framework for IT Systems (2020)
2. **ROI Methodology:** Harvard Business Review - "How to Calculate ROI" (Phillips & Phillips, 2016)
3. **LLM Cost Modeling:** "The Cost of Training Large Language Models" (Strubell et al., 2019)

### Industry Sources

4. **Token Pricing:**
   - OpenAI API Pricing (https://openai.com/pricing)
   - Anthropic Claude Pricing (https://www.anthropic.com/pricing)
   - Google Gemini API Pricing (https://ai.google.dev/pricing)

5. **Operational Costs:**
   - AWS Pricing Calculator (https://calculator.aws/)
   - LangSmith Monitoring Costs (https://www.langchain.com/langsmith)
   - Pinecone Vector DB Pricing (https://www.pinecone.io/pricing/)

### Internal Documentation

6. **Code Implementation:** `utils/calculations.ts` (`calculateROI`)
7. **Type Definitions:** `types.ts` (UseCaseInputs, ModelParams, CalculationResults interfaces)
8. **Model Catalog & Repricing:** `utils/modelCatalog.ts`; deep links in `utils/deepLink.ts`
9. **Test Validation:** `utils/calculations.test.ts` (plus `deepLink`, `format`, `modelCatalog`, `scenario` under `utils/`, and `components/InputComponents.test.tsx`)

---

## Changelog

### v1.5 (August 17, 2026)
- **Break-even Volume is no longer reported for Retention Uplift.** The formula assumes total
  value scales with volume; under Retention it is driven by `customersImpactedPerMonth`, which
  is independent of volume, so the derivation has no solution of that shape. Documented the
  ceiling that is meaningful there instead, and why Premium Monetization still qualifies.
- **Churn reduction is capped at the baseline churn rate.** `baselineChurnRate` existed as an
  input but was read nowhere, so a reduction larger than the baseline invented value out of a
  negative churn rate.
- Corrected the worked example's `M_breakeven`, which stated 0 where the engine returns 9.0 —
  a leftover from the removed volume-growth definition.
- METHODOLOGY.md is now also published as a static page at `/methodology.html`, generated by
  `scripts/build-methodology.mjs`. This file remains the single source of truth.

### v1.4 (August 2026)
- Version marker only; the document header and footer had drifted apart (1.3 vs 1.4) with no
  content difference between them.

### v1.3 (August 2026)
- Documented model prices sourced from the OptimToken catalog, model identity, auto-repricing rules and hub deep links
- Documented per-call billing as a selectable basis, and published cache-read / batch rates taking precedence over the manual cache discount
- Stated explicitly that retries are a Layer 1 cost, that ROI is a monthly ratio, and that the analysis horizon only drives the ROI curve chart
- Corrected Break-even Months: it is a volume-growth estimate feeding the chart marker, not a second payback formula
- Documented the seven harness components, per-1,000 entry mode and subtotal; noted Ops Overhead is entered as a percentage
- Rebuilt the end-to-end worked example on the Customer Support Bot preset with current catalog prices

### v1.2 (February 2026)
- Updated Revenue Uplift worked example wording from sessions to orders for recommendation scenarios
- Updated recommendation volume example to 100,000 orders/month to match current default preset scale
- Clarified Premium Monetization UI behavior: Monthly Volume and Total Subscribers are synchronized

### v1.1 (January 2026)
- Initial public methodology documentation
- Added ROI curve calculation for cumulative profit visualization
- Documented all four value methods with worked examples
- Clarified break-even analysis formulas

### v1.0 (December 2025)
- Core 3-layer framework implementation
- Basic ROI percentage and payback period calculations

---

## Appendix: Worked Example (End-to-End)

### Scenario: Customer Support Chatbot

This is the **Customer Support Bot** preset exactly as it loads, so it can be reproduced in
the app. Model prices are those of the embedded catalog snapshot; a live catalog may reprice
the model and shift the figures.

**Inputs:**
- **Value & Scope:**
  - Monthly Volume: 10,000 tickets
  - Realization Rate: 90%
  - Analysis Horizon: 12 months (chart only)

- **Fixed Costs:**
  - Integration: $8,000
  - Training: $3,000
  - Change Management: $2,000
  - **Total Fixed:** $13,000
  - Amortization: 12 months

- **Layer 1 (Infrastructure):**
  - Model: Claude Haiku 4.5 (Anthropic, via OptimToken)
  - Input tokens: 1,500/ticket
  - Output tokens: 500/ticket
  - Input price: $1.00/1M tokens
  - Output price: $5.00/1M tokens
  - Published cache-read price: $0.10/1M tokens (90% off)
  - Cache hit rate: 60%
  - Batch processing: off (support is interactive)
  - Retry rate: 10%

- **Layer 2 (Harness), per ticket:**
  - Orchestration: $0.0020
  - Retrieval: $0.0015
  - Tool APIs: $0.0003
  - Logging / Monitoring: $0.0008
  - Safety / Guardrails: $0.0005
  - Network Egress: $0.0002
  - Storage: $0.0002
  - Ops Overhead: 0% (`Oh` = 1.0)

- **Layer 3 (Value):**
  - Method: Cost Displacement
  - Baseline human cost: $0.50/ticket
  - Deflection rate: 35%
  - Residual review rate: 5%
  - Residual review cost: $0.10/ticket

---

### Step-by-Step Calculation

**Layer 1:**
```
Effective input price = (0.10 × 0.60) + (1.00 × 0.40) = $0.46/1M
Input cost  = (1,500 / 1,000,000) × 0.46 = $0.00069
Output cost = (500 / 1,000,000) × 5.00   = $0.00250
Base cost = 0.00069 + 0.00250 = $0.00319/ticket

With retries: C₁ = 0.00319 × 1.10 = $0.003509/ticket
```

**Layer 2:**
```
H_sum = 0.0020 + 0.0015 + 0.0003 + 0.0008 + 0.0005 + 0.0002 + 0.0002 = $0.0055
C₂ = (0.003509 + 0.0055) × 1.0 = $0.009009/ticket
```

**Fixed Costs:**
```
Cf_amortized = 13,000 / 12 = $1,083.33/month
```

**Layer 3 (Value):**
```
Deflection savings = 0.50 × 0.35 = $0.175
Residual cost = 0.10 × 0.05 = $0.005
Gross value = (0.175 - 0.005) × 0.90 = $0.153/ticket
```

**Monthly Metrics:**
```
C_monthly_var   = 0.009009 × 10,000 = $90.09
C_monthly_total = 90.09 + 1,083.33 = $1,173.42
Cost per ticket = 1,173.42 / 10,000 = $0.1173

Total_Value = 0.153 × 10,000 = $1,530/month
NMB = 1,530 - 1,173.42 = $356.58/month
NCB = 1,530 - 90.09 = $1,439.91/month   (cash, before amortization)
```

**ROI Metrics:**
```
ROI% = (356.58 / 1,173.42) × 100 = 30.4%
Payback = 13,000 / 1,439.91 = 9.0 months
```

**Break-even:**
```
Unit margin = 0.153 - 0.009009 = $0.143991
V_breakeven = ceil(1,083.33 / 0.143991) = 7,524 tickets/month
M_breakeven = 13,000 / 1,439.91 = 9.0 months  (chart marker at month 10, rounded up)
```

**Interpretation:**
- 30% monthly ROI: every month generates $357 of profit after absorbing $1,083 of amortized fixed cost
- The model itself is the smaller half of the running cost ($35/month) — the harness is $55/month
- Break-even at 7,524 tickets, already exceeded at 10,000/month
- The $13,000 investment is repaid in cash in 9.0 months
- After 12 months: cumulative profit = -13,000 + (1,439.91 × 12) = **$4,278.92**
- Note how much of the outcome rides on the fixed costs: the running cost is only $90/month
  against $1,083 of amortization, so the ROI headline is mostly a statement about the rollout
  estimate, not about the model. This is why the fixed-cost fields deserve real numbers.

---

## Contact & Support

For questions, corrections, or suggestions regarding this methodology:

- **GitHub Issues:** [ai-roi-calculator/issues](https://github.com/OptimNow/ai-roi-calculator/issues)
- **Email:** contact@optimnow.io
- **Website:** [www.optimnow.io](https://www.optimnow.io)

---

**Document Version:** 1.5
**Last Reviewed:** August 15, 2026
**Next Review:** November 15, 2026 (or upon Phase 2 release)
