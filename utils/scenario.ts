/**
 * Validation and migration for saved scenarios.
 *
 * Scenarios enter the app from two untrusted places: a user-chosen JSON file, and
 * localStorage, which is whatever a previous version of this app (or the user's
 * devtools) left behind. Both used to be accepted on sight — the import checked
 * only Array.isArray. A malformed entry reached `scenario.results.roiPercentage
 * .toFixed()`, threw, and was persisted on the way through, so every subsequent
 * page load re-hydrated the same crash. The ErrorBoundary caught it; clearing site
 * data was the only way out.
 *
 * Nothing here is shared with the MCP server — it is browser-storage hygiene, not
 * calculation engine.
 */
import type { CalculationResults, ModelParams, Scenario, UseCaseInputs } from '../types';
import { ValueMethod } from '../types';
import { DEFAULT_INPUTS } from '../constants';
import { calculateROI } from './calculations';

/**
 * Bumped when a change to UseCaseInputs or CalculationResults would make an older
 * saved scenario read wrong rather than merely incomplete. Absent on everything
 * saved before this existed, which is exactly what the migration below assumes.
 */
export const SCENARIO_SCHEMA_VERSION = 1;

/**
 * Numeric result fields the scenario list and comparison view read directly.
 * Every one of them reaches a formatter that turns a missing value into "$NaN",
 * so the list has to match what those views actually render — including the two
 * that ScenarioComparison reads through string keys in `comparisonMetrics`
 * rather than as property accesses.
 */
