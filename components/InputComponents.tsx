import React from 'react';

interface BaseProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  tooltip?: string;
  disabled?: boolean;
}

export const NumberInput: React.FC<BaseProps & { step?: number, min?: number }> = ({ label, value, onChange, tooltip, disabled, step = 1, min = 0 }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {tooltip && <span className="text-xs text-slate-400 cursor-help" title={tooltip}>?</span>}
    </div>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
      step={step}
      min={min}
      disabled={disabled}
    />
  </div>
);

export const MoneyInput: React.FC<BaseProps & { precision?: number }> = ({ label, value, onChange, tooltip, disabled, precision = 2 }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {tooltip && <span className="text-xs text-slate-400 cursor-help" title={tooltip}>?</span>}
    </div>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-slate-500 sm:text-sm">$</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full pl-7 pr-3 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
        step={1 / Math.pow(10, precision)}
        min="0"
        disabled={disabled}
      />
    </div>
  </div>
);

export const PercentInput: React.FC<BaseProps> = ({ label, value, onChange, tooltip, disabled }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {tooltip && <span className="text-xs text-slate-400 cursor-help" title={tooltip}>?</span>}
    </div>
    <div className="relative">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
        step="0.1"
        disabled={disabled}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-slate-500 sm:text-sm">%</span>
      </div>
    </div>
  </div>
);

export const SectionHeader: React.FC<{ title: string; onToggle?: () => void; isOpen?: boolean }> = ({ title, onToggle, isOpen }) => (
    <div className="flex items-center justify-between bg-slate-100 px-4 py-3 rounded-t-lg border-b border-slate-200 mt-6 cursor-pointer" onClick={onToggle}>
        <h3 className="text-sm font-bold text-slate-700 uppercase">{title}</h3>
        {onToggle && <span className="text-slate-500 text-xs">{isOpen ? '▼' : '▶'}</span>}
    </div>
);