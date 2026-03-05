# AI ROI Calculator - User Acceptance Testing (UAT) Scenarios

**Version:** 1.1 (Phase 1 Complete)
**Date:** January 1, 2025
**Tester:** ________________
**Environment:** Production / Staging (circle one)

---

## Testing Instructions

- Complete each scenario in order
- Mark each test as: **✅ Pass** | **❌ Fail** | **⚠️ Partial**
- Note any bugs or issues in the "Notes" column
- Take screenshots for visual bugs
- Report critical issues immediately

---

## Scenario 1: Basic Calculator Functionality

### Test 1.1: Load Default Inputs
**Objective:** Verify calculator loads with sensible defaults

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Open calculator URL | Page loads without errors |✅ Pass |a bit slow to load |
| 2 | Check left column | Default inputs visible (Customer Support use case) |✅ Pass | |
| 3 | Check right column | ROI metrics displayed (ROI %, Net Benefit, etc.) |✅ Pass | |
| 4 | Check charts | 2 charts visible (Cost vs Value, Cost Breakdown pie) |✅ Pass | |

**Acceptance Criteria:**
✅ All inputs have values
✅ All KPI cards show numbers
✅ Charts render correctly
✅ No console errors

---

### Test 1.2: Change Monthly Volume
**Objective:** Verify volume changes update results

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Note initial ROI % | Record baseline (e.g., 150%) |✅ | |
| 2 | Change "Monthly Volume" from 1000 to 5000 | Input accepts change |✅ | |
| 3 | Check ROI % | ROI should increase (more volume = better ROI) |✅ | |
| 4 | Check "Break-even" KPI card | Break-even volume stays constant |✅ | |
| 5 | Check "Net Benefit" | Should increase proportionally |✅ | |



