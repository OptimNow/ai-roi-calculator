import { ModelCatalog, SNAPSHOT_MODELS, repriceModelParams, repriceModels, toModelId } from './modelCatalog';
import { ModelParams } from '../types';
import { DEFAULT_INPUTS, PRESETS } from '../constants';

const catalog: ModelCatalog = {
  source: 'live',
  pricedAt: '2026-09-20T05:00:00.000Z',
  models: [
    {
      provider: 'Anthropic',
      model: 'Claude Haiku 4.5',
      inputPricePer1M: 0.8, // cheaper than the embedded snapshot's 1.0
      outputPricePer1M: 4,
      batchInputPricePer1M: 0.4,
      batchOutputPricePer1M: 2,
      cachedInputPricePer1M: 0.08,
      contextWindow: '200K',
      category: 'Mid-tier',
      eloScore: 1392,
    },
  ],
};

const snapshotHaiku: ModelParams = {
  avgInputTokensPerUnit: 1500,
  avgOutputTokensPerUnit: 500,
  pricePer1MInputTokens: 1,
  pricePer1MOutputTokens: 5,
  costPerCall: 0.005,
  useCallPricing: false,
  modelId: 'anthropic/claude-haiku-4-5',
  modelName: 'Claude Haiku 4.5',
  provider: 'Anthropic',
  pricedAt: '2026-08-14',
  cachedInputPricePer1M: 0.1,
  batchInputPricePer1M: 0.5,
  batchOutputPricePer1M: 2.5,
};

describe('toModelId', () => {
  it('should match the hub model page slugs', () => {
    expect(toModelId({ provider: 'Anthropic', model: 'Claude Haiku 4.5' })).toBe('anthropic/claude-haiku-4-5');
    expect(toModelId({ provider: 'DeepSeek', model: 'DeepSeek V4 Flash 0423' })).toBe('deepseek/deepseek-v4-flash-0423');
  });
});

describe('repriceModelParams', () => {
  it('should lift snapshot prices to the current catalog', () => {
    const result = repriceModelParams(snapshotHaiku, catalog);

    expect(result.pricePer1MInputTokens).toBe(0.8);
    expect(result.pricePer1MOutputTokens).toBe(4);
    expect(result.cachedInputPricePer1M).toBe(0.08);
    expect(result.batchInputPricePer1M).toBe(0.4);
    expect(result.pricedAt).toBe('2026-09-20T05:00:00.000Z');
  });

  it('should keep the token counts the user entered', () => {
    const edited = { ...snapshotHaiku, avgInputTokensPerUnit: 4200, avgOutputTokensPerUnit: 130 };
    const result = repriceModelParams(edited, catalog);

    expect(result.avgInputTokensPerUnit).toBe(4200);
    expect(result.avgOutputTokensPerUnit).toBe(130);
  });

  it('should never touch a custom-priced model', () => {
    const custom: ModelParams = {
      avgInputTokensPerUnit: 1000,
      avgOutputTokensPerUnit: 500,
      pricePer1MInputTokens: 0.42, // negotiated rate
      pricePer1MOutputTokens: 1.11,
      costPerCall: 0.005,
      useCallPricing: false,
    };

    expect(repriceModelParams(custom, catalog)).toBe(custom);
  });

  it('should keep last known prices when the model left the catalog', () => {
    const retired = { ...snapshotHaiku, modelId: 'openai/gpt-3-5-turbo' };

    expect(repriceModelParams(retired, catalog)).toBe(retired);
  });

  it('should return the same reference when prices already match', () => {
    const current = repriceModelParams(snapshotHaiku, catalog);

    expect(repriceModelParams(current, catalog)).toBe(current);
  });
});

describe('repriceModels', () => {
  it('should reprice both slots and preserve the other inputs', () => {
    const inputs = {
      ...DEFAULT_INPUTS,
      primaryModel: snapshotHaiku,
      secondaryModel: snapshotHaiku,
      monthlyVolume: 12345,
    };

    const result = repriceModels(inputs, catalog);

    expect(result.primaryModel.pricePer1MInputTokens).toBe(0.8);
    expect(result.secondaryModel.pricePer1MInputTokens).toBe(0.8);
    expect(result.monthlyVolume).toBe(12345);
  });

  it('should return the same reference when nothing changed', () => {
    const inputs = { ...DEFAULT_INPUTS, primaryModel: snapshotHaiku, secondaryModel: snapshotHaiku };
    const once = repriceModels(inputs, catalog);

    expect(repriceModels(once, catalog)).toBe(once);
  });
});

describe('embedded snapshot', () => {
  it('should have no colliding model ids', () => {
    // Colliding ids would duplicate React keys in the picker and make repricing ambiguous
    const ids = SNAPSHOT_MODELS.map(toModelId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should price every model with usable numbers', () => {
    SNAPSHOT_MODELS.forEach(m => {
      expect(Number.isFinite(m.inputPricePer1M), `${m.model} input price`).toBe(true);
      expect(Number.isFinite(m.outputPricePer1M), `${m.model} output price`).toBe(true);
      // batch rates come as a pair or not at all
      expect(
        (m.batchInputPricePer1M === undefined) === (m.batchOutputPricePer1M === undefined),
        `${m.model} has a half-filled batch price pair`
      ).toBe(true);
    });
  });
});

describe('preset model identities', () => {
  it('should give every preset a model the snapshot can resolve', () => {
    // presetModel() throws at import time if a model is missing, so reaching here
    // means all presets resolved. This locks in that they carry an identity too.
    Object.entries(PRESETS).forEach(([key, preset]) => {
      if (!preset.primaryModel) return;
      expect(preset.primaryModel.modelId, `${key} has no modelId`).toBeTruthy();
      expect(preset.primaryModel.pricedAt, `${key} has no pricedAt`).toBeTruthy();
    });
  });
});
