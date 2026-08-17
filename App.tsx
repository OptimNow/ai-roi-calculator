import React, { Suspense, lazy, useState, useMemo, useEffect, useRef } from 'react';
import { Download, Copy, Check, RefreshCw, Settings, HelpCircle, FolderOpen, Info, BookOpen, X } from 'lucide-react';

import { UseCaseInputs, CalculationResults, ValueMethod, SensitivityModifiers, ModelParams, Scenario } from './types';
import { DEFAULT_INPUTS, PRESETS } from './constants';
import { calculateROI } from './utils/calculations';
import { MoneyInput, NumberInput, PercentInput, SectionHeader } from './components/InputComponents';
import { CatalogStatus, ModelCostInputs, useModelCatalog } from './components/ModelPicker';
import { catalogModelToParams, repriceModels, toModelId, PRICING_HUB_URL } from './utils/modelCatalog';
import { applyDeepLink, hasDeepLink, parseDeepLink, presetLabel } from './utils/deepLink';
import { SCENARIO_SCHEMA_VERSION, parseScenarioList } from './utils/scenario';
import { formatCount, formatUsd, pluralize } from './utils/format';
import { CostValueChart, CostBreakdownChart, ROICurveChart, TornadoChart } from './components/Charts';

// The three modals are code-split: together they are ~74 kB of the bundle, and most
// visitors never open any of them. Charts stay eagerly loaded — they sit in the results
// column and are visible on arrival, so deferring them would trade bundle size for a
// layout shift. Named exports, hence the .then() unwrap.
const HelpGuide = lazy(() => import('./components/HelpGuide').then(m => ({ default: m.HelpGuide })));
const ScenarioManager = lazy(() => import('./components/ScenarioManager').then(m => ({ default: m.ScenarioManager })));
const ScenarioComparison = lazy(() => import('./components/ScenarioComparison').then(m => ({ default: m.ScenarioComparison })));

// Both were local re-implementations of the shared helpers, rebuilding an
// Intl.NumberFormat on every one of their ~50 calls per render. Kept as aliases so
// the call sites read the same.
const formatMoney = formatUsd;
const formatNumber = formatCount;

const SCENARIOS_STORAGE_KEY = 'ai-roi-calculator-scenarios';

const COST_BREAKDOWN_COLORS = ['#3b82f6', '#8b5cf6', '#64748b'];

