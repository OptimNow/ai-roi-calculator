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
import type { CalculationResults, Scenario, UseCaseInputs } from '../types';
import { DEFAULT_INPUTS } from '../constants';
import { calculateROI } from './calculations';

/**
 * Bumped when a change to UseCaseInputs or CalculationResults would make an older
 * saved scenario read wrong rather than merely incomplete. Absent on everything
 * saved before this existed, which is exactly what the migration below assumes.
 */
export const SCENARIO_SCHEMA_VERSION = 1;

/** Result fields the scenario list and comparison view read directly. */
const REQUIRED_RESULT_FIELDS = [
  'roiPercentage',
  'netMonthlyBenefit',
  'totalMonthlyCost',
  'totalMonthlyValue',
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * Fill in fields added since the scenario was saved.
 *
 * A scenario written before `networkEgressCostPerUnit` existed simply lacks the key;
 * summing it produced NaN, which propagated through every metric and rendered as
 * "NaN%" with no error. The two model slots are merged too — a partial ModelParams
 * breaks Layer 1 the same way.
 */
const migrateInputs = (stored: Record<string, unknown>): UseCaseInputs => {
  const merged = { ...DEFAULT_INPUTS, ...stored } as UseCaseInputs;
  merged.primaryModel = {
    ...DEFAULT_INPUTS.primaryModel,
    ...(isObject(stored.primaryModel) ? stored.primaryModel : {}),
  };
  merged.secondaryModel = {
    ...DEFAULT_INPUTS.secondaryModel,
    ...(isObject(stored.secondaryModel) ? stored.secondaryModel : {}),
  };
  return merged;
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
    REQUIRED_RESULT_FIELDS.every(field => isFiniteNumber(storedResults[field]));

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
