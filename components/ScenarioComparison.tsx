import React from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Scenario } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ScenarioComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  isOpen,
  onClose,
  scenarios,
}) => {
  if (!isOpen || scenarios.length < 2) return null;

  const formatMoney = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

  const formatNumber = (val: number) =>
    new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);

  // Prepare comparison data
  const comparisonMetrics = [
    { label: 'ROI %', key: 'roiPercentage', format: (v: number) => `${v.toFixed(1)}%` },
    { label: 'Monthly Benefit', key: 'netMonthlyBenefit', format: formatMoney },
    { label: 'Total Cost/Mo', key: 'totalMonthlyCost', format: formatMoney },
    { label: 'Total Value/Mo', key: 'totalMonthlyValue', format: formatMoney },
    { label: 'Cost per Unit', key: 'totalCostPerUnit', format: (v: number) => formatMoney(v) },
    { label: 'Payback (Mo)', key: 'paybackMonths', format: (v: any) => v },
  ];

  const inputMetrics = [
    { label: 'Monthly Volume', key: 'monthlyVolume', format: (v: number) => formatNumber(v) },
    { label: 'Success Rate', key: 'successRate', format: (v: number) => `${v}%` },
    { label: 'Deflection Rate', key: 'deflectionRate', format: (v: number) => `${v}%` },
  ];

  // Chart data for ROI comparison
  const chartData = scenarios.map(s => ({
    name: s.name,
    ROI: s.results.roiPercentage,
    'Net Benefit': s.results.netMonthlyBenefit / 1000, // in thousands
    Cost: s.results.totalMonthlyCost / 1000,
    Value: s.results.totalMonthlyValue / 1000,
  }));

  // Calculate differences (% change from first scenario)
  const getDifference = (base: number, current: number) => {
    if (base === 0) return null;
    const diff = ((current - base) / base) * 100;
    return diff;
  };

  const renderDiffIndicator = (diff: number | null) => {
    if (diff === null) return <Minus size={14} className="text-slate-400" />;
    if (Math.abs(diff) < 0.1) return <span className="text-xs text-slate-400">~</span>;
    if (diff > 0) {
      return (
        <span className="flex items-center text-green-600 text-xs">
          <TrendingUp size={14} className="mr-1" />
          +{diff.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="flex items-center text-red-600 text-xs">
        <TrendingDown size={14} className="mr-1" />
        {diff.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Scenario Comparison</h2>
            <p className="text-sm text-white text-opacity-90">Comparing {scenarios.length} scenarios side-by-side</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            aria-label="Close comparison"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Visual Comparison Chart */}
          <section className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-700 uppercase mb-4">Visual Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => formatMoney(value * 1000)} />
                  <Legend />
                  <Bar dataKey="Net Benefit" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Results Comparison Table */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Results Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Metric</th>
                    {scenarios.map((scenario, index) => (
                      <th key={scenario.id} className="px-4 py-3 text-center font-medium text-slate-600">
                        <div className="flex items-center justify-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: scenario.color || `hsl(${index * 360 / scenarios.length}, 70%, 50%)` }}
                          />
                          <span>{scenario.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonMetrics.map((metric) => (
                    <tr key={metric.key} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{metric.label}</td>
                      {scenarios.map((scenario, index) => {
                        const value = (scenario.results as any)[metric.key];
                        const baseValue = (scenarios[0].results as any)[metric.key];
                        const diff = typeof value === 'number' ? getDifference(baseValue, value) : null;

                        return (
                          <td key={scenario.id} className="px-4 py-3 text-center">
                            <div className="font-semibold text-slate-800">{metric.format(value)}</div>
                            {index > 0 && <div className="mt-1">{renderDiffIndicator(diff)}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Input Parameters Comparison */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 uppercase">Input Parameters</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">Parameter</th>
                    {scenarios.map((scenario) => (
                      <th key={scenario.id} className="px-4 py-3 text-center font-medium text-slate-600">
                        {scenario.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inputMetrics.map((metric) => (
                    <tr key={metric.key} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-700">{metric.label}</td>
                      {scenarios.map((scenario) => {
                        const value = (scenario.inputs as any)[metric.key];
                        return (
                          <td key={scenario.id} className="px-4 py-3 text-center text-slate-800">
                            {metric.format(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50">
          <p className="text-xs text-slate-500">
            Percentages show change relative to <strong>{scenarios[0].name}</strong>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
