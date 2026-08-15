import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, PencilLine, RefreshCw, Search } from 'lucide-react';

import { MoneyInput, NumberInput } from './InputComponents';
import { ModelParams } from '../types';
import {
  CatalogModel,
  ModelCatalog,
  PRICING_HUB_URL,
  SNAPSHOT_DATE,
  SNAPSHOT_MODELS,
  catalogModelToParams,
  fetchModelCatalog,
  toModelId,
} from '../utils/modelCatalog';

/**
 * Shared model catalog state: starts on the embedded snapshot, upgrades to
 * localStorage cache / live OptimToken data as soon as the fetch resolves.
 */
export const useModelCatalog = () => {
  const [catalog, setCatalog] = useState<ModelCatalog>({
    models: SNAPSHOT_MODELS,
    source: 'snapshot',
    pricedAt: SNAPSHOT_DATE,
  });
  const [loading, setLoading] = useState(false);
  /** False until the first resolve completes, so callers can avoid acting on the placeholder */
  const [settled, setSettled] = useState(false);

  const refresh = async (force = false) => {
    setLoading(true);
    try {
      setCatalog(await fetchModelCatalog(force));
    } finally {
      setLoading(false);
      setSettled(true);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { catalog, loading, settled, refresh };
};

const formatPrice = (v: number) => (v >= 1 ? `$${v.toFixed(2)}` : `$${v.toPrecision(2)}`);

const formatPricedAt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

interface CatalogStatusProps {
  catalog: ModelCatalog;
  loading: boolean;
  onRefresh: () => void;
}

/** Freshness line: where the prices come from and when they were published. */
export const CatalogStatus: React.FC<CatalogStatusProps> = ({ catalog, loading, onRefresh }) => (
  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
    <span>
      {catalog.source === 'live' ? 'Live prices' : catalog.source === 'cache' ? 'Cached prices' : 'Snapshot prices'}
      {' · '}
      <a
        href={PRICING_HUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline text-blue-500"
      >
        OptimToken
      </a>
      {' · '}{formatPricedAt(catalog.pricedAt)}
    </span>
    <button
      onClick={onRefresh}
      disabled={loading}
      className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
      title="Refresh prices from OptimToken"
      aria-label="Refresh model prices"
    >
      <RefreshCw size={11} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
    </button>
  </div>
);

interface ModelPickerProps {
  /** Slot label used for analytics and ARIA, e.g. "primary" | "secondary" */
  slot: string;
  value: ModelParams;
  catalog: ModelCatalog;
  onSelect: (patch: Partial<ModelParams>) => void;
}

/**
 * Searchable model selector fed by the OptimToken catalog. Selecting a model
 * fills the price fields (incl. published cache-read and batch rates) in one click;
 * "Custom pricing" keeps everything editable by hand.
 */
export const ModelPicker: React.FC<ModelPickerProps> = ({ slot, value, catalog, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.models;
    return catalog.models.filter(m => `${m.provider} ${m.model}`.toLowerCase().includes(q));
  }, [catalog.models, query]);

  const pick = (m: CatalogModel) => {
    (window as any).trackEvent?.('model_selected', { model_id: toModelId(m), slot });
    onSelect(catalogModelToParams(m, catalog.pricedAt));
    setOpen(false);
    setQuery('');
  };

  const pickCustom = () => {
    onSelect({
      modelId: undefined,
      modelName: undefined,
      provider: undefined,
      pricedAt: undefined,
      cachedInputPricePer1M: undefined,
      batchInputPricePer1M: undefined,
      batchOutputPricePer1M: undefined,
    });
    setOpen(false);
    setQuery('');
  };

  const isCustom = !value.modelId;

  return (
    <div ref={rootRef} className="relative mb-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Select ${slot} model`}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400 focus:ring-2 focus:ring-accent focus:outline-none"
      >
        <span className="flex items-center gap-2 min-w-0">
          {isCustom ? (
            <>
              <PencilLine size={13} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-slate-600">Custom pricing</span>
            </>
          ) : (
            <>
              <span className="font-medium text-slate-800 truncate">{value.modelName}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">{value.provider}</span>
            </>
          )}
        </span>
        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100">
            <Search size={13} className="text-slate-400 flex-shrink-0" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search model or provider…"
              aria-label="Search models"
              className="w-full text-sm focus:outline-none placeholder:text-slate-300"
            />
          </div>
          <ul role="listbox" aria-label="Model list" className="max-h-64 overflow-y-auto">
            <li role="option" aria-selected={isCustom}>
              <button
                type="button"
                onClick={pickCustom}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${isCustom ? 'bg-slate-50' : ''}`}
              >
                <PencilLine size={13} className="text-slate-400" aria-hidden="true" />
                <span className="text-slate-600">Custom pricing (enter manually)</span>
              </button>
            </li>
            {filtered.map(m => {
              const id = toModelId(m);
              const selected = value.modelId === id;
              return (
                <li key={id} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => pick(m)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${selected ? 'bg-accent bg-opacity-10' : ''}`}
                  >
                    <span className="min-w-0">
                      <span className="font-medium text-slate-800">{m.model}</span>
                      <span className="text-xs text-slate-400 ml-2">{m.provider}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-mono flex-shrink-0">
                      {formatPrice(m.inputPricePer1M)} / {formatPrice(m.outputPricePer1M)}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-xs text-slate-400">No model matches “{query}”.</li>
            )}
          </ul>
          <div className="px-3 py-1.5 border-t border-slate-100 text-[10px] text-slate-400">
            $ / 1M input · output tokens — prices from OptimToken
          </div>
        </div>
      )}
    </div>
  );
};

