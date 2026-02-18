# AI ROI Calculator - Product Roadmap

## Current Version: v1.1
Built with React + TypeScript, implementing a 3-layer ROI framework for AI projects.

**Latest Release:** January 1, 2026
- ✅ Core 3-layer ROI calculator with 4 value methods
- ✅ ROI curve visualization showing cumulative profit over time
- ✅ Tornado chart for sensitivity analysis (±20% variable impact)
- ✅ Visual UI hierarchy (grey inputs, white results)
- ✅ Brand guidelines applied (Chartreuse #ACE849, professional UI)
- ✅ Comprehensive testing (30+ unit & integration tests)
- ✅ Error boundary for graceful error handling
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Performance optimizations (React.memo for charts)
- ✅ Comprehensive help guide modal
- ✅ JSDoc documentation
- ✅ Streamlined 2-section input layout (Value & Scope + Cost Model)
- ✅ "Success Rate" renamed to "Realization Rate" for clarity

---

## ✅ Completed Improvements (v1.1 - Dec 31, 2025)

### Code Quality & Testing
- [x] **Unit Tests**: 30+ test cases for calculations.ts covering all scenarios
- [x] **Integration Tests**: Component tests for all input types with validation
- [x] **Error Boundary**: Graceful error handling with user-friendly fallback UI
- [x] **Input Validation**: All inputs validated (min/max, NaN handling, type safety)

### Performance
- [x] **Chart Optimization**: Memoized chart components with React.memo
- [x] **Reduced Re-renders**: Custom comparison functions for chart updates only when data changes

### Documentation
- [x] **JSDoc Comments**: Comprehensive documentation for calculation functions
- [x] **Help Guide**: Full user guide accessible via help button
- [x] **Code Comments**: Inline explanations for complex calculations

### Accessibility (WCAG 2.1 AA)
- [x] **ARIA Labels**: Complete ARIA implementation for screen readers
- [x] **Keyboard Navigation**: Full keyboard support
- [x] **Live Regions**: Dynamic updates announced to screen readers
- [x] **Semantic HTML**: Proper role attributes and structure

### UI/UX Enhancements
- [x] **Brand Colors**: Chartreuse (#ACE849) primary, professional palette
- [x] **Visual Hierarchy**: Grey background for inputs, white for results
- [x] **Logo & Favicon**: Brand assets integrated
- [x] **Help Modal**: Comprehensive "How to Fill" guide with examples
- [x] **Responsive Design**: Mobile-friendly layout
- [x] **Streamlined Layout**: Consolidated from 5 input sections to 2 (Value & Scope + Cost Model)
- [x] **Realization Rate**: Renamed "Success Rate" to better describe business value realization

---

## ✅ Phase 1 Complete (January 2026)

### 🎯 Phase 1: Enhanced Analysis & Comparison

#### 1. What-If Scenarios ✅
**Status: Complete**
- ✅ Users can save multiple calculation scenarios
- ✅ Side-by-side comparison view of unlimited scenarios
- ✅ Scenarios saved to browser localStorage with auto-sync
- ✅ Export/import scenarios as JSON files
- ✅ Visual diff highlighting key metric changes with percentage indicators
- ✅ Color-coded scenarios using golden angle distribution
- ✅ ScenarioManager component with full CRUD operations
- ✅ ScenarioComparison component with bar charts and comparison tables

**Implementation:**
- Added Scenario interface to types.ts
- Created ScenarioManager.tsx (400+ lines) with save/load/delete/export/import
- Created ScenarioComparison.tsx (220+ lines) with Recharts visualization
- Integrated into App.tsx with localStorage persistence
- FolderOpen button in header with badge showing scenario count

---

#### 2. Break-even Analysis & ROI Curve ✅
**Status: Complete**
- ✅ Calculate volume needed to achieve positive ROI
- ✅ Break-even KPI card in main dashboard
- ✅ ROI curve chart showing cumulative profit over 12 months
- ✅ Visual break-even point marker on curve
- ✅ Conditional insight cards (warning when below, success when above)
- ✅ Display percentage increase needed: "Need X more units (Y% increase)"

**Implementation:**
- Added breakEvenVolume and breakEvenMonths to calculations.ts
- Created ROICurveChart component in Charts.tsx with ComposedChart
- Formula: volume = monthlyAmortizedFixedCost / (grossValuePerUnit - layer2CostPerUnit)
- Handles edge cases: negative margin, zero margin, already profitable
- Gradient fill for profit/loss visualization
- Chartreuse accent for break-even reference line

---

#### 3. Sensitivity Analysis & Tornado Chart ✅
**Status: Complete**
- ✅ Tornado chart visualizing ±20% variable impact on ROI
- ✅ Variables ranked by impact magnitude (highest at top)
- ✅ Red bars for downside risk, green bars for upside potential
- ✅ Fixed inverse relationship color bug (costs variable)
- ✅ Detailed tooltips showing baseline, low, high, and impact range
- ✅ Centered layout with proper chart dimensions

**Implementation:**
- Created TornadoChart component in Charts.tsx with vertical BarChart
- Variables tested: Volume, Realization Rate, Costs, Value
- Math.min/max logic to handle inverse relationships correctly
- Sorting by `Math.abs(high - low)` for impact ranking
- ResponsiveContainer with h-full for proper rendering

---

## 🚀 Future Enhancements

---

### 📊 Phase 2: Advanced Projections (Q1 2026)

#### 4. Self-Hosted Model Pricing Support
**Priority: High**
**Status:** Planned for Q2 2025

Currently, the calculator only supports API-based pricing (pay-per-token). This feature will add support for self-hosted/on-premise deployments.

**Features:**
- Toggle between "API-based" and "Self-hosted" deployment modes
- Self-hosted inputs:
  - GPU hardware cost (one-time capital expenditure)
  - Monthly cloud compute cost (if using cloud GPUs like AWS p4d, Azure NCv4)
  - Electricity cost per kWh
  - Estimated throughput (tokens/sec per GPU)
  - Number of GPUs
  - Hardware depreciation period (24-36 months typical)
- Calculate effective cost per token based on:
  - Amortized hardware costs
  - Operational expenses (electricity, cooling, maintenance)
  - DevOps overhead
- Comparison view: "Should I use API or self-host?"

**Use Cases:**
- Open-source models (Llama, Mistral, custom fine-tuned models)
- High-volume workloads where self-hosting becomes cheaper
- Data sovereignty/privacy requirements
- Custom hardware optimization (Apple Silicon, custom ASICs)

**Technical Approach:**
- Add `deploymentMode` field to UseCaseInputs: 'api' | 'self-hosted'
- Create SelfHostedParams interface with GPU hardware/ops costs
- Modify calculateModelCost() to handle both pricing models
- Add conditional UI for self-hosted inputs in Infrastructure section
- Update help guide with self-hosted cost estimation best practices

---

#### 5. Confidence Intervals
**Priority: Medium**
- Add optimistic/pessimistic/realistic projections
- User-defined variance ranges for key inputs
- Monte Carlo simulation option for risk analysis
- Confidence bands on ROI charts

**Technical Approach:**
- Implement variance/range inputs for key parameters
- Add simulation engine for Monte Carlo analysis
- Update charts with confidence bands (shaded areas)
- Create probability distribution visualizations

---

#### 6. Export to Excel
**Priority: Medium**
- Enhanced export with full calculation formulas
- Multi-sheet workbook: Summary, Inputs, Calculations, Charts
- Editable Excel model for offline analysis
- Pre-formatted with brand colors

**Technical Approach:**
- Add library: `xlsx` or `exceljs`
- Create Excel template generator
- Include formulas that mirror calculations.ts logic
- Embed charts as images or Excel chart objects

---

### 🎨 Phase 3: User Experience Enhancements (Q2-Q3 26)

#### 7. Preset Customization
**Priority: Medium**
- Allow users to save custom presets to localStorage
- Edit existing presets
- Import/export preset library
- Share presets via URL parameters

**Technical Approach:**
- Extend constants.ts preset system
- Add preset CRUD operations to localStorage
- Create PresetManager UI component
- Implement URL state serialization for sharing

---

#### 8. Dark Mode
**Priority: Low**
- Theme toggle in header
- Dark mode optimized for professional audience
- Persist theme preference
- Adjust charts for dark backgrounds

**Technical Approach:**
- Add theme context/state
- Create dark mode color palette in index.css
- Update Tailwind config with dark mode classes
- Modify Recharts color schemes dynamically

---

#### 9. Print-Friendly View
**Priority: Low**
- CSS optimizations for printing reports
- Hide interactive elements (sliders, buttons)
- Page break logic for multi-page reports
- Include timestamp and assumptions footer

**Technical Approach:**
- Enhance `@media print` rules in index.css
- Add print-specific layout component
- Generate PDF option using html2canvas + jsPDF
- Create "Print Report" button

---

## 🔧 Technical Debt & Improvements

### Code Quality
- [x] Add comprehensive unit tests for calculations.ts
- [x] Add integration tests for UI components
- [x] Implement error boundary for graceful error handling
- [ ] Add loading states for async operations (if added)
- [ ] Improve accessibility (ARIA labels, keyboard navigation)

### Performance
- [x] Optimize chart re-renders with React.memo
- [ ] Implement virtualization for long lists (if added)
- [ ] Add service worker for offline capability
- [ ] Optimize bundle size (code splitting)

### Documentation
- [x] Add inline JSDoc comments to calculation functions
- [x] Create user guide/help modal
- [ ] Add video tutorial or interactive walkthrough
- [ ] Document assumptions and formulas in UI

---

## 📈 Metrics & Success Criteria

### Phase 1 Success Metrics
- Users create and compare 3+ scenarios per session
- Break-even feature used in 60%+ of sessions
- Average session time increases by 25%

### Phase 2 Success Metrics
- Excel export used by 40%+ of users
- Confidence interval feature adoption: 30%+
- User-reported improved decision confidence

### Phase 3 Success Metrics
- Custom preset creation: 20%+ of users
- Dark mode adoption: 50%+ of evening users
- Print/PDF export: 35%+ of completed analyses

---

## 🚀 Release Strategy

**v1.1** ✅ (January 2026)
- ✅ What-If Scenarios with comparison view
- ✅ Break-even Analysis with ROI curve visualization
- ✅ Sensitivity Analysis with tornado chart
- ✅ Visual UI hierarchy (grey inputs, white results)
- ✅ Streamlined 2-section input layout (Value & Scope + Cost Model)
- ✅ "Success Rate" renamed to "Realization Rate"
- ✅ Input validation improvements
- ✅ Unit tests (30+ test cases)
- ✅ Error boundary implementation
- ✅ WCAG 2.1 AA accessibility
- ✅ Performance optimizations (React.memo)

**v1.2** (Q2 2026)
- Self-Hosted Model Pricing Support
- Confidence Intervals
- Export to Excel
- Preset Customization

**v1.3** (Q1 2026)
- Dark Mode
- Print-Friendly View
- User Guide & Tooltips

**v2.0** (Q2 2025)
- Backend integration (user accounts, saved analyses)
- Team collaboration features
- Advanced reporting & dashboards
- API for programmatic access

---

## 💡 Ideas for Consideration

### Long-term Vision
- **AI Cost Optimizer**: Suggest optimal model routing strategies
- **Benchmarking**: Compare against industry averages
- **ROI Tracking**: Actual vs. projected ROI monitoring
- **Integration Hub**: Connect to cloud billing APIs for real-time cost data
- **Mobile App**: Native iOS/Android for on-the-go analysis
- **Collaborative Workspaces**: Multi-user editing and commenting
- **Template Library**: Industry-specific calculator templates
- **Audit Trail**: Track changes to calculations for compliance

### Community Features
- Public preset marketplace
- User-submitted value method templates
- Discussion forum for ROI strategies
- Case study repository

---

## 📝 Contributing

To suggest new features or report issues:
1. Open an issue on GitHub
2. Use labels: `enhancement`, `bug`, `documentation`
3. Provide use cases and expected behavior
4. Include mockups for UI changes (if applicable)

---

## 🎯 Current Status
**Latest Release:** v1.1 with Phase 1 Complete (January 2026)
**Next Focus:** Phase 2 - Advanced Projections (Q2 2026)

---

*Last Updated: January 1, 2026*