export default function App() {
  // Scenario handed over from the OptimToken, read once per mount
  const deepLink = useMemo(
    () => parseDeepLink(typeof window !== 'undefined' ? window.location.search : ''),
    []
  );
  const [inputs, setInputs] = useState<UseCaseInputs>(() =>
    applyDeepLink({ ...DEFAULT_INPUTS, ...PRESETS.support } as UseCaseInputs, deepLink)
  );
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showScenarios, setShowScenarios] = useState<boolean>(false);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<string[]>([]);
  const [modifiers, setModifiers] = useState<SensitivityModifiers>({
    volumeMultiplier: 1,
    successRateMultiplier: 1,
    costMultiplier: 1,
    valueMultiplier: 1
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    valueScope: true,
    costModel: true,
  });
  const [copied, setCopied] = useState(false);
  const [harnessPer1k, setHarnessPer1k] = useState(true);
  const { catalog, loading: catalogLoading, settled: catalogSettled, refresh: refreshCatalog } = useModelCatalog();
  const [deepLinkModelName, setDeepLinkModelName] = useState<string | undefined>(undefined);
  const [showDeepLinkBanner, setShowDeepLinkBanner] = useState(hasDeepLink(deepLink));
  const deepLinkModelApplied = useRef(false);

  // Load scenarios from localStorage on mount.
  // Whatever is in storage is untrusted — an older schema, or a bad import that a
  // previous version persisted before crashing on it. Anything unrenderable is
  // dropped here so it cannot poison every subsequent load.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCENARIOS_STORAGE_KEY);
      if (saved) {
        const { scenarios: valid, rejected } = parseScenarioList(JSON.parse(saved));
        if (rejected > 0) {
          console.warn(`Discarded ${rejected} unreadable scenario(s) from localStorage.`);
        }
        setScenarios(valid);
      }
    } catch (error) {
      console.error('Failed to load scenarios from localStorage:', error);
    }
  }, []);

  // Save scenarios to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
    } catch (error) {
      console.error('Failed to save scenarios to localStorage:', error);
    }
  }, [scenarios]);

  // Keep the form's model prices in sync with the OptimToken catalog.
  // Runs when the catalog resolves on mount and when the user hits refresh.
  // Custom-priced models are never touched; a scenario loaded from storage keeps its
  // recorded prices, since loading it does not change the catalog.
  //
  // A deep-linked model is resolved here too: the embedded snapshot only carries the
  // top models, so one picked from the hub's full catalog may not exist until the
  // live fetch lands. Retried on each catalog change until it resolves, then left alone.
  useEffect(() => {
    const pendingModel = !deepLinkModelApplied.current && deepLink.modelId
      ? catalog.models.find(m => toModelId(m) === deepLink.modelId)
      : undefined;

    if (pendingModel) {
      deepLinkModelApplied.current = true;
      setDeepLinkModelName(pendingModel.model);
    }

    setInputs(prev => {
      const repriced = repriceModels(prev, catalog);
      if (!pendingModel) return repriced;
      return {
        ...repriced,
        primaryModel: { ...repriced.primaryModel, ...catalogModelToParams(pendingModel, catalog.pricedAt) },
      };
    });
  }, [catalog, deepLink.modelId]);

  // Funnel measurement: how many people arrive from the hub with a scenario in hand
  useEffect(() => {
    if (!hasDeepLink(deepLink)) return;
    (window as any).trackEvent?.('deeplink_loaded', {
      source: 'aipricinghub',
      use_case: deepLink.presetKey ?? 'none',
      model_id: deepLink.modelId ?? 'none',
      volume: deepLink.monthlyVolume ?? 0,
    });
  }, [deepLink]);

  const deepLinkSummary = [
    deepLinkModelName,
    presetLabel(deepLink.presetKey),
    deepLink.monthlyVolume ? `${formatNumber(deepLink.monthlyVolume)} ${pluralize(inputs.unitName)}/mo` : undefined,
  ].filter(Boolean).join(' · ');

  // Harness costs are stored per unit, but vendors quote per 1,000 calls. This is a
  // display preference only — it scales what the inputs show, never what is stored.
  const harnessScale = harnessPer1k ? 1000 : 1;
  const harnessPrecision = harnessPer1k ? 2 : 4;
  const harnessValue = (perUnit: number) => Math.round(perUnit * harnessScale * 1e6) / 1e6;
  const updateHarness = (field: keyof UseCaseInputs, displayed: number) =>
    updateInput(field, Math.round((displayed / harnessScale) * 1e9) / 1e9);

  const harnessSubtotal =
    inputs.orchestrationCostPerUnit +
    inputs.retrievalCostPerUnit +
    inputs.toolApiCostPerUnit +
    inputs.loggingMonitoringCostPerUnit +
    inputs.safetyGuardrailsCostPerUnit +
    inputs.networkEgressCostPerUnit +
    inputs.storageCostPerUnit;

  // What Simple mode does not show but still charges, so the subtotal is never a surprise
  const harnessHiddenCost =
    inputs.toolApiCostPerUnit +
    inputs.loggingMonitoringCostPerUnit +
    inputs.safetyGuardrailsCostPerUnit +
    inputs.networkEgressCostPerUnit +
    inputs.storageCostPerUnit;

  const toggleSection = (key: string) => setExpandedSections(prev => ({...prev, [key]: !prev[key]}));

  const results = useMemo(() => calculateROI(inputs, modifiers), [inputs, modifiers]);

  const grossBeforeRealization = useMemo(() => {
    const effectiveRate = Math.min(100, inputs.successRate * modifiers.successRateMultiplier) / 100;
    if (effectiveRate <= 0) return 0;
    return results.grossValuePerUnit / effectiveRate;
  }, [results.grossValuePerUnit, inputs.successRate, modifiers.successRateMultiplier]);

  const effectiveRealizationRate = Math.min(100, Math.max(0, inputs.successRate * modifiers.successRateMultiplier));

  /**
   * Explanations written against the user's own figures, because the abstract
   * definitions are what confuse people: "break-even" is a volume, "payback" is
   * a duration, and both are described as reaching zero. Naming the two accounts
   * — this month's, and the cumulative one — is what makes them separable.
   */
  const unit = inputs.unitName;
  const setupPerUnit = results.monthlyAmortizedFixedCost / (results.effectiveMonthlyVolume || 1);
  const harnessPerUnit = results.layer2CostPerUnit - results.layer1CostPerUnit;
  const tooltips = {
    roi:
      `Your monthly account: ${formatMoney(results.totalMonthlyValue, 0)} of value against ` +
      `${formatMoney(results.totalMonthlyCost, 0)} of cost — running costs plus a monthly slice of the setup. ` +
      `This is a monthly figure; it does not grow with the analysis horizon.`,
    netBenefit:
      `What the monthly account leaves you: ${formatMoney(results.totalMonthlyValue, 0)} of value minus ` +
      `${formatMoney(results.totalMonthlyCost, 0)} of cost. The setup counts here as a monthly slice ` +
      `(${formatMoney(results.monthlyAmortizedFixedCost, 0)}), not as the full ${formatMoney(results.totalFixedCost, 0)}.`,
    payback:
      `How long to earn back the one-time setup. You pay ${formatMoney(results.totalFixedCost, 0)} once; the project ` +
      `returns ${formatMoney(results.monthlyCashNetBenefit, 0)} of cash a month — the setup slice is not subtracted ` +
      `here, it is already paid. More volume repays faster. Different question from Break-even volume, which asks ` +
      `how big you must be, not how long you must wait.`,
    unitCost:
      `All-in cost of one ${unit}: ${formatMoney(results.layer1CostPerUnit, 4)} model inference + ` +
      `${formatMoney(harnessPerUnit, 4)} harness + ${formatMoney(setupPerUnit, 4)} share of the setup.`,
    breakEvenVolume:
      `How many ${pluralize(unit)} a month you need for the monthly account to balance — value covering running costs plus ` +
      `the monthly setup slice. Below it you lose money every month, above it you gain. It does not move when your ` +
      `volume changes: it is a property of your unit economics, not of your size. Different question from Payback, ` +
      `which asks when the setup is repaid.`,
  };

  const updateInput = (field: keyof UseCaseInputs, value: any) => {
    setInputs(prev => {
      const nextInputs = { ...prev, [field]: value };

      // Keep Premium Monetization value driver aligned with monthly subscriber volume.
      // In this scenario, Monthly Volume represents active subscribers per month.
      if (nextInputs.valueMethod === ValueMethod.PREMIUM_MONETIZATION) {
        if (field === 'valueMethod') {
          nextInputs.subscribers = nextInputs.monthlyVolume;
        }
        if (field === 'monthlyVolume') {
          nextInputs.subscribers = Number(value) || 0;
        }
        if (field === 'subscribers') {
          nextInputs.monthlyVolume = Number(value) || 0;
        }
      }

      return nextInputs;
    });
  };

  const updateModelParam = (model: 'primaryModel' | 'secondaryModel', field: keyof ModelParams, value: any) => {
    setInputs(prev => ({
      ...prev,
      [model]: { ...prev[model], [field]: value }
    }));
  };

  // Bulk patch used by the model picker (fills prices + identity in one shot)
  const patchModelParams = (model: 'primaryModel' | 'secondaryModel', patch: Partial<ModelParams>) => {
    setInputs(prev => ({
      ...prev,
      [model]: { ...prev[model], ...patch }
    }));
  };

  // Manual price edits detach the field values from the selected catalog model,
  // so a scenario never claims "Claude Haiku 4.5" pricing it no longer uses.
  const updateModelPrice = (model: 'primaryModel' | 'secondaryModel', field: 'pricePer1MInputTokens' | 'pricePer1MOutputTokens', value: number) => {
    setInputs(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        [field]: value,
        modelId: undefined,
        modelName: undefined,
        provider: undefined,
        pricedAt: undefined,
        cachedInputPricePer1M: undefined,
        batchInputPricePer1M: undefined,
        batchOutputPricePer1M: undefined,
      }
    }));
  };

  // Switching to a flat per-call rate detaches the catalog identity: the catalog is
  // token-priced, so its $/1M rates and cache/batch discounts no longer describe the cost.
  const setBillingBasis = (model: 'primaryModel' | 'secondaryModel', useCallPricing: boolean) => {
    setInputs(prev => ({
      ...prev,
      [model]: {
        ...prev[model],
        useCallPricing,
        ...(useCallPricing
          ? {
              modelId: undefined,
              modelName: undefined,
              provider: undefined,
              pricedAt: undefined,
              cachedInputPricePer1M: undefined,
              batchInputPricePer1M: undefined,
              batchOutputPricePer1M: undefined,
            }
          : {}),
      },
    }));
  };

  const loadPreset = (key: string) => {
    (window as any).trackEvent?.('preset_loaded', { preset_key: key });
    if (PRESETS[key]) {
      // Merge over defaults (not previous state) so nothing lingers from the last preset
      const nextInputs = { ...DEFAULT_INPUTS, ...PRESETS[key] } as UseCaseInputs;
      if (nextInputs.valueMethod === ValueMethod.PREMIUM_MONETIZATION) {
        nextInputs.subscribers = nextInputs.monthlyVolume;
      }
      // Presets carry embedded-snapshot prices; lift them to the current catalog
      setInputs(repriceModels(nextInputs, catalog));
    }
  };

  const handleExportJSON = () => {
    (window as any).trackEvent?.('results_exported', {
      format: 'json',
      use_case: inputs.useCaseName
    });
    const dataStr = JSON.stringify({ inputs, results }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roi-calculator-${inputs.useCaseName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
  };

  const handleCopyMarkdown = async () => {
    (window as any).trackEvent?.('results_exported', {
      format: 'markdown',
      use_case: inputs.useCaseName
    });
    const paybackAsNumber = Number(results.paybackMonths);
    const paybackDisplay = Number.isFinite(paybackAsNumber)
      ? `${paybackAsNumber} months`
      : results.paybackMonths;

    const md = `
# AI ROI Analysis: ${inputs.useCaseName}

## Summary
- **Monthly Net Benefit**: ${formatMoney(results.netMonthlyBenefit, 0)}
- **ROI**: ${results.roiPercentage.toFixed(1)}%
- **Payback Period**: ${paybackDisplay}
- **Cost per Unit**: ${formatMoney(results.totalCostPerUnit, 4)}
- **Value per Unit**: ${formatMoney(results.grossValuePerUnit, 4)}

## Inputs
- Volume: ${formatNumber(inputs.monthlyVolume)} ${pluralize(inputs.unitName)}/mo
- Realization Rate: ${inputs.successRate}%
- Primary Model: ${inputs.primaryModel.modelName ? `${inputs.primaryModel.modelName} (${inputs.primaryModel.provider}, prices via OptimToken)` : 'Custom pricing'}
- Model: Simple/Complex split ${inputs.routingSimplePercent}% / ${100 - inputs.routingSimplePercent}%
    `.trim();
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS or permission-denied contexts
      const textarea = document.createElement('textarea');
      textarea.value = md;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Scenario Management Handlers
  const handleSaveScenario = (name: string, description?: string) => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      inputs: { ...inputs },
      results: { ...results },
      createdAt: Date.now(),
      schemaVersion: SCENARIO_SCHEMA_VERSION,
      color: `hsl(${(scenarios.length * 137.5) % 360}, 70%, 50%)` // Golden angle for color distribution
    };
    setScenarios([...scenarios, newScenario]);
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setInputs({ ...scenario.inputs });
    setShowScenarios(false);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    setScenarios(scenarios.filter(s => s.id !== scenarioId));
    setSelectedScenarioIds(selectedScenarioIds.filter(id => id !== scenarioId));
  };

  const handleExportScenarios = () => {
    const dataStr = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-roi-scenarios-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportScenarios = (importedScenarios: Scenario[], rejected: number) => {
    setScenarios([...scenarios, ...importedScenarios]);
    alert(
      rejected > 0
        ? `Imported ${importedScenarios.length} scenario(s). Skipped ${rejected} entr${rejected === 1 ? 'y' : 'ies'} that were not readable scenarios.`
        : `Imported ${importedScenarios.length} scenario(s) successfully!`
    );
  };

  const handleCompareScenarios = (scenarioIds: string[]) => {
    if (scenarioIds.length < 2) {
      alert('Please select at least 2 scenarios to compare.');
      return;
    }
    setSelectedScenarioIds(scenarioIds);
    setShowComparison(true);
    setShowScenarios(false);
  };

  const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id));

  // --- Charts Data Preparation ---
  // Memoized so the chart components' props keep a stable identity between renders.
  // Rebuilt inline, they were new arrays on every keystroke, which defeated React.memo's
  // default shallow compare — the charts papered over that with JSON.stringify comparators,
  // paying an O(n) double-serialize per keystroke to reach the same answer a reference
  // check gives for free.
  const chartDataMonthly = useMemo(() => [
    { name: 'Cost', value: results.totalMonthlyCost, fill: '#ef4444' },
    { name: 'Value', value: results.totalMonthlyValue, fill: '#22c55e' },
  ], [results.totalMonthlyCost, results.totalMonthlyValue]);

  const pieDataCost = useMemo(() => [
    { name: 'Model (L1)', value: results.layer1MonthlyCost },
    { name: 'Harness (L2)', value: results.layer2MonthlyCost - results.layer1MonthlyCost },
    { name: 'Fixed (Amort)', value: results.monthlyAmortizedFixedCost },
  ], [results.layer1MonthlyCost, results.layer2MonthlyCost, results.monthlyAmortizedFixedCost]);

  // Module-level constant would do, but it is only used here; hoisting it out of the
  // component is what makes the identity stable.
  const COLORS = COST_BREAKDOWN_COLORS;

  // ROI Curve Data - Calculate cumulative profit over analysis period
  const roiCurveData = useMemo(() => {
    const data = [];
    const totalFixedCosts = inputs.integrationCost + inputs.trainingTuningCost + inputs.changeManagementCost;
    const monthlyVariableCost = results.layer2MonthlyCost; // Total monthly operating cost
    const monthlyValue = results.totalMonthlyValue;
    const netMonthlyBenefit = monthlyValue - monthlyVariableCost;

    for (let month = 0; month <= inputs.analysisHorizonMonths; month++) {
      let cumulativeProfit;
      if (month === 0) {
        // At month 0, we've only incurred fixed costs
        cumulativeProfit = -totalFixedCosts;
      } else {
        // Each month adds net monthly benefit (value - variable costs)
        cumulativeProfit = -totalFixedCosts + (netMonthlyBenefit * month);
      }
      data.push({
        month,
        cumulativeProfit
      });
    }
    return data;
  }, [inputs, results]);

  // Calculate break-even month for chart marker
  const breakEvenMonthForChart = useMemo(() => {
    if (results.breakEvenMonths === undefined || results.breakEvenMonths === 0) {
      return undefined;
    }
    return Math.ceil(results.breakEvenMonths);
  }, [results.breakEvenMonths]);

  // Tornado Chart Data - Calculate sensitivity impact for each variable
  // IMPORTANT: Always test against baseline (no modifiers) to show true sensitivity
  const tornadoData = useMemo(() => {
    const testRange = 0.2; // ±20% variation

    // Baseline modifiers (all at 1.0)
    const baselineModifiers = {
      volumeMultiplier: 1,
      successRateMultiplier: 1,
      costMultiplier: 1,
      valueMultiplier: 1
    };

    // Calculate baseline ROI with no modifiers
    const baselineROI = calculateROI(inputs, baselineModifiers).roiPercentage;

    const variables = [
      {
        name: 'Volume',
        calculate: (multiplier: number) => calculateROI(inputs, { ...baselineModifiers, volumeMultiplier: multiplier }).roiPercentage
      },
      {
        name: 'Realization Rate',
        calculate: (multiplier: number) => calculateROI(inputs, { ...baselineModifiers, successRateMultiplier: multiplier }).roiPercentage
      },
      {
        name: 'Costs',
        calculate: (multiplier: number) => calculateROI(inputs, { ...baselineModifiers, costMultiplier: multiplier }).roiPercentage
      },
      {
        name: 'Value',
        calculate: (multiplier: number) => calculateROI(inputs, { ...baselineModifiers, valueMultiplier: multiplier }).roiPercentage
      }
    ];

    return variables.map(variable => {
      const lowROI = variable.calculate(1 - testRange);
      const highROI = variable.calculate(1 + testRange);

      const lowDeviation = lowROI - baselineROI;
      const highDeviation = highROI - baselineROI;

      // Determine which scenario is worse (lower ROI = red) and better (higher ROI = green)
      // This handles inverse relationships (e.g., costs where lower = better)
      const worseDeviation = Math.min(lowDeviation, highDeviation);
      const betterDeviation = Math.max(lowDeviation, highDeviation);

      return {
        variable: variable.name,
        // Tornado chart: worse (red) extends LEFT (negative), better (green) extends RIGHT (positive)
        low: worseDeviation,   // Always the more negative deviation (red bar)
        high: betterDeviation, // Always the more positive deviation (green bar)
        baseline: baselineROI,
        lowAbsolute: lowROI,
        highAbsolute: highROI
      };
    });
  }, [inputs]);

  return (
    <div className="min-h-screen bg-[#F4F4F4] flex flex-col font-sans text-slate-900">
      {/* Modals are code-split and mounted only while open — see the lazy imports above.
          Rendering them unconditionally would fetch their chunks on first paint and undo
          the split, since each one only returns null internally when closed. */}
      <Suspense fallback={null}>
        {/* Help Guide Modal */}
        {showHelp && <HelpGuide isOpen onClose={() => setShowHelp(false)} />}

        {/* Scenario Manager Modal */}
        {showScenarios && (
          <ScenarioManager
            isOpen
            onClose={() => setShowScenarios(false)}
            currentInputs={inputs}
            currentResults={results}
            scenarios={scenarios}
            onSaveScenario={handleSaveScenario}
            onLoadScenario={handleLoadScenario}
            onDeleteScenario={handleDeleteScenario}
            onExportScenarios={handleExportScenarios}
            onImportScenarios={handleImportScenarios}
            onCompareScenarios={handleCompareScenarios}
          />
        )}

        {/* Scenario Comparison Modal */}
        {showComparison && (
          <ScenarioComparison
            isOpen
            onClose={() => setShowComparison(false)}
            scenarios={selectedScenarios}
          />
        )}
      </Suspense>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2">
          {/* Left: Logo */}
          <div className="flex items-center flex-shrink-0">
            <a
              href="https://www.optimnow.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Visit OptimNow website"
              onClick={() => {
                (window as any).trackEvent?.('optimnow_cta_clicked', {
                  source: 'airoicalculator_header'
                });
              }}
            >
              <img
                src="/images/Logo.png"
                alt="OptimNow Logo"
                className="h-8 sm:h-10 w-auto object-contain max-w-[140px] sm:max-w-[180px]"
                onError={(e) => {
                  console.error('Logo failed to load from:', e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
          </div>

          {/* Center: Title */}
          <h1 className="sr-only sm:not-sr-only text-xl font-bold font-headline text-slate-800 tracking-tight whitespace-nowrap">AI ROI Calculator</h1>

          {/* Right: Controls */}
          <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0" role="toolbar" aria-label="Calculator controls">
             <div className="flex bg-slate-100 rounded-lg p-0.5 sm:p-1" role="group" aria-label="Display mode toggle">
                <button
                  onClick={() => {
                    setMode('simple');
                    (window as any).trackEvent?.('mode_switched', { mode: 'simple' });
                  }}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${mode === 'simple' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={mode === 'simple'}
                  aria-label="Switch to simple mode"
                >
                  Simple
                </button>
                <button
                  onClick={() => {
                    setMode('advanced');
                    (window as any).trackEvent?.('mode_switched', { mode: 'advanced' });
                  }}
                  className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium rounded-md transition-all ${mode === 'advanced' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={mode === 'advanced'}
                  aria-label="Switch to advanced mode"
                >
                  Advanced
                </button>
             </div>
            <button
              onClick={() => setShowScenarios(true)}
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-accent hover:bg-opacity-10 rounded-md transition-colors relative"
              title="Manage Scenarios"
              aria-label="Open scenario manager"
            >
              <FolderOpen size={18} aria-hidden="true" />
              {scenarios.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-charcoal text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {scenarios.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-1.5 sm:p-2 text-slate-500 hover:bg-accent hover:bg-opacity-10 rounded-md transition-colors"
              title="How to Fill the Calculator"
              aria-label="Open help guide"
            >
              <HelpCircle size={18} aria-hidden="true" />
            </button>
            {/* On-domain, statically rendered — generated from METHODOLOGY.md by
                scripts/build-methodology.mjs. It used to point at GitHub, which sent both
                readers and crawlers off the product's own domain. */}
            <a
              href="/methodology.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block p-1.5 sm:p-2 text-slate-500 hover:bg-accent hover:bg-opacity-10 rounded-md transition-colors"
              title="View Calculation Methodology"
              aria-label="Open methodology documentation in new tab"
            >
              <BookOpen size={18} aria-hidden="true" />
            </a>
            <button
              onClick={handleCopyMarkdown}
              className={`hidden sm:block p-1.5 sm:p-2 rounded-md ${copied ? 'text-green-600 bg-green-50' : 'text-slate-500 hover:bg-slate-100'}`}
              title="Copy Summary"
              aria-label="Copy summary to clipboard"
            >
              {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            </button>
            <button
              onClick={handleExportJSON}
              className="hidden sm:block p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 rounded-md"
              title="Download JSON"
              aria-label="Download results as JSON"
            >
              <Download size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT COLUMN: INPUTS --- */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto h-full p-6 rounded-lg" style={{ backgroundColor: 'var(--color-secondary)' }}>
          {/* Handover from the OptimToken — confirms what carried over */}
          {showDeepLinkBanner && (
            <div className="bg-accent bg-opacity-10 border border-accent rounded-lg p-4">
              <div className="flex items-start">
                <Info size={18} className="text-[#2C2C2C] mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Scenario loaded from the{' '}
                    <a href={PRICING_HUB_URL} target="_blank" rel="noopener noreferrer" className="underline">
                      OptimToken
                    </a>
                  </h4>
                  {deepLinkSummary && (
                    <p className="text-xs font-semibold text-slate-700">{deepLinkSummary}</p>
                  )}
                  <p className="text-xs text-slate-600">
                    Costs are pre-filled — add your business value below to get the ROI.
                  </p>
                  {deepLink.modelId && !deepLinkModelName && catalogSettled && (
                    <p className="text-xs text-amber-700 mt-1">
                      That model isn't in the catalog right now, so the preset's model is used instead.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowDeepLinkBanner(false)}
                  className="text-slate-400 hover:text-slate-700 flex-shrink-0 ml-2"
                  aria-label="Dismiss OptimToken handover notice"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Preset Loader */}
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold font-label text-slate-500 uppercase mb-3">Load Example Profile</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map(key => (
                <button
                  key={key}
                  onClick={() => loadPreset(key)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 hover:border-slate-300 transition-colors"
                >
                  {PRESETS[key].useCaseName}
                </button>
              ))}
              <button
                onClick={() => setInputs(repriceModels(DEFAULT_INPUTS, catalog))}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-[#2C2C2C] hover:bg-slate-100 transition-colors ml-auto rounded-md"
                title="Reset to defaults"
                aria-label="Reset calculator to default values"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Sensitivity Simulation Active Banner */}
          {(modifiers.volumeMultiplier !== 1 || modifiers.successRateMultiplier !== 1 || modifiers.costMultiplier !== 1 || modifiers.valueMultiplier !== 1) && (
            <div className="bg-accent bg-opacity-10 border border-accent rounded-lg p-4">
              <div className="flex items-start">
                <Info size={18} className="text-[#2C2C2C] mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Sensitivity Simulation Active</h4>
                  <p className="text-xs text-slate-600 mb-2">Results shown are based on modified values below. Base inputs remain unchanged.</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {modifiers.volumeMultiplier !== 1 && (
                      <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                        <span className="font-semibold text-slate-700">Volume:</span> <span className="font-mono font-bold text-[#2C2C2C]">{formatNumber(inputs.monthlyVolume)} × {modifiers.volumeMultiplier} = {formatNumber(inputs.monthlyVolume * modifiers.volumeMultiplier)}</span>
                      </div>
                    )}
                    {modifiers.successRateMultiplier !== 1 && (
                      <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                        <span className="font-semibold text-slate-700">Realization Rate:</span> <span className="font-mono font-bold text-[#2C2C2C]">{inputs.successRate}% × {modifiers.successRateMultiplier} = {(inputs.successRate * modifiers.successRateMultiplier).toFixed(1)}%</span>
                      </div>
                    )}
                    {modifiers.costMultiplier !== 1 && (
                      <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                        <span className="font-semibold text-slate-700">Costs:</span> <span className="font-mono font-bold text-[#2C2C2C]">×{modifiers.costMultiplier}</span>
                      </div>
                    )}
                    {modifiers.valueMultiplier !== 1 && (
                      <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                        <span className="font-semibold text-slate-700">Value:</span> <span className="font-mono font-bold text-[#2C2C2C]">×{modifiers.valueMultiplier}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* 1. Value & Scope */}
             <SectionHeader
               title="1. Value & Scope"
               isOpen={expandedSections.valueScope}
               onToggle={() => toggleSection('valueScope')}
               controls="section-value-scope"
               summary={`${inputs.valueMethod} · ${formatMoney(results.grossValuePerUnit, 4)} / ${inputs.unitName} · ${formatNumber(inputs.monthlyVolume)} ${pluralize(inputs.unitName)}/mo`}
             />
             {expandedSections.valueScope && <div id="section-value-scope" className="p-5 border-b border-slate-100">
               <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Use Case Name</label>
                   <input
                    type="text"
                    value={inputs.useCaseName}
                    onChange={e => updateInput('useCaseName', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unit Name</label>
                      <input
                        type="text"
                        value={inputs.unitName}
                        onChange={e => updateInput('unitName', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                      />
                    </div>
                    <NumberInput label="Monthly Volume" value={inputs.monthlyVolume} onChange={v => updateInput('monthlyVolume', v)} />
                 </div>
                 <NumberInput
                   label="Analysis Months"
                   value={inputs.analysisHorizonMonths}
                   onChange={v => updateInput('analysisHorizonMonths', v)}
                   tooltip="How far the ROI curve chart runs. It does not enter any calculation: ROI, payback and break-even are all monthly figures. Fixed costs are spread over the separate Amortization field."
                 />
               </div>

               {/* Value Definition */}
               <div className="border-t border-slate-200 mt-5 pt-5">
                {/* Step 1: Choose Value Archetype */}
                <div className="flex items-start mb-5" role="group" aria-label="Step 1: Choose value archetype">
                  <span className="flex-shrink-0 bg-accent text-charcoal rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Choose Value Archetype</h4>
                    <select
                      value={inputs.valueMethod}
                      onChange={(e) => updateInput('valueMethod', e.target.value as ValueMethod)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                    >
                        {Object.values(ValueMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                {/* Step 2: Define Value Drivers */}
                <div className="flex items-start mb-5" role="group" aria-label="Step 2: Define value drivers">
                  <span className="flex-shrink-0 bg-accent text-charcoal rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Define Value Drivers</h4>

                    {inputs.valueMethod === ValueMethod.COST_DISPLACEMENT && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <MoneyInput label="Baseline Human Cost" value={inputs.baselineHumanCostPerUnit} onChange={v => updateInput('baselineHumanCostPerUnit', v)} />
                            <div className="grid grid-cols-2 gap-3">
                                <PercentInput label="Deflection Rate" value={inputs.deflectionRate} onChange={v => updateInput('deflectionRate', v)} tooltip="Percentage of tasks fully handled by AI without human intervention." />
                                <PercentInput label="Residual Review Rate" value={inputs.residualHumanReviewRate} onChange={v => updateInput('residualHumanReviewRate', v)} tooltip="Percentage of AI-handled tasks that still require a human to review or approve the output." />
                            </div>
                            {inputs.residualHumanReviewRate > 0 && (
                                <MoneyInput label="Review Cost (Unit)" value={inputs.residualReviewCostPerUnit} onChange={v => updateInput('residualReviewCostPerUnit', v)} />
                            )}
                        </div>
                    )}

                    {inputs.valueMethod === ValueMethod.REVENUE_UPLIFT && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                             <div className="grid grid-cols-2 gap-3">
                                <PercentInput label="Baseline Conversion" value={inputs.baselineConversionRate} onChange={v => updateInput('baselineConversionRate', v)} tooltip="Your current conversion rate before AI is applied. Used to measure the uplift AI provides." />
                                <PercentInput
                                  label="Abs. Uplift (+)"
                                  value={inputs.conversionUpliftAbsolute}
                                  onChange={v => updateInput('conversionUpliftAbsolute', v)}
                                  tooltip="Absolute Uplift: Enter percentage POINTS increase (not relative %). Example: if conversion goes from 2% to 2.5%, enter 0.5 (not 25%)."
                                />
                            </div>
                            <MoneyInput label="Average Order Value" value={inputs.averageOrderValue} onChange={v => updateInput('averageOrderValue', v)} />
                            <PercentInput label="Gross Margin" value={inputs.grossMargin} onChange={v => updateInput('grossMargin', v)} />
                        </div>
                    )}

                    {inputs.valueMethod === ValueMethod.RETENTION && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                             <div className="grid grid-cols-2 gap-3">
                                <PercentInput label="Baseline Churn" value={inputs.baselineChurnRate} onChange={v => updateInput('baselineChurnRate', v)} />
                                <PercentInput label="Churn Reduction" value={inputs.churnReductionAbsolute} onChange={v => updateInput('churnReductionAbsolute', v)} />
                            </div>
                            <MoneyInput label="Annual Value / Customer" value={inputs.annualValuePerCustomer} onChange={v => updateInput('annualValuePerCustomer', v)} />
                            <NumberInput label="Customers Impacted / Mo" value={inputs.customersImpactedPerMonth} onChange={v => updateInput('customersImpactedPerMonth', v)} />
                        </div>
                    )}

                    {inputs.valueMethod === ValueMethod.PREMIUM_MONETIZATION && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <MoneyInput label="Price / Sub / Mo" value={inputs.pricePerSubscriberPerMonth} onChange={v => updateInput('pricePerSubscriberPerMonth', v)} />
                            <NumberInput label="Total Subscribers" value={inputs.subscribers} onChange={v => updateInput('subscribers', v)} />
                            <MoneyInput label="Non-AI COGS / Sub" value={inputs.nonAiCOGSPerSubscriber} onChange={v => updateInput('nonAiCOGSPerSubscriber', v)} tooltip="Non-AI cost of goods sold per subscriber per month (e.g. hosting, support, content). AI inference cost is calculated separately." />
                        </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Set Realization Rate */}
                <div className="flex items-start mb-4" role="group" aria-label="Step 3: Set realization rate">
                  <span className="flex-shrink-0 bg-accent text-charcoal rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">Set Realization Rate</h4>
                    <PercentInput
                      label="Realization Rate"
                      value={inputs.successRate}
                      onChange={v => updateInput('successRate', v)}
                      tooltip="% of AI outputs that actually realize business value. This accounts for outputs that are technically successful but don't translate to business impact."
                    />
                  </div>
                </div>

                {/* Equation Preview — shows where each rate acts, since the three are easily confused */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 ml-9">
                  <h4 className="text-xs font-bold font-label text-slate-500 uppercase mb-2">Equation Preview</h4>
                  {inputs.valueMethod === ValueMethod.COST_DISPLACEMENT && (
                    <p className="text-xs text-slate-600 font-mono mb-1">
                      ({formatMoney(inputs.baselineHumanCostPerUnit, 2)}
                      <span className="text-slate-400"> × </span>{inputs.deflectionRate}%
                      <span className="text-slate-400"> deflected) − (</span>
                      {formatMoney(inputs.residualReviewCostPerUnit, 2)}
                      <span className="text-slate-400"> × </span>{inputs.residualHumanReviewRate}%
                      <span className="text-slate-400"> reviewed) = </span>
                      {formatMoney(grossBeforeRealization, 4)}
                    </p>
                  )}
                  <p className="text-sm text-slate-700 font-mono">
                    {formatMoney(grossBeforeRealization, 4)}
                    <span className="text-slate-400"> × </span>
                    {effectiveRealizationRate.toFixed(0)}%
                    <span className="text-slate-400"> realized = </span>
                    <span className="font-bold text-[#2C2C2C]">{formatMoney(results.grossValuePerUnit, 4)}</span>
                    <span className="text-slate-400"> / {inputs.unitName}</span>
                  </p>
                  {inputs.valueMethod === ValueMethod.COST_DISPLACEMENT && (
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      Three different questions: <strong>deflection</strong> is how often AI handles the task at all,
                      <strong> review</strong> is how often a human still checks its output, and
                      <strong> realization</strong> is how much of the resulting saving actually reaches the P&amp;L.
                    </p>
                  )}
                </div>
               </div>
             </div>}

             {/* 2. Cost Model */}
             <SectionHeader
               title="2. Cost Model"
               isOpen={expandedSections.costModel}
               onToggle={() => toggleSection('costModel')}
               controls="section-cost-model"
               summary={`${inputs.primaryModel.modelName ?? 'Custom pricing'} · ${formatMoney(results.totalCostPerUnit, 4)} / ${inputs.unitName}`}
             />
             {expandedSections.costModel && <div id="section-cost-model" className="p-5 border-b border-slate-100">
                {/* Sub-section: Infrastructure (Layer 1) */}
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold font-label text-slate-500 uppercase tracking-wider">Infrastructure (Layer 1)</h4>
                  <CatalogStatus catalog={catalog} loading={catalogLoading} onRefresh={() => refreshCatalog(true)} />
                </div>
                {mode === 'advanced' && (
                   <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                      <h5 className="text-xs font-bold text-slate-700 mb-2">Model Routing Strategy</h5>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs text-slate-500">Simple Model</span>
                         <span className="text-xs font-bold text-[#2C2C2C]">{inputs.routingSimplePercent}%</span>
                      </div>
                      <input
                        type="range" min="0" max="100"
                        value={inputs.routingSimplePercent}
                        onChange={(e) => updateInput('routingSimplePercent', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                         <span>Cheap / Fast</span>
                         <span>Expensive / Smart</span>
                      </div>
                   </div>
                )}

                <div className="space-y-4">
                    <div className="border-l-2 border-accent pl-3">
                        <ModelCostInputs
                          slot="primary"
                          title={mode === 'advanced' ? 'Primary Model (Simple)' : 'Model'}
                          value={inputs.primaryModel}
                          catalog={catalog}
                          onSelect={patch => patchModelParams('primaryModel', patch)}
                          onParam={(field, v) => updateModelParam('primaryModel', field, v)}
                          onPrice={(field, v) => updateModelPrice('primaryModel', field, v)}
                          onBillingBasisChange={perCall => setBillingBasis('primaryModel', perCall)}
                        />
                    </div>

                    {mode === 'advanced' && inputs.routingSimplePercent < 100 && (
                        <div className="border-l-2 border-purple-500 pl-3 mt-4 pt-4 border-t border-dashed border-slate-200">
                            <ModelCostInputs
                              slot="secondary"
                              title="Secondary Model (Complex)"
                              value={inputs.secondaryModel}
                              catalog={catalog}
                              onSelect={patch => patchModelParams('secondaryModel', patch)}
                              onParam={(field, v) => updateModelParam('secondaryModel', field, v)}
                              onPrice={(field, v) => updateModelPrice('secondaryModel', field, v)}
                              onBillingBasisChange={perCall => setBillingBasis('secondaryModel', perCall)}
                            />
                        </div>
                    )}

                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={inputs.batchProcessing === true}
                          onChange={e => updateInput('batchProcessing', e.target.checked)}
                          className="mt-0.5 accent-[#ACE849]"
                          aria-describedby="batch-hint"
                        />
                        <span className="text-xs">
                          <span className="font-semibold text-slate-700">Async batch processing</span>
                          <span id="batch-hint" className="block text-[10px] text-slate-400">
                            {inputs.primaryModel.batchInputPricePer1M !== undefined
                              ? `Uses the provider's batch API rates (≈ -50%) — e.g. ${inputs.primaryModel.modelName}: $${inputs.primaryModel.batchInputPricePer1M} / $${inputs.primaryModel.batchOutputPricePer1M} per 1M.`
                              : inputs.batchProcessing && inputs.primaryModel.modelId
                                ? 'Selected model has no published batch rates — list prices are used.'
                                : 'For workloads that tolerate delayed responses. Applies published batch rates where they exist.'}
                          </span>
                        </span>
                    </label>

                    {mode === 'advanced' && (
                        <div className="pt-2">
                          <div className="grid grid-cols-2 gap-3">
                             <PercentInput label="Cache Hit Rate" value={inputs.cacheHitRate} onChange={v => updateInput('cacheHitRate', v)} tooltip="Percentage of input tokens served from the prompt cache (repeated system prompts, shared context)." />
                             {inputs.primaryModel.cachedInputPricePer1M === undefined && (
                               <PercentInput label="Cache Discount" value={inputs.cachedTokenDiscount} onChange={v => updateInput('cachedTokenDiscount', v)} tooltip="Discount applied to cached tokens vs. fresh tokens. Most providers offer 75–90% off for cached input tokens. Ignored when the selected model has a published cache-read price." />
                             )}
                          </div>
                          {inputs.primaryModel.cachedInputPricePer1M !== undefined && (
                            <p className="text-[10px] text-slate-400 mt-1">
                              Cache reads priced at {inputs.primaryModel.modelName}'s published rate: ${inputs.primaryModel.cachedInputPricePer1M} / 1M input
                              ({Math.round((1 - inputs.primaryModel.cachedInputPricePer1M / inputs.primaryModel.pricePer1MInputTokens) * 100)}% off).
                            </p>
                          )}
                        </div>
                    )}
                </div>

                {/* Sub-section: Harness (Layer 2) */}
                <div className="border-t border-slate-200 mt-5 pt-5">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="text-xs font-bold font-label text-slate-500 uppercase tracking-wider">Harness (Layer 2)</h4>
                    <div className="flex bg-slate-100 rounded-md p-0.5 flex-shrink-0" role="group" aria-label="Harness cost entry unit">
                      <button
                        type="button"
                        onClick={() => setHarnessPer1k(false)}
                        aria-pressed={!harnessPer1k}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${!harnessPer1k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        per {inputs.unitName}
                      </button>
                      <button
                        type="button"
                        onClick={() => setHarnessPer1k(true)}
                        aria-pressed={harnessPer1k}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${harnessPer1k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        per 1,000
                      </button>
                    </div>
                  </div>
                  {harnessPer1k && (
                    <p className="text-[10px] text-slate-500 mb-2 -mt-1">
                      Vendors quote per 1,000 calls — enter that figure directly. If each {inputs.unitName} makes several calls, multiply first.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                      <MoneyInput label="Orchestration" value={harnessValue(inputs.orchestrationCostPerUnit)} onChange={v => updateHarness('orchestrationCostPerUnit', v)} precision={harnessPrecision} tooltip="Agent and workflow runtime: LangGraph, Temporal, Step Functions, or your own service compute." />
                      <MoneyInput label="Retrieval / Vector DB" value={harnessValue(inputs.retrievalCostPerUnit)} onChange={v => updateHarness('retrievalCostPerUnit', v)} precision={harnessPrecision} tooltip="Vector search and embedding calls: Pinecone, Weaviate, pgvector. Usually quoted per 1,000 queries." />
                  </div>
                  {mode === 'advanced' && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                           <MoneyInput label="Tool APIs" value={harnessValue(inputs.toolApiCostPerUnit)} onChange={v => updateHarness('toolApiCostPerUnit', v)} precision={harnessPrecision} tooltip="External APIs the agent calls: web search (Serper, Tavily, Bing), rerankers (Cohere Rerank), enrichment services. Quoted per 1,000 calls." />
                           <MoneyInput label="Logging / Monitoring" value={harnessValue(inputs.loggingMonitoringCostPerUnit)} onChange={v => updateHarness('loggingMonitoringCostPerUnit', v)} precision={harnessPrecision} tooltip="Observability: Datadog, LangSmith, CloudWatch traces and log ingestion." />
                           <MoneyInput label="Safety / Guardrails" value={harnessValue(inputs.safetyGuardrailsCostPerUnit)} onChange={v => updateHarness('safetyGuardrailsCostPerUnit', v)} precision={harnessPrecision} tooltip="Moderation and PII detection: Bedrock Guardrails, Azure Content Safety, OpenAI Moderation. Quoted per 1,000 text units or transactions." />
                           <MoneyInput label="Storage" value={harnessValue(inputs.storageCostPerUnit)} onChange={v => updateHarness('storageCostPerUnit', v)} precision={harnessPrecision} tooltip="Conversation history, documents and artifacts kept per unit: S3, RDS, blob storage." />
                           <MoneyInput label="Network Egress" value={harnessValue(inputs.networkEgressCostPerUnit)} onChange={v => updateHarness('networkEgressCostPerUnit', v)} precision={harnessPrecision} tooltip="Data transfer out of your cloud provider per unit." />
                      </div>
                  )}
                  <div className="flex items-baseline justify-between mt-3 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Harness subtotal{mode === 'simple' && harnessHiddenCost > 0 ? ' (incl. defaults hidden in Simple)' : ''}</span>
                    <span className="font-mono font-semibold text-slate-700">
                      {formatMoney(harnessSubtotal, 4)} / {inputs.unitName}
                      <span className="text-slate-400 font-normal"> · {formatMoney(harnessSubtotal * inputs.monthlyVolume, 0)}/mo</span>
                    </span>
                  </div>
                  {mode === 'advanced' ? (
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                          <PercentInput label="Retry Rate" value={inputs.retryRate * 100} onChange={v => updateInput('retryRate', v/100)} tooltip="Percentage of calls that need a retry. Retries re-run the model, so they are counted in Layer 1." />
                          <PercentInput label="Ops Overhead" value={Math.round((inputs.overheadMultiplier - 1) * 1000) / 10} onChange={v => updateInput('overheadMultiplier', 1 + v/100)} tooltip="Extra percentage on top of all per-unit costs for DevOps time, dashboards and alerting. 10% here means costs are multiplied by 1.1." />
                      </div>
                  ) : (
                      <p className="text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                        Assumes {(inputs.retryRate * 100).toFixed(0)}% retries
                        {inputs.overheadMultiplier !== 1 && ` and ${((inputs.overheadMultiplier - 1) * 100).toFixed(0)}% ops overhead`}.
                        Switch to Advanced to change {inputs.overheadMultiplier !== 1 ? 'them' : 'it'}.
                      </p>
                  )}
                </div>

                {/* Sub-section: One-time Costs */}
                <div className="border-t border-slate-200 mt-5 pt-5">
                  <h4 className="text-xs font-bold font-label text-slate-500 uppercase tracking-wider mb-3">One-time Costs</h4>
                  <div className="grid grid-cols-2 gap-3">
                       <MoneyInput label="Integration" value={inputs.integrationCost} onChange={v => updateInput('integrationCost', v)} precision={0} />
                       <MoneyInput label="Training / Tuning" value={inputs.trainingTuningCost} onChange={v => updateInput('trainingTuningCost', v)} precision={0} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                       <MoneyInput label="Change Mgmt" value={inputs.changeManagementCost} onChange={v => updateInput('changeManagementCost', v)} precision={0} />
                       <NumberInput label="Amortization (Mo)" value={inputs.amortizationMonths} onChange={v => updateInput('amortizationMonths', v)} />
                  </div>
                </div>
             </div>}

          </div>
        </div>

        {/* --- RIGHT COLUMN: RESULTS --- */}
        <div className="lg:col-span-7 space-y-6 bg-white p-6 rounded-lg" role="region" aria-label="Calculation results">

            {/* Business Value Summary Card */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold font-label text-slate-500 uppercase">Value Summary</h3>
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600">
                  {inputs.valueMethod}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Gross / Unit</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatMoney(grossBeforeRealization, 4)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Realized / Unit</span>
                  <span className="text-sm font-bold text-[#2C2C2C]">
                    {formatMoney(results.grossValuePerUnit, 4)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Confidence</span>
                  <span className={`text-sm font-bold ${
                    effectiveRealizationRate >= 90 ? 'text-green-600' :
                    effectiveRealizationRate >= 70 ? 'text-amber-600' :
                    'text-red-600'
                  }`}>
                    {effectiveRealizationRate >= 90 ? 'High' :
                     effectiveRealizationRate >= 70 ? 'Medium' :
                     'Low'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3">
                Realized = Gross × {inputs.successRate}% success rate.{' '}
                <a
                  href="/methodology.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Full methodology →
                </a>
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="group" aria-label="Key performance indicators">
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between" role="article" aria-label="ROI metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-label text-slate-400 uppercase" id="roi-label">ROI</span>
                      <button
                        className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                        title={tooltips.roi}
                        aria-label="ROI explanation"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <span
                      className={`text-2xl font-extrabold ${results.roiPercentage >= 0 ? 'text-success' : 'text-danger'}`}
                      aria-labelledby="roi-label"
                      aria-live="polite"
                    >
                        {results.roiPercentage.toFixed(0)}%
                    </span>
                    <span className="text-[10px] text-slate-400">Monthly value vs. cost</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between" role="article" aria-label="Net benefit metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-label text-slate-400 uppercase" id="netbenefit-label">Net Benefit</span>
                      <button
                        className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                        title={tooltips.netBenefit}
                        aria-label="Net benefit explanation"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <span
                      className={`text-2xl font-extrabold ${results.netMonthlyBenefit >= 0 ? 'text-slate-800' : 'text-danger'}`}
                      aria-labelledby="netbenefit-label"
                      aria-live="polite"
                    >
                        {formatNumber(results.netMonthlyBenefit / 1000)}k
                    </span>
                    <span className="text-[10px] text-slate-400">Per month</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between" role="article" aria-label="Payback period metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-label text-slate-400 uppercase" id="payback-label">Payback</span>
                      <button
                        className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                        title={tooltips.payback}
                        aria-label="Payback period explanation"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <span className="text-2xl font-extrabold text-slate-800" aria-labelledby="payback-label" aria-live="polite">
                        {results.paybackMonths}
                    </span>
                    <span className="text-[10px] text-slate-400">Months to recover costs</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between" role="article" aria-label="Unit cost metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-label text-slate-400 uppercase" id="unitcost-label">Unit Cost</span>
                      <button
                        className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                        title={tooltips.unitCost}
                        aria-label="Unit cost explanation"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <span className="text-2xl font-extrabold text-slate-800" aria-labelledby="unitcost-label" aria-live="polite">
                        {formatMoney(results.totalCostPerUnit, 3)}
                    </span>
                    <span className="text-[10px] text-slate-400">per {inputs.unitName}</span>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between" role="article" aria-label="Break-even metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-label text-slate-400 uppercase" id="breakeven-label">Break-even volume</span>
                      <button
                        className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                        title={tooltips.breakEvenVolume}
                        aria-label="Break-even explanation"
                      >
                        <Info size={12} />
                      </button>
                    </div>
                    <span className="text-2xl font-extrabold text-slate-800" aria-labelledby="breakeven-label" aria-live="polite">
                        {results.breakEvenVolume !== undefined
                          ? formatNumber(results.breakEvenVolume)
                          : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {results.breakEvenVolume !== undefined
                        ? `${pluralize(inputs.unitName)}/mo to break even`
                        : 'Negative margin'}
                    </span>
                </div>
            </div>

            {/* Break-even Insight Card */}
            {results.breakEvenVolume !== undefined && results.netMonthlyBenefit < 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Break-even Analysis</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    You need <strong>{formatNumber(results.breakEvenVolume - results.effectiveMonthlyVolume)}</strong> more {pluralize(inputs.unitName)} per month
                    ({((results.breakEvenVolume / results.effectiveMonthlyVolume - 1) * 100).toFixed(1)}% increase) to reach break-even.
                  </p>
                </div>
              </div>
            )}

            {results.breakEvenVolume !== undefined && results.netMonthlyBenefit >= 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-green-900">Above Break-even</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your current volume of <strong>{formatNumber(results.effectiveMonthlyVolume)}</strong> {pluralize(inputs.unitName)} are already profitable.
                    Break-even threshold: <strong>{formatNumber(results.breakEvenVolume)}</strong> {pluralize(inputs.unitName)}/mo.
                  </p>
                </div>
              </div>
            )}

            {/* ROI Curve - Profit Over Time */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold font-headline text-slate-800 uppercase">ROI Curve: Cumulative Profit Over Time</h3>
                  <button
                    className="text-slate-300 hover:text-[#2C2C2C] transition-colors"
                    title={`This is the cumulative account, not the monthly one. It starts at minus your ${formatMoney(results.totalFixedCost, 0)} of setup and climbs by the cash the project generates each month. The chartreuse line marks where it crosses zero — the month your setup is repaid, which is the Payback figure above. Volume is held at today's level; if it grows, repayment comes sooner.`}
                    aria-label="ROI curve explanation"
                  >
                    <Info size={14} />
                  </button>
                </div>
                <div className="h-64">
                  <ROICurveChart
                    data={roiCurveData}
                    breakEvenMonth={breakEvenMonthForChart}
                    formatMoney={formatMoney}
                  />
                </div>
            </div>

            {/* Main Visuals Container */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-sm font-bold font-headline text-slate-800 uppercase mb-6">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
                    <CostValueChart data={chartDataMonthly} formatMoney={formatMoney} />
                    <CostBreakdownChart data={pieDataCost} colors={COLORS} />
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold font-headline text-slate-700 uppercase">Unit Economics</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium text-right">Cost / Unit</th>
                            <th className="px-6 py-3 font-medium text-right">Monthly</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr>
                            <td className="px-6 py-3 text-slate-700 font-medium">Layer 1: Model Inference</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.layer1CostPerUnit, 4)}</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.layer1MonthlyCost, 0)}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-3 text-slate-700 font-medium">Layer 2: Harness & Ops</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.layer2CostPerUnit - results.layer1CostPerUnit, 4)}</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.layer2MonthlyCost - results.layer1MonthlyCost, 0)}</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-3 text-slate-700 font-medium">Fixed Cost Amortization</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.monthlyAmortizedFixedCost / (results.effectiveMonthlyVolume || 1), 4)}</td>
                            <td className="px-6 py-3 text-right text-slate-600 font-mono">{formatMoney(results.monthlyAmortizedFixedCost, 0)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold">
                            <td className="px-6 py-3 text-slate-800">Total Cost</td>
                            <td className="px-6 py-3 text-right text-slate-800 font-mono">{formatMoney(results.totalCostPerUnit, 4)}</td>
                            <td className="px-6 py-3 text-right text-slate-800 font-mono">{formatMoney(results.totalMonthlyCost, 0)}</td>
                        </tr>
                        <tr className="border-t-2 border-slate-200">
                            <td className="px-6 py-3 text-success font-medium flex items-center space-x-2">
                              <span>Total Monthly Value</span>
                              <button
                                className="text-success opacity-50 hover:opacity-100 transition-opacity"
                                title="Total Monthly Value: The gross business value generated per month from your selected Value Method (before subtracting costs)."
                                aria-label="Total monthly value explanation"
                              >
                                <Info size={14} />
                              </button>
                            </td>
                            <td className="px-6 py-3 text-right text-success font-mono">{formatMoney(results.netValuePerUnit, 4)}</td>
                            <td className="px-6 py-3 text-right text-success font-mono">{formatMoney(results.totalMonthlyValue, 0)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-[#2C2C2C] rounded-lg p-6 text-white">
                <div className="flex items-center space-x-2 mb-1">
                    <Settings size={18} className="text-accent" />
                    <h3 className="text-sm font-bold font-headline uppercase tracking-wider">Sensitivity Simulator</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                    Stress-tests the results only — these sliders never change your inputs, and are not saved with a scenario.
                </p>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Volume</span>
                            <span className="font-mono font-bold text-white">x{modifiers.volumeMultiplier}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="3.0" step="0.1"
                            value={modifiers.volumeMultiplier}
                            onChange={(e) => setModifiers({...modifiers, volumeMultiplier: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Realization Rate</span>
                            <span className="font-mono font-bold text-white">x{modifiers.successRateMultiplier}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="1.5" step="0.1"
                            value={modifiers.successRateMultiplier}
                            onChange={(e) => setModifiers({...modifiers, successRateMultiplier: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Cost Factors</span>
                            <span className="font-mono font-bold text-white">x{modifiers.costMultiplier}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={modifiers.costMultiplier}
                            onChange={(e) => setModifiers({...modifiers, costMultiplier: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Value Factors</span>
                            <span className="font-mono font-bold text-white">x{modifiers.valueMultiplier}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={modifiers.valueMultiplier}
                            onChange={(e) => setModifiers({...modifiers, valueMultiplier: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
                    </div>
                </div>

                {/* Tornado Chart - Impact Ranking */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold font-label text-slate-300 uppercase tracking-wider">Impact Ranking (±20% Variation)</h4>
                        <button
                            className="text-slate-400 hover:text-white transition-colors"
                            title="Tornado chart shows which variables have the most impact on ROI when varied by ±20%. Variables are sorted by impact magnitude (largest at top)."
                            aria-label="Tornado chart explanation"
                        >
                            <Info size={14} />
                        </button>
                    </div>
                    <div className="h-64 bg-slate-900 rounded-lg p-4 flex items-center justify-center">
                        <div className="w-full max-w-2xl h-full">
                            <TornadoChart data={tornadoData} />
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                    <button
                        onClick={() => setModifiers({ volumeMultiplier: 1, successRateMultiplier: 1, costMultiplier: 1, valueMultiplier: 1})}
                        className="text-xs text-slate-400 hover:text-white underline"
                    >
                        Reset Simulation
                    </button>
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}