**Acceptance Criteria:**
✅ Volume changes are reflected immediately
✅ Break-even volume is FIXED (doesn't change with volume)
✅ Charts update automatically

**Testers feedback:** 

1.Break-even card: better show a graph showing the profit aover time , a ROI curve

2.The cards on the right and financial overview, you need to explain: are those results after 12 months? You need to explain each card.

3.when i change something in the "Analysis Month", nothing changes, it is normal?





---

### Test 1.3: Change Realization Rate
**Objective:** Verify realization rate impacts value

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Note initial "Total Monthly Value" in table | Record baseline |✅| |
| 2 | Change "Realization Rate" from 90% to 70% | Input accepts change |✅| |
| 3 | Check "Total Monthly Value" | Should decrease (~22% drop) |❌ |What is Total Monthly value?|
| 4 | Check ROI % | Should decrease |✅  | |

**Acceptance Criteria:**
✅ Lower realization rate = lower value = lower ROI
✅ Input validation prevents > 100% or < 0%

**Testers feedback:** 

1. When i try to change the number in the cell, it keeps a leading zero on the left, no big deal but does not look fine, even if it does not impact the calculation: example: 060


---

## Scenario 2: Preset Functionality

### Test 2.1: Load Preset
**Objective:** Test example profile loading

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Click "Customer Support" preset button | Inputs populate with preset values |✅ | |
| 2 | Click "Chatbot" preset | All inputs change to chatbot values |✅ | |
| 3 | Check Value Method dropdown | Should show "Cost Displacement" for Support, check for Chatbot |✅ | |
| 4 | Check ROI results | Different ROI for each preset |✅ | |

**Acceptance Criteria:**
✅ All presets load without errors
✅ Each preset has unique input values
✅ Results update immediately


**Testers feedback:** 
1.Customer Support bot scenario: 
- The fixed amount looks too big in the calcculation
- put set the default monthly volume to 500

2. what are the preset assumption for input tokens and output tokens based on? For the e-ccommerce reco, i find it quite low
3. What is ABS Uplift in the value ddefintion layer? Explain what is it. I understood but i would liked to see an zxplanation
4. You need 2 more pre-sets to illustrate the retention uplift scenario, and the premium monetization scenario.
---

### Test 2.2: Reset to Defaults
**Objective:** Test refresh button

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Load "Sales Assistant" preset | Inputs change |❌ |There is no Sales Assistant preset |
| 2 | Manually change "Monthly Volume" to 99999 | Input updates |✅ | |
| 3 | Click refresh/reset icon (circular arrow) | All inputs return to DEFAULT (Customer Support) |✅ | |

**Acceptance Criteria:**
✅ Reset button clears custom changes
✅ Returns to default preset (not last preset)

**Testers feedback:**

Make a subtle chartreuse accent for the refresh button, because i had to go look for it in the page, i did not see at first
---

## Scenario 3: Advanced Mode

### Test 3.1: Toggle Advanced Mode
**Objective:** Verify advanced features appear/disappear

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Ensure in "Simple" mode | Only basic inputs visible |✅ | |
| 2 | Count input fields in Layer 1 | Should see: Token counts, pricing (4-6 fields) |✅ | |
| 3 | Click "Advanced" button in header | Mode switches |✅ | |
| 4 | Check Layer 1 | "Model Routing Strategy" slider appears |✅ | |
| 5 | Check Layer 2 | Extended harness costs appear (Tool APIs, Logging, etc.) |✅ | |
| 6 | Check Layer 1 again | "Cache Hit Rate" and "Cache Discount" fields visible |✅ | |

**Acceptance Criteria:**
✅ Simple mode hides advanced inputs
✅ Advanced mode shows routing, cache, extended harness costs
✅ Toggling preserves entered values

---

### Test 3.2: Model Routing Slider
**Objective:** Test routing logic and secondary model appearance

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Switch to Advanced mode | Routing slider visible |✅ | |
| 2 | Note routing slider at 100% | Only "Primary Model" section visible |✅ | |
| 3 | Move slider to 70% | "Secondary Model (Complex)" section appears below |✅ | |
| 4 | Note label shows "70%" | Percentage updates next to "Simple Model" |❌ |nothing shows up next to simple model |
| 5 | Enter different token counts in Secondary Model | Input accepts values |✅ | |
| 6 | Check "Unit Cost" KPI | Cost should reflect 70% primary + 30% secondary blend |✅ | |
| 7 | Move slider to 0% | All traffic to secondary (most expensive) |⚠️ |perhaps, i have no way to know |
| 8 | Check "Unit Cost" | Cost should be highest ||✅ | |

**Acceptance Criteria:**
✅ Slider at 100% = only Primary Model visible
✅ Slider < 100% = Secondary Model section appears
✅ Cost blends correctly: (Primary × %) + (Secondary × (1-%))
✅ Slider shows live percentage update

---

## Scenario 4: Value Methods

### Test 4.1: Cost Displacement Method
**Objective:** Verify cost displacement calculations

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Select "Cost Displacement" in Value Method dropdown | Displacement fields appear | | |
| 2 | Enter: Baseline Human Cost = $5.00 | Accepts input | | |
| 3 | Enter: Deflection Rate = 50% | Accepts input | | |
| 4 | Enter: Residual Review Rate = 10% | "Review Cost" field appears | | |
| 5 | Enter: Review Cost = $0.50 | Accepts input | | |
| 6 | Check "Value per Unit" in table | Should be ~$2.25 per unit (with realization rate applied) | | |

**Formula Check:** (5.00 × 0.5) - (0.50 × 0.1) = $2.45 × realization rate

**Acceptance Criteria:**
✅ Deflection rate increases value
✅ Residual review reduces value
✅ Math matches formula

---

### Test 4.2: Revenue Uplift Method
**Objective:** Test conversion uplift calculations

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Select "Revenue Uplift" | Revenue fields appear | | |
| 2 | Enter: Baseline Conversion = 2% | | | |
| 3 | Enter: Absolute Uplift = 0.5% (0.5 percentage points) | | | |
| 4 | Enter: Average Order Value = $100 | | | |
| 5 | Enter: Gross Margin = 30% | | | |
| 6 | Check value calculation | Delta revenue × margin × realization rate | | |

**Formula Check:** ($100 × 0.005) × 0.30 = $0.15 value per unit (before realization rate)

**Acceptance Criteria:**
✅ Uplift is ABSOLUTE (not relative percentage)
✅ Margin applied correctly
✅ AOV multiplies conversion delta

---

## Scenario 5: Sensitivity Simulator

### Test 5.1: Volume Sensitivity
**Objective:** Test sensitivity sliders functionality

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Scroll to bottom of right column | Find "Sensitivity Simulator" (dark gray box) | | |
| 2 | Note current ROI % | Record baseline (e.g., 150%) | | |
| 3 | Move "Volume" slider to 2.0x | Slider shows "x2.0" | | |
| 4 | Check ROI % | Should increase (more volume = better economics) | | |
| 5 | Check "Monthly Volume" input in left column | Should NOT change (still original value) | | |
| 6 | Check "Effective Monthly Volume" in table | Should show 2x original | | |

**Acceptance Criteria:**
✅ Sensitivity sliders do NOT modify base inputs
✅ Results update live as slider moves
✅ "Effective Volume" in table reflects multiplier
✅ Base inputs remain unchanged

---

### Test 5.2: Cost Multiplier
**Objective:** Test cost sensitivity

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Reset sensitivity (click "Reset Simulation") | All sliders return to 1x | | |
| 2 | Move "Cost Factors" slider to 1.5x | Slider shows "x1.5" | | |
| 3 | Check "Total Cost/Mo" | Should increase by 50% | | |
| 4 | Check ROI % | Should decrease (higher cost = lower ROI) | | |

**Acceptance Criteria:**
✅ Cost multiplier affects all Layer 1+2 costs
✅ ROI decreases when costs increase
✅ Reset button works

---

## Scenario 6: Break-even Analysis

### Test 6.1: Below Break-even Scenario
**Objective:** Test break-even calculation when unprofitable

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Load "Customer Support" preset | | | |
| 2 | Change Monthly Volume to 500 (low volume) | | | |
| 3 | Check "Net Benefit" KPI | Should be NEGATIVE | | |
| 4 | Check "Break-even" KPI card | Shows a specific volume (e.g., 2,500 units/mo) | | |
| 5 | Note amber warning card appears | Shows "You need X more units..." | | |
| 6 | Check warning message | Shows units needed AND percentage increase | | |
| 7 | Change volume to 1000 | Break-even volume STAYS THE SAME | | |

**Acceptance Criteria:**
✅ Break-even volume is FIXED (doesn't change with current volume)
✅ Warning card shows units gap and % increase
✅ Amber card only shows when below break-even

---

### Test 6.2: Above Break-even Scenario
**Objective:** Verify green success card when profitable

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Increase Monthly Volume to 10,000 | | | |
| 2 | Check "Net Benefit" | Should be POSITIVE | | |
| 3 | Check for amber warning card | Should NOT appear | | |
| 4 | Check for green success card | Should appear: "Above Break-even" | | |
| 5 | Read green card message | Shows current volume and break-even threshold | | |

**Acceptance Criteria:**
✅ Green card only shows when profitable
✅ Shows both current volume and break-even threshold
✅ Amber card disappears when profitable

---

## Scenario 7: Scenario Manager (Phase 1)

### Test 7.1: Save Scenario
**Objective:** Save current calculation as scenario

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Click folder icon in header | Scenario Manager modal opens | | |
| 2 | Check "Save Current Scenario" section | Shows current use case name and ROI | | |
| 3 | Enter Scenario Name: "Conservative Estimate" | Input accepts text | | |
| 4 | Enter Description: "Lower realization rate assumptions" | Optional field | | |
| 5 | Click "Save Scenario" button | Success feedback | | |
| 6 | Check "Saved Scenarios" list | New scenario appears with name, ROI, date | | |
| 7 | Check folder icon badge | Shows "1" (scenario count) | | |

**Acceptance Criteria:**
✅ Scenario saves with all inputs and results
✅ Badge count updates
✅ Timestamp displays correctly

---

### Test 7.2: Load Scenario
**Objective:** Restore saved scenario inputs

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Change Monthly Volume to 999999 | Inputs modified | | |
| 2 | Open Scenario Manager | Modal opens | | |
| 3 | Click "Load" on saved "Conservative Estimate" | | | |
| 4 | Check modal closes | Returns to main view | | |
| 5 | Check Monthly Volume | Restored to saved value | | |
| 6 | Check all other inputs | Match saved scenario | | |

**Acceptance Criteria:**
✅ All inputs restored exactly
✅ Modal closes after load
✅ Results recalculate immediately

---

### Test 7.3: Compare Scenarios
**Objective:** Side-by-side comparison

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Create 3 scenarios with different volumes (1K, 5K, 10K) | All saved | | |
| 2 | Open Scenario Manager | | | |
| 3 | Select 2 scenarios (checkboxes) | Checkboxes highlight | | |
| 4 | Click "Compare Selected" button | Comparison modal opens | | |
| 5 | Check bar chart | Shows all 3 metrics (Net Benefit, Cost, Value) for both scenarios | | |
| 6 | Check Results table | Shows percentage differences vs first scenario | | |
| 7 | Check TrendingUp/Down icons | Green up arrows for increases, red down for decreases | | |

**Acceptance Criteria:**
✅ Can select 2+ scenarios
✅ Comparison chart shows all scenarios
✅ Percentage differences calculated correctly
✅ Color-coded scenarios visible

---

### Test 7.4: Export/Import Scenarios
**Objective:** JSON export and re-import

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Open Scenario Manager | | | |
| 2 | Click "Export All" button | JSON file downloads | | |
| 3 | Check filename | Format: ai-roi-scenarios-YYYY-MM-DD.json | | |
| 4 | Delete all scenarios (click trash icons) | All scenarios removed | | |
| 5 | Click "Import" button, select exported file | File upload dialog | | |
| 6 | Check scenarios list | All scenarios restored | | |

**Acceptance Criteria:**
✅ Export includes all scenarios
✅ File is valid JSON
✅ Import restores all data correctly

---

## Scenario 8: UI/UX & Accessibility

### Test 8.1: Logo and Branding
**Objective:** Verify logo displays correctly

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Check top-left header | Logo visible and sized appropriately (not too large) | | |
| 2 | Check if logo overlaps title | No overlap with "AI ROI Calculator" center title | | |
| 3 | Check logo quality | Not pixelated or distorted | | |

**Acceptance Criteria:**
✅ Logo loads successfully
✅ Sized to fit header (max 180px width, 40px height)
✅ No layout issues

---

### Test 8.2: Help Guide
**Objective:** Verify help modal functionality

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Click help icon (?) in header | Help modal opens | | |
| 2 | Scroll through guide | All sections visible (6 sections) | | |
| 3 | Find "API-based pricing" warning | Amber box in Infrastructure section | | |
| 4 | Find "Analysis Months" explanation | In Value & Scope section | | |
| 5 | Find "Model Routing Strategy" | In Advanced Features section (Section 6) | | |
| 6 | Find "Sensitivity Simulator" | Dark gray box in Advanced Features | | |
| 7 | Click X or outside modal | Modal closes | | |

**Acceptance Criteria:**
✅ Help guide opens smoothly
✅ All new sections present
✅ Scrollable content
✅ Close button works

---

### Test 8.3: Keyboard Navigation
**Objective:** Test accessibility for keyboard users

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Press Tab repeatedly | Focus moves through inputs logically | | |
| 2 | Press Tab to Simple/Advanced toggle | Can focus on buttons | | |
| 3 | Press Space or Enter on Simple button | Switches mode | | |
| 4 | Tab to folder icon | Can focus | | |
| 5 | Press Enter on folder icon | Scenario Manager opens | | |
| 6 | Press Esc | Modal closes | | |

**Acceptance Criteria:**
✅ All interactive elements keyboard-accessible
✅ Logical tab order
✅ Esc closes modals

---

## Scenario 9: Data Validation

### Test 9.1: Negative Number Prevention
**Objective:** Ensure inputs don't accept invalid values

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Try entering -100 in Monthly Volume | Input prevents or resets to 0 | | |
| 2 | Try entering -50 in Realization Rate | Prevented or reset | | |
| 3 | Try entering 150 in Realization Rate (> 100%) | Capped at 100% | | |
| 4 | Try entering "abc" in Monthly Volume | Ignored or cleared | | |

**Acceptance Criteria:**
✅ No negative numbers accepted
✅ Percentages capped at 0-100%
✅ Non-numeric input rejected

---

## Scenario 10: Export Functionality

### Test 10.1: Download JSON
**Objective:** Export current calculation

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Fill in custom inputs | | | |
| 2 | Click download icon in header | JSON file downloads | | |
| 3 | Check filename | Format: roi-calculator-[use-case-name].json | | |
| 4 | Open file in text editor | Valid JSON with inputs and results | | |

**Acceptance Criteria:**
✅ JSON is valid format
✅ Contains both inputs and results
✅ Filename reflects use case

---

### Test 10.2: Copy Markdown Summary
**Objective:** Copy formatted summary

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Click copy icon in header | "Summary copied" alert appears | | |
| 2 | Paste into text editor | Markdown-formatted summary | | |
| 3 | Check content | Includes ROI %, payback, costs, volume | | |

**Acceptance Criteria:**
✅ Markdown format correct
✅ All key metrics included
✅ Copy works in all browsers

---

## Scenario 11: Responsive Design

### Test 11.1: Mobile View
**Objective:** Test on mobile devices

| Step | Action | Expected Result | Status | Notes |
|------|--------|----------------|---------|-------|
| 1 | Open on mobile or resize to 375px width | Layout adjusts | | |
| 2 | Check input column | Stacks vertically | | |
| 3 | Check results column | Stacks below inputs | | |
| 4 | Check KPI cards | Grid adjusts (2 columns on mobile) | | |
| 5 | Open modals | Full screen on mobile | | |

**Acceptance Criteria:**
✅ No horizontal scroll
✅ All text readable
✅ Buttons tappable (not too small)

---

## Critical Bugs (Must Fix Before Release)

| # | Bug Description | Severity | Assigned To | Status |
|---|----------------|----------|-------------|---------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Enhancement Requests (Post-Release)

| # | Request | Priority | Notes |
|---|---------|----------|-------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Sign-off

**Tester Name:** ________________
**Date Completed:** ________________
**Overall Status:** ✅ Pass | ❌ Fail | ⚠️ Pass with Issues

**Recommended Action:**
- [ ] Deploy to Production
- [ ] Fix critical bugs first
- [ ] Requires additional testing

**Comments:**
______________________________________________________________________
______________________________________________________________________
______________________________________________________________________