const REQUIRED_RESULT_FIELDS = [
  'roiPercentage',
  'netMonthlyBenefit',
  'totalMonthlyCost',
  'totalMonthlyValue',
  'totalCostPerUnit',
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** `paybackMonths` is `number | string` — "Never" is a legitimate value, NaN is not. */
const isUsablePayback = (value: unknown): boolean =>
  isFiniteNumber(value) || (typeof value === 'string' && value.length > 0);

const VALUE_METHODS = Object.values(ValueMethod) as string[];

/**
 * Keep a stored value only when it has the same type as the default it replaces.
 *
 * A present-but-mistyped field is more dangerous than a missing one, because it
 * survives the arithmetic that would otherwise expose it: `monthlyVolume: null`
 * multiplies as 0 all the way through `calculateROI`, then throws on the
 * `.toLocaleString()` in the scenario list — after the entry has already been
 * persisted, so the crash returns on every reload.
 */
const coerce = (stored: unknown, fallback: unknown): unknown => {
  switch (typeof fallback) {
    case 'number':
      return isFiniteNumber(stored) ? stored : fallback;
    case 'string':
      return typeof stored === 'string' ? stored : fallback;
    case 'boolean':
      return typeof stored === 'boolean' ? stored : fallback;
    default:
      return fallback;
  }
};

/** Required ModelParams fields, i.e. the ones a default can be substituted for. */
const MODEL_REQUIRED_FIELDS = [
  'avgInputTokensPerUnit',
  'avgOutputTokensPerUnit',
  'pricePer1MInputTokens',
  'pricePer1MOutputTokens',
  'costPerCall',
  'useCallPricing',
] as const;

/**
 * Optional ModelParams fields. These are *not* inherited from the default slot:
 * a custom-priced model is defined by their absence, so borrowing the default
 * model's identity and published cache rates would attach catalog pricing to a
 * negotiated rate the user entered by hand.
 */
const MODEL_OPTIONAL_STRINGS = ['modelId', 'modelName', 'provider', 'pricedAt'] as const;
const MODEL_OPTIONAL_NUMBERS = [
  'cachedInputPricePer1M',
  'batchInputPricePer1M',
  'batchOutputPricePer1M',
] as const;

const migrateModel = (fallback: ModelParams, stored: unknown): ModelParams => {
  const source = isObject(stored) ? stored : {};
  const model = {} as Record<string, unknown>;

  for (const key of MODEL_REQUIRED_FIELDS) {
    model[key] = coerce(source[key], fallback[key]);
  }
  for (const key of MODEL_OPTIONAL_STRINGS) {
    if (typeof source[key] === 'string') model[key] = source[key];
  }
  for (const key of MODEL_OPTIONAL_NUMBERS) {
    // A null or string price here would slip past the `!== undefined` batch and
    // cache gates in calculateROI and silently price those tokens at zero.
    if (isFiniteNumber(source[key])) model[key] = source[key];
  }

  return model as unknown as ModelParams;
};

/**
 * Fill in fields added since the scenario was saved, and drop fields that are
 * present but the wrong type.
 *
 * A scenario written before `networkEgressCostPerUnit` existed simply lacks the key;
 * summing it produced NaN, which propagated through every metric and rendered as
 * "NaN%" with no error. The two model slots are merged too — a partial ModelParams
 * breaks Layer 1 the same way.
 *
 * Every field is rebuilt from the defaults rather than spread over them, so a key
 * this version does not know about is dropped instead of being carried into state.
 */
const migrateInputs = (stored: Record<string, unknown>): UseCaseInputs => {
  const merged = {} as Record<string, unknown>;

  for (const key of Object.keys(DEFAULT_INPUTS) as (keyof UseCaseInputs)[]) {
    merged[key] = coerce(stored[key], DEFAULT_INPUTS[key]);
  }

  // valueMethod is a string, so `coerce` alone would accept any string. An
  // unrecognised one falls through the switch in calculateROI and reports zero
  // value with no error at all.
  if (!VALUE_METHODS.includes(merged.valueMethod as string)) {
    merged.valueMethod = DEFAULT_INPUTS.valueMethod;
  }

  merged.primaryModel = migrateModel(DEFAULT_INPUTS.primaryModel, stored.primaryModel);
  merged.secondaryModel = migrateModel(DEFAULT_INPUTS.secondaryModel, stored.secondaryModel);

  return merged as unknown as UseCaseInputs;
};

/**
 * Repair a scenario, or reject it.
 *
 * Identity (id, name, createdAt) has to be present and well-typed — there is nothing
 * to reconstruct it from. Inputs are migrated rather than rejected, since that is the
 * whole point of versioning them. Results are recomputed only when they are actually
 * unusable: a saved scenario is the record of a decision at a point in time, so its
 * recorded figures are left alone whenever they are readable.
 */
export const parseScenario = (candidate: unknown): Scenario | null => {
  if (!isObject(candidate)) return null;
  if (typeof candidate.id !== 'string' || !candidate.id) return null;
  if (typeof candidate.name !== 'string' || !candidate.name) return null;
  if (!isFiniteNumber(candidate.createdAt)) return null;
  if (!isObject(candidate.inputs)) return null;

  const inputs = migrateInputs(candidate.inputs);

  const storedResults = isObject(candidate.results) ? candidate.results : undefined;
  const resultsAreUsable =
    storedResults !== undefined &&
    REQUIRED_RESULT_FIELDS.every(field => isFiniteNumber(storedResults[field])) &&
    isUsablePayback(storedResults.paybackMonths);

  const results = resultsAreUsable
    ? (storedResults as unknown as CalculationResults)
    : calculateROI(inputs);

  return {
    id: candidate.id,
    name: candidate.name,
    description: typeof candidate.description === 'string' ? candidate.description : undefined,
    color: typeof candidate.color === 'string' ? candidate.color : undefined,
    createdAt: candidate.createdAt,
    schemaVersion: SCENARIO_SCHEMA_VERSION,
    inputs,
    results,
  };
};

/**
 * Filter an untrusted list down to the scenarios that can safely be rendered.
 * Returns the survivors plus how many were dropped, so the caller can say so
 * rather than silently losing rows.
 */
export const parseScenarioList = (
  candidate: unknown
): { scenarios: Scenario[]; rejected: number } => {
  if (!Array.isArray(candidate)) return { scenarios: [], rejected: 0 };

  const scenarios = candidate
    .map(parseScenario)
    .filter((scenario): scenario is Scenario => scenario !== null);

  return { scenarios, rejected: candidate.length - scenarios.length };
};