interface ModelCostInputsProps {
  slot: 'primary' | 'secondary';
  /** Heading shown above the picker */
  title: string;
  value: ModelParams;
  catalog: ModelCatalog;
  /** Model chosen from the catalog (or switched to custom pricing) */
  onSelect: (patch: Partial<ModelParams>) => void;
  /** Fields the user owns: token counts, cost per call */
  onParam: (field: keyof ModelParams, value: number) => void;
  /** Token prices — editing one detaches the catalog identity */
  onPrice: (field: 'pricePer1MInputTokens' | 'pricePer1MOutputTokens', value: number) => void;
  onBillingBasisChange: (useCallPricing: boolean) => void;
}

/**
 * One model slot: picker, billing basis, and the cost fields that basis implies.
 *
 * Billing basis is only offered on custom-priced models, because the OptimToken
 * catalog is entirely token-priced — a catalog model always has a $/1M rate. Per-call
 * billing is for flat-rate contracts and for services with no meaningful token count
 * (per page, per image, per minute of audio).
 */
export const ModelCostInputs: React.FC<ModelCostInputsProps> = ({
  slot,
  title,
  value,
  catalog,
  onSelect,
  onParam,
  onPrice,
  onBillingBasisChange,
}) => {
  const perCall = value.useCallPricing === true;
  // Hidden for catalog models, but always shown when per-call is already on, so an
  // imported scenario can never leave the user stuck in a mode with no way out.
  const showBasis = !value.modelId || perCall;

  const basisButton = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <h5 className="text-xs font-bold text-slate-900 mb-2">{title}</h5>
      <ModelPicker slot={slot} value={value} catalog={catalog} onSelect={onSelect} />

      {showBasis && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] text-slate-500">Billed</span>
          <div className="flex bg-slate-100 rounded-md p-0.5" role="group" aria-label={`${slot} model billing basis`}>
            {basisButton(!perCall, 'per token', () => onBillingBasisChange(false))}
            {basisButton(perCall, 'per call', () => onBillingBasisChange(true))}
          </div>
        </div>
      )}

      {perCall ? (
        <>
          <MoneyInput
            label="Cost per Call"
            value={value.costPerCall}
            onChange={v => onParam('costPerCall', v)}
            precision={4}
            tooltip="Flat price per request, whatever the token count. Use for per-page OCR, per-image generation, per-minute transcription, or a negotiated per-request rate."
          />
          <p className="text-[10px] text-slate-400 -mt-1 mb-1">
            Token counts, cache and batch discounts don't apply to a flat per-call rate.
          </p>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <NumberInput label="Avg Input Tokens" value={value.avgInputTokensPerUnit} onChange={v => onParam('avgInputTokensPerUnit', v)} />
            <NumberInput label="Avg Output Tokens" value={value.avgOutputTokensPerUnit} onChange={v => onParam('avgOutputTokensPerUnit', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MoneyInput label="$ / 1M Input" value={value.pricePer1MInputTokens} onChange={v => onPrice('pricePer1MInputTokens', v)} precision={4} />
            <MoneyInput label="$ / 1M Output" value={value.pricePer1MOutputTokens} onChange={v => onPrice('pricePer1MOutputTokens', v)} precision={4} />
          </div>
          {value.pricedAt && (
            <p className="text-[10px] text-slate-400 mt-1">
              {value.modelName} list prices as of {formatPricedAt(value.pricedAt)}. Editing a price switches to custom pricing.
            </p>
          )}
        </>
      )}
    </>
  );
};
