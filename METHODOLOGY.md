# AI ROI Calculator - Methodology & Mathematical Specification

**Version:** 1.1
**Last Updated:** January 1, 2026
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
| `S` | Success rate | % (0-100) |
| `C₁` | Layer 1 cost per unit | $/unit |
| `C₂` | Layer 2 cost per unit | $/unit |
| `Cf` | Fixed costs (one-time) | $ |
| `A` | Amortization period | months |
| `GV` | Gross value per unit | $/unit |
| `NV` | Net value per unit (after success rate) | $/unit |
| `ROI` | Return on Investment | % |
| `M` | Sensitivity multiplier | scalar (1.0 = baseline) |

### Key Principles

1. **Additive Costs**: All cost components sum linearly
2. **Multiplicative Success**: Value scales by success rate (`S/100`)
3. **Amortization**: Fixed costs spread across analysis horizon
4. **Conservative Estimation**: When uncertain, favor higher costs / lower value

---

## Layer 1: Infrastructure Costs

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

**Use Case:** Some providers (e.g., Anthropic's legacy plans) charge per request regardless of tokens.

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
- Primary: GPT-3.5 Turbo @ $0.0005/1K tokens → 70% traffic
- Secondary: GPT-4 @ $0.03/1K tokens → 30% traffic
- Blended cost reduces overall spend while maintaining quality for complex queries

---

### Cache Optimization

**Formula:**
```
C₁_input_cached = C₁_input × [1 - (Hr × Dr)]
C₁_cached = C₁_input_cached + C₁_output
```

**Where:**
- `Hr` = Cache hit rate (%, 0-100)
- `Dr` = Cached token discount rate (%, 0-100)
- Example: 50% hit rate with 90% discount → 45% input cost reduction

**Rationale:**
- **Input tokens** can be cached (prompt templates, system instructions)
- **Output tokens** cannot be cached (unique responses)
- Providers like Anthropic offer 90% discount for cached prompt tokens

---

### Retry Logic

**Formula:**
```
C₁_with_retries = C₁_cached × (1 + Rr)
```

**Where:**
- `Rr` = Retry rate (0.1 = 10% of calls retry once)

**Rationale:** API failures, timeouts, and rate limits necessitate retries. Conservative estimate assumes full model cost for retries (no caching benefit on retry).

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
| Network Egress | `Cn` | Data transfer out of cloud provider | $0.00001 - $0.0001/unit |
| Storage | `Cs` | S3, RDS for conversation history | $0.00001 - $0.0005/unit |

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
- `Oh` = Overhead multiplier (1.0 - 1.5)
  - 1.0 = Perfectly optimized system
  - 1.1 = 10% DevOps/maintenance overhead
  - 1.2-1.5 = Early-stage systems with inefficiencies

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
GV = [(Bh × Dr) - (Rrc × Rr)] × (S / 100) × M_value
```

**Where:**
- `Bh` = Baseline human cost per unit ($)
- `Dr` = Deflection rate (% of work AI handles without escalation)
- `Rrc` = Residual review cost per unit ($)
- `Rr` = Residual review rate (% of AI outputs requiring human review)

**Example Calculation:**

**Inputs:**
- Baseline human cost: $1.00/ticket
- Deflection rate: 35% (AI resolves without human)
- Residual review rate: 5% (AI draft requires human review)
- Residual review cost: $0.20/ticket
- Success rate: 90%

**Math:**
```
GV = [(1.00 × 0.35) - (0.20 × 0.05)] × 0.90
   = [0.35 - 0.01] × 0.90
   = 0.34 × 0.90
   = $0.306 per ticket
```

**Interpretation:** Each AI-handled ticket saves $0.31 compared to pure human handling.

**Success Rate Explanation (90%):**
- **What it means:** Technical success rate - 90% of AI attempts produce usable output, 10% fail completely (timeouts, errors, no response)
- **Why 90% for this scenario:** Customer support systems face real-world variability (unclear questions, edge cases, system integrations). 90% is realistic for production chatbots.
- **Independence from deflection/review rates:** Success rate is orthogonal to quality metrics. An AI can successfully generate output (counted in the 90%) that still requires human review (the 5% residual review rate). These are separate dimensions:
  - **Success rate:** Did the AI produce output at all?
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
- Success rate: 100% (all users see recommendations)

**Math:**
```
ΔConv = 0.002 (0.2 percentage points as decimal)
GV = 85 × 0.002 × 0.45 × 1.00
   = 0.17 × 0.45 × 1.00
   = $0.0765 per session
```

**At 500,000 sessions/month:**
```
Total Value = 0.0765 × 500,000 = $38,250/month
```

**Note:** Absolute uplift ≠ relative uplift. 3% → 3.2% is:
- **Absolute:** +0.2 percentage points ✓ (enter this)
- **Relative:** +6.67% ✗ (do NOT enter this)

**Success Rate Explanation (100%):**
- **What it means:** 100% of sessions receive AI-generated recommendations without technical failures
- **Why 100% for this scenario:** E-commerce recommendation engines are typically stateless, pre-computed systems with high reliability. Unlike interactive chatbots, they serve cached/pre-generated recommendations, so technical failure rates approach zero in production.
- **No quality dependency:** Success rate measures technical delivery, not recommendation quality. A poorly-targeted recommendation still counts as "successful" if delivered. The conversion uplift metric captures quality - if recommendations are bad, uplift will be low/zero.

---

### Method 3: Retention Uplift

**Use Cases:** Churn prevention, loyalty programs, proactive customer success

**Formula:**
```
Total_Value = (Ci × Cra × (S / 100) × M_value) × (Av / 12)
```

**Where:**
- `Ci` = Customers impacted per month
- `Cra` = Churn reduction absolute (percentage points, e.g., 0.5 for 2.5% → 2.0%)
- `Av` = Annual value per customer ($)

**Example Calculation:**

**Inputs:**
- Customers impacted: 10,000/month
- Baseline churn: 2.5%/month
- Churn reduction: 0.5 percentage points absolute
- Annual customer value: $1,200
- Success rate: 85%

**Math:**
```
Saved customers = 10,000 × 0.005 × 0.85 = 42.5 customers/month
Monthly value per saved customer = 1,200 / 12 = $100
Total Value = 42.5 × 100 = $4,250/month
```

**Interpretation:** Preventing 42.5 customers from churning each month generates $4,250 in retained revenue.

**Success Rate Explanation (85%):**
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

**Example Calculation:**

**Inputs:**
- Subscription price: $15/month
- Non-AI COGS (hosting, support): $3/month
- Subscribers: 5,000
- Success rate: 100%

**Math:**
```
Margin per subscriber = 15 - 3 = $12
Total Value = 12 × 5,000 × 1.00 = $60,000/month
```

**Success Rate Explanation (100%):**
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
Payback_months = Cf_total / NMB  (if NMB > 0)
```

**Special Cases:**
- `NMB ≤ 0`: "No Payback" (project never recoups fixed costs)
- `Cf_total = 0`: "Immediate" (no upfront investment)

**Example:**
```
Fixed costs = $25,000
Monthly net benefit = $8,000
Payback = 25,000 / 8,000 = 3.1 months
```

---

### Cumulative Profit Over Time

**Formula:**
```
CP(t) = -Cf_total + (NMB × t)
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

---

### Break-even Months (Time to Profitability)

**Formula:**
```
M_breakeven = Cf_total / NMB  (if NMB > 0)
```

**Note:** This is identical to Payback Period. Break-even time = time to recover fixed costs.

---

### Visual Representation

The **ROI Curve Chart** plots `CP(t)` from month 0 to the analysis horizon:

- **Y-axis:** Cumulative profit ($)
- **X-axis:** Months
- **Horizontal line at y=0:** Break-even threshold
- **Vertical chartreuse line:** Break-even month marker
- **Green gradient fill:** Profitable region (above y=0)
- **Red gradient fill:** Loss region (below y=0, not currently implemented)

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
| Success Rate | `M_success` | AI quality/accuracy | 0.5x - 1.5x |
| Cost | `M_cost` | All Layer 1+2 costs | 0.5x - 2.0x |
| Value | `M_value` | All Layer 3 value drivers | 0.5x - 2.0x |

---

### Application Logic

**Modified Calculations:**
```
V_effective = V × M_volume
S_effective = min(100, S × M_success)
C₁_effective = C₁ × M_cost
C₂_effective = C₂ × M_cost
GV_effective = GV × M_value
```

**Example Scenario:**

**Conservative Case:**
- Volume: 0.8x (80% of expected)
- Success Rate: 0.9x (90% of expected)
- Costs: 1.2x (20% higher than expected)
- Value: 0.9x (10% lower than expected)

**Result:** ROI drops from 320% to 180%, still profitable but reduced margin.

---

### Tornado Diagram (Not Yet Implemented)

A planned feature (Phase 2) will show which variables have the largest impact on ROI:

```
Impact on ROI (% change):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Success Rate    ██████████████████ 45%
Volume          ███████████████ 38%
Value (Margin)  ██████████ 25%
Layer 1 Cost    ████ 12%
Layer 2 Cost    ██ 8%
```

---

## Assumptions & Limitations

### Key Assumptions

1. **Linear Scaling:** Costs and value scale linearly with volume (no economies/diseconomies of scale)
2. **Constant Success Rate:** AI quality remains stable over time (no model drift)
3. **Static Pricing:** API pricing doesn't change during analysis period
4. **Independent Variables:** Sensitivity multipliers don't interact (e.g., higher volume doesn't reduce unit costs)
5. **Immediate Value Realization:** Benefits accrue immediately when AI succeeds (no lag)
6. **API-Based Deployment:** Currently assumes pay-per-token pricing (self-hosted GPU pricing in v1.2)

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

The `calculations.ts` module includes 30+ test cases covering:

- Edge cases (zero volume, 100% success rate, negative margins)
- All four value methods with representative scenarios
- Cache optimization logic
- Model routing with various split percentages
- Break-even calculations across profitable/unprofitable scenarios
- Sensitivity multiplier interactions

**Test Suite:** `utils/calculations.test.ts`

---

### Industry Benchmarks

Our methodology aligns with standard practices:

| Metric | Industry Standard | Our Implementation |
|--------|-------------------|---------------------|
| ROI Formula | `(Gain - Cost) / Cost × 100` | ✓ Matches |
| Payback Period | `Investment / Annual Cash Flow` | ✓ Matches (monthly) |
| TCO Components | Capex + Opex + Overhead | ✓ Fixed + Variable + Overhead |
| Cache Discount | Anthropic: 90%, OpenAI: 50% | ✓ Configurable |

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

6. **Code Implementation:** `utils/calculations.ts` (lines 1-280)
7. **Type Definitions:** `types.ts` (UseCaseInputs, CalculationResults interfaces)
8. **Test Validation:** `utils/calculations.test.ts`

---

## Changelog

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

**Inputs:**
- **General:**
  - Monthly Volume: 1,000 tickets
  - Success Rate: 90%
  - Analysis Horizon: 12 months

- **Fixed Costs:**
  - Integration: $5,000
  - Training: $2,000
  - Change Management: $1,000
  - **Total Fixed:** $8,000
  - Amortization: 12 months

- **Layer 1 (Infrastructure):**
  - Model: GPT-3.5 Turbo
  - Input tokens: 800/ticket
  - Output tokens: 300/ticket
  - Input price: $0.15/1M tokens
  - Output price: $0.60/1M tokens
  - Cache hit rate: 10%
  - Cache discount: 90%
  - Retry rate: 10%

- **Layer 2 (Harness):**
  - Orchestration: $0.001/ticket
  - Retrieval: $0.002/ticket
  - Logging: $0.0005/ticket
  - Overhead multiplier: 1.1

- **Layer 3 (Value):**
  - Method: Cost Displacement
  - Baseline human cost: $8.50/ticket
  - Deflection rate: 35%
  - Residual review rate: 5%
  - Residual review cost: $2.50/ticket

---

### Step-by-Step Calculation

**Layer 1:**
```
Input cost = (800 / 1,000,000) × 0.15 = $0.00012
Output cost = (300 / 1,000,000) × 0.60 = $0.00018
Base cost = 0.00012 + 0.00018 = $0.0003/ticket

Cache savings = 0.00012 × (0.10 × 0.90) = 0.0000108
Cached input cost = 0.00012 - 0.0000108 = 0.0001092
C₁ = 0.0001092 + 0.00018 = $0.0002892/ticket

With retries: C₁ = 0.0002892 × 1.10 = $0.00031812/ticket
```

**Layer 2:**
```
Harness sum = 0.001 + 0.002 + 0.0005 = $0.0035
C₂_pre_overhead = 0.00031812 + 0.0035 = $0.00381812
C₂ = 0.00381812 × 1.1 = $0.00419993/ticket
```

**Fixed Costs:**
```
Cf_amortized = 8,000 / 12 = $666.67/month
```

**Layer 3 (Value):**
```
Deflection savings = 8.50 × 0.35 = $2.975
Residual cost = 2.50 × 0.05 = $0.125
Gross value = (2.975 - 0.125) × 0.90 = $2.565/ticket
```

**Monthly Metrics:**
```
C_monthly_var = 0.00419993 × 1,000 = $4.20
C_monthly_total = 4.20 + 666.67 = $670.87

Total_Value = 2.565 × 1,000 = $2,565/month
NMB = 2,565 - 670.87 = $1,894.13/month
```

**ROI Metrics:**
```
ROI% = (1,894.13 / 670.87) × 100 = 282.3%
Payback = 8,000 / 1,894.13 = 4.2 months
```

**Break-even:**
```
Unit margin = 2.565 - 0.00419993 = $2.56080007
V_breakeven = 666.67 / 2.56080007 = 260 tickets/month
```

**Interpretation:**
- Every month generates $1,894 profit (after recovering $667 of fixed costs)
- 282% monthly ROI
- Break-even at 260 tickets (already exceeded at 1,000/month)
- Fixed costs recovered in 4.2 months
- After 12 months: Total cumulative profit = -8,000 + (1,894.13 × 12) = **$14,729.56**

---

## Contact & Support

For questions, corrections, or suggestions regarding this methodology:

- **GitHub Issues:** [ai-roi-calculator/issues](https://github.com/OptimNow/ai-roi-calculator/issues)
- **Email:** contact@optimnow.io
- **Website:** [www.optimnow.io](https://www.optimnow.io)

---

**Document Version:** 1.1
**Last Reviewed:** January 1, 2026
**Next Review:** April 1, 2026 (or upon Phase 2 release)
