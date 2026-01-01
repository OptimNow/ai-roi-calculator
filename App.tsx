import React, { useState, useMemo, useEffect } from 'react';
import { Download, Copy, RefreshCw, Settings, Calculator, HelpCircle, FolderOpen, Info } from 'lucide-react';

import { UseCaseInputs, CalculationResults, ValueMethod, SensitivityModifiers, ModelParams, Scenario } from './types';
import { DEFAULT_INPUTS, PRESETS, DEFAULT_MODEL_PARAMS } from './constants';
import { calculateROI } from './utils/calculations';
import { MoneyInput, NumberInput, PercentInput, SectionHeader } from './components/InputComponents';
import { HelpGuide } from './components/HelpGuide';
import { CostValueChart, CostBreakdownChart, ROICurveChart } from './components/Charts';
import { ScenarioManager } from './components/ScenarioManager';
import { ScenarioComparison } from './components/ScenarioComparison';

const formatMoney = (val: number, decimals = 2) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);

const formatNumber = (val: number) => 
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

const SCENARIOS_STORAGE_KEY = 'ai-roi-calculator-scenarios';

export default function App() {
  const [inputs, setInputs] = useState<UseCaseInputs>(DEFAULT_INPUTS);
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
    general: true,
    layer1: true,
    layer2: true,
    layer3: true,
    fixed: false
  });

  // Load scenarios from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCENARIOS_STORAGE_KEY);
      if (saved) {
        setScenarios(JSON.parse(saved));
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

  const toggleSection = (key: string) => setExpandedSections(prev => ({...prev, [key]: !prev[key]}));

  const results = useMemo(() => calculateROI(inputs, modifiers), [inputs, modifiers]);

  const updateInput = (field: keyof UseCaseInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const updateModelParam = (model: 'primaryModel' | 'secondaryModel', field: keyof ModelParams, value: any) => {
    setInputs(prev => ({
      ...prev,
      [model]: { ...prev[model], [field]: value }
    }));
  };

  const loadPreset = (key: string) => {
    if (PRESETS[key]) {
      setInputs(prev => ({ ...prev, ...PRESETS[key] }));
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ inputs, results }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roi-calculator-${inputs.useCaseName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
  };

  const handleCopyMarkdown = () => {
    const md = `
# AI ROI Analysis: ${inputs.useCaseName}

## Summary
- **Monthly Net Benefit**: ${formatMoney(results.netMonthlyBenefit, 0)}
- **ROI**: ${results.roiPercentage.toFixed(1)}%
- **Payback Period**: ${results.paybackMonths} months
- **Cost per Unit**: ${formatMoney(results.totalCostPerUnit, 4)}
- **Value per Unit**: ${formatMoney(results.grossValuePerUnit, 4)}

## Inputs
- Volume: ${formatNumber(inputs.monthlyVolume)} ${inputs.unitName}s/mo
- Success Rate: ${inputs.successRate}%
- Model: Simple/Complex split ${inputs.routingSimplePercent}% / ${100 - inputs.routingSimplePercent}%
    `.trim();
    navigator.clipboard.writeText(md);
    alert('Summary copied to clipboard!');
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

  const handleImportScenarios = (importedScenarios: Scenario[]) => {
    setScenarios([...scenarios, ...importedScenarios]);
    alert(`Imported ${importedScenarios.length} scenario(s) successfully!`);
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
  const chartDataMonthly = [
    { name: 'Cost', value: results.totalMonthlyCost, fill: '#ef4444' },
    { name: 'Value', value: results.totalMonthlyValue, fill: '#22c55e' },
  ];

  const pieDataCost = [
    { name: 'Model (L1)', value: results.layer1MonthlyCost },
    { name: 'Harness (L2)', value: results.layer2MonthlyCost - results.layer1MonthlyCost },
    { name: 'Fixed (Amort)', value: results.monthlyAmortizedFixedCost },
  ];
  const COLORS = ['#3b82f6', '#8b5cf6', '#64748b'];

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Help Guide Modal */}
      <HelpGuide isOpen={showHelp} onClose={() => setShowHelp(false)} />

      {/* Scenario Manager Modal */}
      <ScenarioManager
        isOpen={showScenarios}
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

      {/* Scenario Comparison Modal */}
      <ScenarioComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        scenarios={selectedScenarios}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center">
            <a
              href="https://www.optimnow.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              aria-label="Visit OptimNow website"
            >
              <img
                src="/images/Logo.png"
                alt="OptimNow Logo"
                className="h-10 w-auto object-contain max-w-[180px]"
                onError={(e) => {
                  console.error('Logo failed to load from:', e.currentTarget.src);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </a>
          </div>

          {/* Center: Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
            <div className="bg-accent text-charcoal p-2 rounded-lg">
              <Calculator size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight whitespace-nowrap">AI ROI Calculator</h1>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center space-x-3" role="toolbar" aria-label="Calculator controls">
             <div className="flex bg-slate-100 rounded-lg p-1" role="group" aria-label="Display mode toggle">
                <button
                  onClick={() => setMode('simple')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'simple' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={mode === 'simple'}
                  aria-label="Switch to simple mode"
                >
                  Simple
                </button>
                <button
                  onClick={() => setMode('advanced')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${mode === 'advanced' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  aria-pressed={mode === 'advanced'}
                  aria-label="Switch to advanced mode"
                >
                  Advanced
                </button>
             </div>
            <button
              onClick={() => setShowScenarios(true)}
              className="p-2 text-slate-500 hover:bg-accent hover:bg-opacity-10 rounded-md transition-colors relative"
              title="Manage Scenarios"
              aria-label="Open scenario manager"
            >
              <FolderOpen size={20} aria-hidden="true" />
              {scenarios.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-charcoal text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {scenarios.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="p-2 text-slate-500 hover:bg-accent hover:bg-opacity-10 rounded-md transition-colors"
              title="How to Fill the Calculator"
              aria-label="Open help guide"
            >
              <HelpCircle size={20} aria-hidden="true" />
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
              title="Copy Summary"
              aria-label="Copy summary to clipboard"
            >
              <Copy size={18} aria-hidden="true" />
            </button>
            <button
              onClick={handleExportJSON}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-md"
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
        <div className="lg:col-span-5 space-y-6 overflow-y-auto h-full pr-2">
          
          {/* Preset Loader */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Load Example Profile</h3>
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
                onClick={() => setInputs(DEFAULT_INPUTS)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-accent hover:bg-accent hover:bg-opacity-10 transition-colors ml-auto rounded-md"
                title="Reset to defaults"
                aria-label="Reset calculator to default values"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             
            {/* General Inputs */}
             <SectionHeader title="1. General Parameters" isOpen={expandedSections.general} onToggle={() => toggleSection('general')} />
             {expandedSections.general && <div className="p-5 border-b border-slate-100">
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
                 <div className="grid grid-cols-2 gap-4">
                    <PercentInput
                      label="Success Rate"
                      value={inputs.successRate}
                      onChange={v => updateInput('successRate', v)}
                      tooltip="Percentage of AI attempts that produce usable output (not quality of output). Example: 90% means 9/10 attempts work, 1/10 fails completely. This is INDEPENDENT of deflection/review rates - an AI can successfully generate output that still needs human review."
                    />
                    <NumberInput
                      label="Analysis Months"
                      value={inputs.analysisHorizonMonths}
                      onChange={v => updateInput('analysisHorizonMonths', v)}
                      tooltip="Analysis horizon for ROI calculation and fixed cost amortization. Longer periods reduce monthly amortized costs, improving ROI. Does NOT affect monthly metrics like Net Benefit."
                    />
                 </div>
               </div>
             </div>}

             {/* Layer 1 */}
             <SectionHeader title="2. Infrastructure (Layer 1)" isOpen={expandedSections.layer1} onToggle={() => toggleSection('layer1')} />
             {expandedSections.layer1 && <div className="p-5 border-b border-slate-100">
                {mode === 'advanced' && (
                   <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Model Routing Strategy</h4>
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs text-slate-500">Simple Model</span>
                         <span className="text-xs font-bold text-accent">{inputs.routingSimplePercent}%</span>
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
                        <h5 className="text-xs font-bold text-slate-900 mb-2">{mode === 'advanced' ? 'Primary Model (Simple)' : 'Model Parameters'}</h5>
                        <div className="grid grid-cols-2 gap-3">
                            <NumberInput label="Avg Input Tokens" value={inputs.primaryModel.avgInputTokensPerUnit} onChange={v => updateModelParam('primaryModel', 'avgInputTokensPerUnit', v)} />
                            <NumberInput label="Avg Output Tokens" value={inputs.primaryModel.avgOutputTokensPerUnit} onChange={v => updateModelParam('primaryModel', 'avgOutputTokensPerUnit', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <MoneyInput label="$ / 1M Input" value={inputs.primaryModel.pricePer1MInputTokens} onChange={v => updateModelParam('primaryModel', 'pricePer1MInputTokens', v)} precision={4} />
                            <MoneyInput label="$ / 1M Output" value={inputs.primaryModel.pricePer1MOutputTokens} onChange={v => updateModelParam('primaryModel', 'pricePer1MOutputTokens', v)} precision={4} />
                        </div>
                    </div>

                    {mode === 'advanced' && inputs.routingSimplePercent < 100 && (
                        <div className="border-l-2 border-purple-500 pl-3 mt-4 pt-4 border-t border-dashed border-slate-200">
                            <h5 className="text-xs font-bold text-slate-900 mb-2">Secondary Model (Complex)</h5>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberInput label="Avg Input Tokens" value={inputs.secondaryModel.avgInputTokensPerUnit} onChange={v => updateModelParam('secondaryModel', 'avgInputTokensPerUnit', v)} />
                                <NumberInput label="Avg Output Tokens" value={inputs.secondaryModel.avgOutputTokensPerUnit} onChange={v => updateModelParam('secondaryModel', 'avgOutputTokensPerUnit', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <MoneyInput label="$ / 1M Input" value={inputs.secondaryModel.pricePer1MInputTokens} onChange={v => updateModelParam('secondaryModel', 'pricePer1MInputTokens', v)} precision={4} />
                                <MoneyInput label="$ / 1M Output" value={inputs.secondaryModel.pricePer1MOutputTokens} onChange={v => updateModelParam('secondaryModel', 'pricePer1MOutputTokens', v)} precision={4} />
                            </div>
                        </div>
                    )}

                    {mode === 'advanced' && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                             <PercentInput label="Cache Hit Rate" value={inputs.cacheHitRate} onChange={v => updateInput('cacheHitRate', v)} />
                             <PercentInput label="Cache Discount" value={inputs.cachedTokenDiscount} onChange={v => updateInput('cachedTokenDiscount', v)} />
                        </div>
                    )}
                </div>
             </div>}

             {/* Layer 2 */}
             <SectionHeader title="3. Harness (Layer 2)" isOpen={expandedSections.layer2} onToggle={() => toggleSection('layer2')} />
             {expandedSections.layer2 && <div className="p-5 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                    <MoneyInput label="Orchestration Cost" value={inputs.orchestrationCostPerUnit} onChange={v => updateInput('orchestrationCostPerUnit', v)} precision={4} tooltip="Cost per unit for logic/chains" />
                    <MoneyInput label="Retrieval / Vector DB" value={inputs.retrievalCostPerUnit} onChange={v => updateInput('retrievalCostPerUnit', v)} precision={4} />
                </div>
                {mode === 'advanced' && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                         <MoneyInput label="Tool APIs" value={inputs.toolApiCostPerUnit} onChange={v => updateInput('toolApiCostPerUnit', v)} precision={4} />
                         <MoneyInput label="Logging / Monitoring" value={inputs.loggingMonitoringCostPerUnit} onChange={v => updateInput('loggingMonitoringCostPerUnit', v)} precision={4} />
                         <MoneyInput label="Safety / Guardrails" value={inputs.safetyGuardrailsCostPerUnit} onChange={v => updateInput('safetyGuardrailsCostPerUnit', v)} precision={4} />
                         <MoneyInput label="Storage" value={inputs.storageCostPerUnit} onChange={v => updateInput('storageCostPerUnit', v)} precision={4} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                    <PercentInput label="Retry Rate" value={inputs.retryRate * 100} onChange={v => updateInput('retryRate', v/100)} tooltip="Percentage of calls that need a retry" />
                    <NumberInput label="Overhead Multiplier" value={inputs.overheadMultiplier} onChange={v => updateInput('overheadMultiplier', v)} step={0.05} tooltip="Generic multiplier (e.g. 1.1 for 10% misc overhead)" />
                </div>
             </div>}

             {/* Layer 3: Value */}
             <SectionHeader title="4. Value Definition (Layer 3)" isOpen={expandedSections.layer3} onToggle={() => toggleSection('layer3')} />
             {expandedSections.layer3 && <div className="p-5 border-b border-slate-100">
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Value Method</label>
                    <select 
                      value={inputs.valueMethod}
                      onChange={(e) => updateInput('valueMethod', e.target.value as ValueMethod)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                    >
                        {Object.values(ValueMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {inputs.valueMethod === ValueMethod.COST_DISPLACEMENT && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <MoneyInput label="Baseline Human Cost" value={inputs.baselineHumanCostPerUnit} onChange={v => updateInput('baselineHumanCostPerUnit', v)} />
                        <div className="grid grid-cols-2 gap-3">
                            <PercentInput label="Deflection Rate" value={inputs.deflectionRate} onChange={v => updateInput('deflectionRate', v)} />
                            <PercentInput label="Residual Review Rate" value={inputs.residualHumanReviewRate} onChange={v => updateInput('residualHumanReviewRate', v)} />
                        </div>
                        {inputs.residualHumanReviewRate > 0 && (
                            <MoneyInput label="Review Cost (Unit)" value={inputs.residualReviewCostPerUnit} onChange={v => updateInput('residualReviewCostPerUnit', v)} />
                        )}
                    </div>
                )}

                {inputs.valueMethod === ValueMethod.REVENUE_UPLIFT && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                         <div className="grid grid-cols-2 gap-3">
                            <PercentInput label="Baseline Conversion" value={inputs.baselineConversionRate} onChange={v => updateInput('baselineConversionRate', v)} />
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
                        <MoneyInput label="Non-AI COGS / Sub" value={inputs.nonAiCOGSPerSubscriber} onChange={v => updateInput('nonAiCOGSPerSubscriber', v)} />
                    </div>
                )}
             </div>}

             {/* Fixed Costs */}
             <SectionHeader title="One-time Costs" isOpen={expandedSections.fixed} onToggle={() => toggleSection('fixed')} />
             {expandedSections.fixed && <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                     <MoneyInput label="Integration" value={inputs.integrationCost} onChange={v => updateInput('integrationCost', v)} precision={0} />
                     <MoneyInput label="Training / Tuning" value={inputs.trainingTuningCost} onChange={v => updateInput('trainingTuningCost', v)} precision={0} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                     <MoneyInput label="Change Mgmt" value={inputs.changeManagementCost} onChange={v => updateInput('changeManagementCost', v)} precision={0} />
                     <NumberInput label="Amortization (Mo)" value={inputs.amortizationMonths} onChange={v => updateInput('amortizationMonths', v)} />
                </div>
             </div>}
          </div>
        </div>

        {/* --- RIGHT COLUMN: RESULTS --- */}
        <div className="lg:col-span-7 space-y-6" role="region" aria-label="Calculation results">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="group" aria-label="Key performance indicators">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" role="article" aria-label="ROI metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase" id="roi-label">ROI</span>
                      <button
                        className="text-slate-300 hover:text-accent transition-colors"
                        title="Return on Investment: Calculated over your Analysis Months period. Shows total value minus total costs, divided by total costs."
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
                    <span className="text-[10px] text-slate-400">Over {inputs.analysisHorizonMonths} months</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" role="article" aria-label="Net benefit metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase" id="netbenefit-label">Net Benefit</span>
                      <button
                        className="text-slate-300 hover:text-accent transition-colors"
                        title="Net Monthly Benefit: Total monthly value generated minus total monthly costs. This is your profit per month."
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" role="article" aria-label="Payback period metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase" id="payback-label">Payback</span>
                      <button
                        className="text-slate-300 hover:text-accent transition-colors"
                        title="Payback Period: How many months until cumulative profits cover your fixed costs (integration, training, change management)."
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" role="article" aria-label="Unit cost metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase" id="unitcost-label">Unit Cost</span>
                      <button
                        className="text-slate-300 hover:text-accent transition-colors"
                        title="Cost per Unit: Average total cost per transaction, including model inference, harness costs, and amortized fixed costs."
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
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between" role="article" aria-label="Break-even metric">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase" id="breakeven-label">Break-even</span>
                      <button
                        className="text-slate-300 hover:text-accent transition-colors"
                        title="Break-even Volume: The monthly volume needed for your net benefit to reach $0 (where value equals total costs). This threshold is constant regardless of current volume."
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
                        ? `${inputs.unitName}s/mo needed`
                        : 'Negative margin'}
                    </span>
                </div>
            </div>

            {/* Break-even Insight Card */}
            {results.breakEvenVolume !== undefined && results.netMonthlyBenefit < 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900">Break-even Analysis</h4>
                  <p className="text-sm text-amber-800 mt-1">
                    You need <strong>{formatNumber(results.breakEvenVolume - results.effectiveMonthlyVolume)}</strong> more {inputs.unitName}s per month
                    ({((results.breakEvenVolume / results.effectiveMonthlyVolume - 1) * 100).toFixed(1)}% increase) to reach break-even.
                  </p>
                </div>
              </div>
            )}

            {results.breakEvenVolume !== undefined && results.netMonthlyBenefit >= 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-green-900">Above Break-even</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your current volume of <strong>{formatNumber(results.effectiveMonthlyVolume)}</strong> {inputs.unitName}s is already profitable.
                    Break-even threshold: <strong>{formatNumber(results.breakEvenVolume)}</strong> {inputs.unitName}s/mo.
                  </p>
                </div>
              </div>
            )}

            {/* ROI Curve - Profit Over Time */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase">ROI Curve: Cumulative Profit Over Time</h3>
                  <button
                    className="text-slate-300 hover:text-accent transition-colors"
                    title="ROI Curve: Shows how cumulative profit evolves over your analysis period. The vertical chartreuse line marks when you break even (cumulative profit = $0)."
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase mb-6">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
                    <CostValueChart data={chartDataMonthly} formatMoney={formatMoney} />
                    <CostBreakdownChart data={pieDataCost} colors={COLORS} />
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700 uppercase">Unit Economics</h3>
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
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center space-x-2 mb-4">
                    <Settings size={18} className="text-accent" />
                    <h3 className="text-sm font-bold uppercase tracking-wider">Sensitivity Simulator</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-slate-400">Volume</span>
                            <span className="font-mono text-accent">x{modifiers.volumeMultiplier}</span>
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
                            <span className="text-slate-400">Success Rate</span>
                            <span className="font-mono text-accent">x{modifiers.successRateMultiplier}</span>
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
                            <span className="font-mono text-accent">x{modifiers.costMultiplier}</span>
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
                            <span className="font-mono text-accent">x{modifiers.valueMultiplier}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="2.0" step="0.1"
                            value={modifiers.valueMultiplier}
                            onChange={(e) => setModifiers({...modifiers, valueMultiplier: parseFloat(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-accent"
                        />
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