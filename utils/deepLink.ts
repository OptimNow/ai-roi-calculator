import type { UseCaseInputs } from '../types';
import { ValueMethod } from '../types';
import { DEFAULT_INPUTS, PRESETS } from '../constants';

/**
 * Deep links from the OptimToken (https://optimtoken.optimnow.io).
 *
 * The hub lets people compare per-request model costs for a business scenario;
 * this carries that scenario over so the calculator opens on the same footing:
 *
 *   /?useCase=supportTicket&volume=100000&model=anthropic/claude-haiku-4-5
 *
 * Everything is optional and independently validated — a malformed or unknown
 * value is ignored rather than failing the load.
 */

export interface DeepLinkParams {
  /** Calculator preset key, already mapped from the hub's own key */
  presetKey?: string;
  monthlyVolume?: number;
  modelId?: string;
  batchProcessing?: boolean;
}

/**
 * The hub's use-case keys, mapped to calculator preset keys. Most match already;
 * these two diverge because the presets predate the hub's naming.
 */
const HUB_USE_CASE_TO_PRESET: Record<string, string> = {
  supportTicket: 'support',
  invoiceProcessing: 'invoice',
};

/** Guards against absurd volumes from a hand-edited URL */
const MAX_VOLUME = 1_000_000_000;

const MODEL_ID_PATTERN = /^[a-z0-9-]{1,40}\/[a-z0-9-]{1,60}$/;

const parseVolume = (raw: string | null): number | undefined => {
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.min(Math.round(value), MAX_VOLUME);
};

const parseBoolean = (raw: string | null): boolean | undefined => {
  if (raw === null) return undefined;
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return undefined;
};

const parsePreset = (raw: string | null): string | undefined => {
  if (!raw) return undefined;
  const mapped = HUB_USE_CASE_TO_PRESET[raw] ?? raw;
  return PRESETS[mapped] ? mapped : undefined;
};

const parseModelId = (raw: string | null): string | undefined => {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  return MODEL_ID_PATTERN.test(value) ? value : undefined;
};

/** Read the supported parameters out of a query string. Unknown keys are ignored. */
export const parseDeepLink = (search: string): DeepLinkParams => {
  const params = new URLSearchParams(search);
  const result: DeepLinkParams = {};

  // "preset" is accepted as an alias so a calculator-native link works too
  const presetKey = parsePreset(params.get('useCase') ?? params.get('preset'));
  if (presetKey) result.presetKey = presetKey;

  const monthlyVolume = parseVolume(params.get('volume'));
  if (monthlyVolume !== undefined) result.monthlyVolume = monthlyVolume;

  const modelId = parseModelId(params.get('model'));
  if (modelId) result.modelId = modelId;

  const batchProcessing = parseBoolean(params.get('batch'));
  if (batchProcessing !== undefined) result.batchProcessing = batchProcessing;

  return result;
};

export const hasDeepLink = (params: DeepLinkParams): boolean =>
  Boolean(params.presetKey || params.monthlyVolume || params.modelId || params.batchProcessing !== undefined);

/**
 * Apply the parts that resolve synchronously: preset, volume and the batch toggle.
 * The model is applied separately, once the price catalog has loaded.
 */
export const applyDeepLink = (base: UseCaseInputs, params: DeepLinkParams): UseCaseInputs => {
  if (!hasDeepLink(params)) return base;

  let next: UseCaseInputs = params.presetKey
    ? ({ ...DEFAULT_INPUTS, ...PRESETS[params.presetKey] } as UseCaseInputs)
    : { ...base };

  if (params.monthlyVolume !== undefined) {
    next.monthlyVolume = params.monthlyVolume;
  }
  if (params.batchProcessing !== undefined) {
    next.batchProcessing = params.batchProcessing;
  }

  // Premium Monetization drives value off the subscriber count, which mirrors volume
  if (next.valueMethod === ValueMethod.PREMIUM_MONETIZATION) {
    next.subscribers = next.monthlyVolume;
  }

  return next;
};

/** Human-readable label for the loaded preset, for the confirmation banner. */
export const presetLabel = (presetKey: string | undefined): string | undefined =>
  presetKey ? PRESETS[presetKey]?.useCaseName : undefined;
