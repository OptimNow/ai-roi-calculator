import { describe, it, expect } from 'vitest';
import { SCENARIO_SCHEMA_VERSION, parseScenario, parseScenarioList } from './scenario';
import { DEFAULT_INPUTS } from '../constants';
import { calculateROI } from './calculations';
import type { Scenario } from '../types';

const validScenario = (): Scenario => ({
  id: 'scenario-1',
  name: 'Baseline',
  inputs: { ...DEFAULT_INPUTS },
  results: calculateROI(DEFAULT_INPUTS),
  createdAt: 1_700_000_000_000,
});

describe('parseScenario', () => {
  it('accepts a well-formed scenario and stamps the schema version', () => {
    const parsed = parseScenario(validScenario());

    expect(parsed).not.toBeNull();
    expect(parsed!.name).toBe('Baseline');
    expect(parsed!.schemaVersion).toBe(SCENARIO_SCHEMA_VERSION);
  });

  it('preserves the recorded results of a valid scenario rather than recomputing', () => {
    const scenario = validScenario();
    // A scenario is the record of a decision at a point in time; loading it must not
    // silently reprice it against today's engine.
    scenario.results = { ...scenario.results, roiPercentage: 123.45 };

    expect(parseScenario(scenario)!.results.roiPercentage).toBe(123.45);
  });

  it.each([
    ['not an object', 42],
    ['null', null],
    ['an array', []],
    ['missing id', { name: 'x', createdAt: 1, inputs: {}, results: {} }],
    ['missing name', { id: 'a', createdAt: 1, inputs: {}, results: {} }],
    ['a non-numeric createdAt', { id: 'a', name: 'x', createdAt: 'yesterday', inputs: {}, results: {} }],
    ['missing inputs', { id: 'a', name: 'x', createdAt: 1, results: {} }],
  ])('rejects %s', (_label, candidate) => {
    expect(parseScenario(candidate)).toBeNull();
  });

  it('backfills input fields added since the scenario was saved', () => {
    const scenario = validScenario();
    // Saved before networkEgressCostPerUnit existed. Summing the missing key used to
    // produce NaN, which propagated to every metric and rendered as "NaN%".
    delete (scenario.inputs as Partial<typeof scenario.inputs>).networkEgressCostPerUnit;

    const parsed = parseScenario(scenario);

    expect(parsed!.inputs.networkEgressCostPerUnit).toBe(DEFAULT_INPUTS.networkEgressCostPerUnit);
    expect(Number.isFinite(calculateROI(parsed!.inputs).totalMonthlyCost)).toBe(true);
  });

  it('backfills a partial model slot', () => {
    const scenario = validScenario();
    scenario.inputs = {
      ...scenario.inputs,
      primaryModel: { modelName: 'Something old' } as typeof scenario.inputs.primaryModel,
    };

    const parsed = parseScenario(scenario);

    expect(parsed!.inputs.primaryModel.modelName).toBe('Something old');
    expect(parsed!.inputs.primaryModel.pricePer1MInputTokens).toBe(
      DEFAULT_INPUTS.primaryModel.pricePer1MInputTokens
    );
    expect(Number.isFinite(calculateROI(parsed!.inputs).layer1CostPerUnit)).toBe(true);
  });

  it('recomputes results that are missing or unreadable', () => {
    const scenario = validScenario();
    scenario.results = { roiPercentage: Number.NaN } as unknown as typeof scenario.results;

    const parsed = parseScenario(scenario);

    expect(Number.isFinite(parsed!.results.roiPercentage)).toBe(true);
    expect(parsed!.results.roiPercentage).toBeCloseTo(
      calculateROI(DEFAULT_INPUTS).roiPercentage,
      6
    );
  });
});

describe('parseScenarioList', () => {
  it('keeps the readable entries and counts the rest', () => {
    const { scenarios, rejected } = parseScenarioList([
      validScenario(),
      1,
      { id: 'no-name', createdAt: 1, inputs: {}, results: {} },
      { ...validScenario(), id: 'scenario-2' },
    ]);

    expect(scenarios.map(s => s.id)).toEqual(['scenario-1', 'scenario-2']);
    expect(rejected).toBe(2);
  });

  it('rejects the whole payload when it is not an array', () => {
    expect(parseScenarioList({ id: 'a' })).toEqual({ scenarios: [], rejected: 0 });
  });

  it('drops an entry that would crash the scenario list on render', () => {
    // The exact shape that used to reach scenario.results.roiPercentage.toFixed()
    // and then survive in localStorage, breaking every subsequent page load.
    const { scenarios, rejected } = parseScenarioList([{ id: 'a', name: 'b', createdAt: 0 }]);

    expect(scenarios).toEqual([]);
    expect(rejected).toBe(1);
  });
});
