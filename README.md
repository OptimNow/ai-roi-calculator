# AI ROI Calculator

A comprehensive web application for calculating the return on investment (ROI) of AI and Large Language Model (LLM) projects. Built to help organizations make data-driven decisions about AI implementations by analyzing costs, value generation, and break-even scenarios across a 3-layer framework.

**Live Demo:** [Deployed on Vercel](https://ai-roi-calculator.vercel.app)
**Developed by:** [OptimNow](https://www.optimnow.io)

---

## Overview

Calculating ROI for AI initiatives is notoriously difficult. Unlike traditional software projects with predictable costs, AI implementations involve multiple layers of complexity that most organizations struggle to capture. Token-based pricing fluctuates with usage patterns, cache optimization impacts costs unpredictably, and operational overhead from orchestration and monitoring often remains hidden until production. Meanwhile, quantifying business value proves equally challenging: how do you measure the true impact of an AI assistant that deflects support tickets, or the revenue uplift from improved conversions?

Finance teams need more than back-of-the-envelope estimates. They need a rigorous framework that accounts for the full technical stack while translating AI capabilities into concrete business metrics. That's exactly what this calculator provides.

The AI ROI Calculator uses a **3-layer framework** that mirrors how production AI systems actually work. Layer 1 captures infrastructure costs at the model level—accounting for token consumption, cache hit rates, and multi-model routing strategies. Layer 2 adds the "harness" costs that surround the model: orchestration platforms, vector databases for retrieval, monitoring systems, API tool calls, and network overhead. Layer 3 translates all this technical investment into business value using four distinct measurement methods, each tailored to different use cases.

This approach solves a critical gap in AI planning. Most ROI estimates either oversimplify costs (ignoring operational overhead entirely) or overcomplicate them (requiring weeks of spreadsheet engineering). This calculator strikes a balance: sophisticated enough to handle real-world complexity, yet accessible enough for product managers and finance teams to use independently. The result is transparent, auditable projections that stand up to CFO scrutiny while remaining grounded in production realities.

### What Makes This Framework Different

The calculator doesn't just add up costs and benefits. It provides the analytical depth needed for confident decision-making through features like break-even analysis (showing exactly when your AI investment pays off), sensitivity analysis (identifying which variables matter most to ROI), and scenario comparison (evaluating trade-offs between different implementation approaches). Every calculation is fully transparent and documented in the accompanying methodology guide, ensuring stakeholders can audit the math and understand the assumptions.

Whether you're evaluating an AI customer support bot, a content generation tool, or a data extraction system, this framework helps you move beyond vague promises of "productivity gains" and "efficiency improvements" toward concrete, defensible financial projections.

### Core Capabilities

**3-Layer Cost Framework** captures the full technical stack from model inference through operational overhead to business value generation. Layer 1 (Infrastructure) handles model costs with token-based pricing, cache optimization, and multi-model routing. Layer 2 (Harness) accounts for orchestration, retrieval, monitoring, tool APIs, and operational overhead. Layer 3 (Business Value) quantifies ROI using four distinct measurement methods.

**4 Value Measurement Methods** let you quantify business impact based on your specific use case. Cost Displacement calculates savings from automating manual processes, Revenue Uplift measures increased conversions and sales, Retention Uplift quantifies reduced customer churn, and Premium Monetization evaluates subscription-based AI feature revenue.

**Advanced Analysis Tools** provide the depth needed for strategic planning. Create unlimited What-If Scenarios to compare different approaches, visualize Break-even Analysis showing cumulative profit over time, run Sensitivity Analysis with tornado charts ranking variable impact on ROI, and export detailed scenario comparisons with percentage differences highlighted.

**Professional Interface** combines sophisticated analysis with accessible design. The responsive layout works seamlessly on desktop and mobile, with a clear visual hierarchy separating grey input columns from white results. Interactive charts powered by Recharts bring your projections to life, while comprehensive help guides and WCAG 2.1 AA accessibility ensure everyone can use the tool effectively.

---

## Tech Stack

- **Framework:** React 19.2.3
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (via CDN)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library (30+ unit & integration tests)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OptimNow/ai-roi-calculator.git
   cd ai-roi-calculator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

### Running Tests

```bash
npm test
```

---

## Usage

### Basic Workflow

1. **Select a Preset:** Choose from predefined use cases (Customer Support, Content Generation, Data Extraction, etc.) or use "Custom" to start from scratch.

2. **Configure General Settings:**
   - Enter your use case name and unit of measurement (e.g., "tickets", "conversations", "documents")
   - Set monthly volume and expected success rate
   - Choose analysis horizon (months)

3. **Enter Fixed Costs:**
   - Integration & development costs
   - Training & tuning expenses
   - Change management overhead
   - Amortization period

4. **Configure Infrastructure (Layer 1):**
   - Primary model token usage and pricing
   - Optional: Toggle Advanced Mode for multi-model routing
   - Set cache hit rate and discount for optimization

5. **Configure Harness Costs (Layer 2):**
   - Orchestration, retrieval, and tool API costs per unit
   - Logging, monitoring, and safety guardrails
   - Network egress and storage costs
   - Retry rate and overhead multiplier

6. **Select Value Method (Layer 3):**
   - Choose how your AI solution generates business value
   - Enter method-specific parameters (e.g., baseline costs, conversion rates, churn rates)

7. **Analyze Results:**
   - View 5 key metrics: ROI %, Monthly Benefit, Payback Period, Cost/Unit, and Break-even Volume
   - Review detailed cost breakdown by layer
   - Check insight cards for warnings and recommendations

8. **Use Advanced Features:**
   - **Sensitivity Simulator:** Test different scenarios with multipliers
   - **Scenario Manager:** Save current calculation for later comparison
   - **Scenario Comparison:** Compare multiple scenarios side-by-side

### Example Use Case

**Customer Support Automation:**
- Monthly volume: 10,000 tickets
- Success rate: 80% (AI successfully resolves 8,000 tickets)
- Value method: Cost Displacement
- Baseline human cost: $5 per ticket
- Deflection rate: 70% (AI prevents escalation for 5,600 tickets)
- Result: ~$22,400 monthly benefit with ~450% ROI

---

## Project Structure

```
ai-roi-calculator/
├── components/
│   ├── App.tsx                    # Main application component
│   ├── Charts.tsx                 # Memoized chart components (ROI curve, tornado)
│   ├── FixedCostsSection.tsx      # Fixed costs input form
│   ├── GeneralInputsSection.tsx   # General settings form
│   ├── HarnessSection.tsx         # Layer 2 harness costs form
│   ├── HelpGuide.tsx              # Comprehensive help modal
│   ├── InfrastructureSection.tsx  # Layer 1 model costs form
│   ├── ResultsDashboard.tsx       # ROI metrics and visualizations
│   ├── ScenarioComparison.tsx     # Side-by-side scenario comparison
│   ├── ScenarioManager.tsx        # Scenario CRUD interface
│   ├── SensitivitySimulator.tsx   # What-if analysis tool
│   └── ValueSection.tsx           # Layer 3 business value form
├── utils/
│   └── calculations.ts            # Core ROI calculation logic
├── types.ts                       # TypeScript interfaces
├── constants.ts                   # Presets and default values
├── tests/                         # Unit and integration tests
├── public/images/                 # Brand assets (logo, favicon)
├── METHODOLOGY.md                 # Mathematical specification & theory
├── ROADMAP.md                     # Product development plan
├── UAT_SCENARIOS.md               # User acceptance testing guide
├── DEPLOYMENT.md                  # Vercel deployment instructions
└── README.md                      # This file
```

---

## Methodology & Transparency

For complete transparency and academic rigor, we provide detailed documentation of all calculation methodologies:

**[METHODOLOGY.md](METHODOLOGY.md)** - Comprehensive mathematical specification including:
- 3-layer framework architecture and design philosophy
- Complete formulas for all ROI calculations with derivations
- Worked examples for each of the 4 value methods
- Break-even analysis mathematics
- Sensitivity analysis methodology
- Assumptions, limitations, and validation
- Industry references and citations

This document enables:
- **Auditability** for stakeholders and finance teams
- **Reproducibility** for researchers and academics
- **Trust** through complete transparency of calculation logic
- **Verification** that formulas align with industry standards

---

## Testing

The calculator includes comprehensive test coverage:

- **30+ Unit Tests:** All calculation functions validated with edge cases
- **Integration Tests:** Component inputs and validation logic
- **Error Boundary:** Graceful error handling with user-friendly fallback UI

Run tests with:
```bash
npm test
```

For coverage report:
```bash
npm run test:coverage
```

---

## User Acceptance Testing

A detailed UAT guide with 24 test scenarios is available in [UAT_SCENARIOS.md](UAT_SCENARIOS.md). This covers:

- Basic calculator functionality
- Preset loading and validation
- Advanced mode and model routing
- All 4 value methods
- Sensitivity simulator
- Break-even analysis
- Scenario manager CRUD operations
- UI/UX and accessibility
- Data export functionality

---

## Deployment

The app is configured for seamless Vercel deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for:

- Vercel configuration settings
- Troubleshooting static asset issues
- Cache clearing instructions
- Local build verification steps

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OptimNow/ai-roi-calculator)

---

## Roadmap

### Current Version: v1.1 (January 2025)

**Completed Features:**
- Core 3-layer ROI calculator with 4 value methods
- What-If Scenarios with unlimited comparisons
- Break-even analysis with ROI curve visualization
- Sensitivity analysis with tornado chart
- Visual UI hierarchy (grey inputs, white results)
- 30+ unit tests and WCAG 2.1 AA accessibility
- Comprehensive help guide

### Upcoming (v1.2 - Q2 2025)

**High Priority:**
- **Self-Hosted Model Pricing:** Support for on-premise GPU deployments (open-source models like Llama, Mistral)
- **Confidence Intervals:** Optimistic/pessimistic/realistic projections with Monte Carlo simulation
- **Export to Excel:** Multi-sheet workbook with formulas and charts

**Medium Priority:**
- Preset customization and sharing
- Dark mode theme toggle
- Print-friendly report view

See [ROADMAP.md](ROADMAP.md) for the full product development plan.

---

## Important Notes

### API-Based Pricing Assumption

The calculator currently assumes **API-based pricing** (cost per token) for model inference. This is typical for:
- OpenAI GPT-4, GPT-3.5
- Anthropic Claude
- Google Gemini
- Azure OpenAI Service
- AWS Bedrock

**Self-hosted deployment pricing** (on-premise GPUs, open-source models) will be added in v1.2 (Q2 2025).

### Data Privacy

All calculations are performed **client-side** in your browser. No data is sent to external servers. Saved scenarios are stored in your browser's localStorage and never leave your device unless you explicitly export them.

---

## Contributing

We welcome contributions! To suggest features or report bugs:

1. Open an issue on GitHub with label `enhancement`, `bug`, or `documentation`
2. Provide detailed use cases and expected behavior
3. Include mockups for UI changes (if applicable)

For major changes, please open an issue first to discuss what you would like to change.

---

## Support

- **Documentation:** See [HelpGuide.tsx](components/HelpGuide.tsx) or click the "How to Fill" button in the app
- **Issues:** [GitHub Issues](https://github.com/OptimNow/ai-roi-calculator/issues)
- **Website:** [www.optimnow.io](https://www.optimnow.io)

---

## License

This project is licensed under the MIT License.

---

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

**Last Updated:** January 1, 2025
**Version:** 1.1
