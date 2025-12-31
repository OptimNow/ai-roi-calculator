import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, X, Download, Upload, GitCompare } from 'lucide-react';
import { Scenario, UseCaseInputs, CalculationResults } from '../types';

interface ScenarioManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: UseCaseInputs;
  currentResults: CalculationResults;
  scenarios: Scenario[];
  onSaveScenario: (name: string, description?: string) => void;
  onLoadScenario: (scenario: Scenario) => void;
  onDeleteScenario: (id: string) => void;
  onExportScenarios: () => void;
  onImportScenarios: (scenarios: Scenario[]) => void;
  onCompareScenarios: (scenarioIds: string[]) => void;
}

const SCENARIO_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
];

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  isOpen,
  onClose,
  currentInputs,
  currentResults,
  scenarios,
  onSaveScenario,
  onLoadScenario,
  onDeleteScenario,
  onExportScenarios,
  onImportScenarios,
  onCompareScenarios,
}) => {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }
    onSaveScenario(scenarioName, scenarioDescription || undefined);
    setScenarioName('');
    setScenarioDescription('');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          onImportScenarios(imported);
        } else {
          alert('Invalid scenario file format');
        }
      } catch (error) {
        alert('Error importing scenarios');
      }
    };
    reader.readAsText(file);
  };

  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent to-green-400 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-charcoal p-2 rounded-lg">
              <FolderOpen size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal">Scenario Manager</h2>
              <p className="text-sm text-charcoal text-opacity-80">Save, compare, and manage calculation scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            aria-label="Close scenario manager"
          >
            <X size={24} className="text-charcoal" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Save Current Scenario */}
          <section className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center">
              <Save size={16} className="mr-2" />
              Save Current Scenario
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Scenario Name *</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="e.g., Conservative Estimate"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={scenarioDescription}
                  onChange={(e) => setScenarioDescription(e.target.value)}
                  placeholder="e.g., Lower success rate assumptions"
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Current: <strong>{currentInputs.useCaseName}</strong> | ROI: <strong className={currentResults.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>{currentResults.roiPercentage.toFixed(0)}%</strong>
              </div>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-accent text-charcoal font-semibold rounded-lg hover:bg-opacity-90 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Save Scenario</span>
              </button>
            </div>
          </section>

          {/* Saved Scenarios */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center">
                <FolderOpen size={16} className="mr-2" />
                Saved Scenarios ({scenarios.length})
              </h3>
              <div className="flex items-center space-x-2">
                {selectedScenarios.length >= 2 && (
                  <button
                    onClick={() => onCompareScenarios(selectedScenarios)}
                    className="px-3 py-1.5 text-xs font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-1"
                  >
                    <GitCompare size={14} />
                    <span>Compare ({selectedScenarios.length})</span>
                  </button>
                )}
                <label className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center space-x-1">
                  <Upload size={14} />
                  <span>Import</span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
                {scenarios.length > 0 && (
                  <button
                    onClick={onExportScenarios}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-1"
                  >
                    <Download size={14} />
                    <span>Export All</span>
                  </button>
                )}
              </div>
            </div>

            {scenarios.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm">No saved scenarios yet</p>
                <p className="text-slate-400 text-xs mt-1">Save your first scenario above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scenarios.map((scenario, index) => (
                  <div
                    key={scenario.id}
                    className={`bg-white rounded-lg border-2 p-4 transition-all ${
                      selectedScenarios.includes(scenario.id)
                        ? 'border-purple-500 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: scenario.color || SCENARIO_COLORS[index % SCENARIO_COLORS.length] }}
                        />
                        <h4 className="font-semibold text-slate-800">{scenario.name}</h4>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={() => toggleScenarioSelection(scenario.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                        aria-label="Select for comparison"
                      />
                    </div>
                    {scenario.description && (
                      <p className="text-xs text-slate-500 mb-2">{scenario.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-slate-500">ROI:</span>
                        <span className={`ml-1 font-semibold ${scenario.results.roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.results.roiPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Net Benefit:</span>
                        <span className="ml-1 font-semibold text-slate-700">{formatMoney(scenario.results.netMonthlyBenefit)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Volume:</span>
                        <span className="ml-1 font-semibold text-slate-700">{scenario.inputs.monthlyVolume.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Success:</span>
                        <span className="ml-1 font-semibold text-slate-700">{scenario.inputs.successRate}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 mb-3 border-t border-slate-100 pt-2">
                      {formatDate(scenario.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onLoadScenario(scenario)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-accent text-charcoal rounded hover:bg-opacity-90 transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => onDeleteScenario(scenario.id)}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        aria-label="Delete scenario"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
