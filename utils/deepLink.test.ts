import { applyDeepLink, hasDeepLink, parseDeepLink, presetLabel } from './deepLink';
import { DEFAULT_INPUTS, PRESETS } from '../constants';
import { UseCaseInputs, ValueMethod } from '../types';

const base = { ...DEFAULT_INPUTS, ...PRESETS.support } as UseCaseInputs;

describe('parseDeepLink', () => {
  it('should map the hub use-case keys that differ from preset keys', () => {
    expect(parseDeepLink('?useCase=supportTicket').presetKey).toBe('support');
    expect(parseDeepLink('?useCase=invoiceProcessing').presetKey).toBe('invoice');
  });

  it('should accept keys that are already preset keys', () => {
    expect(parseDeepLink('?useCase=codingTask').presetKey).toBe('codingTask');
    expect(parseDeepLink('?preset=agentWorkflow').presetKey).toBe('agentWorkflow');
  });

  it('should read every hub use-case key to a real preset', () => {
    const hubKeys = [
      'supportTicket', 'knowledgeQA', 'meetingSummary', 'marketingContent',
      'codingTask', 'invoiceProcessing', 'callSummary', 'agentWorkflow',
    ];

    hubKeys.forEach(key => {
      const parsed = parseDeepLink(`?useCase=${key}`);
      expect(parsed.presetKey, `${key} did not map`).toBeTruthy();
      expect(PRESETS[parsed.presetKey!], `${key} maps to a missing preset`).toBeTruthy();
    });
  });

  it('should ignore an unknown use case', () => {
    expect(parseDeepLink('?useCase=notARealUseCase').presetKey).toBeUndefined();
  });

  it('should parse the hub volume presets', () => {
    expect(parseDeepLink('?volume=10000').monthlyVolume).toBe(10000);
    expect(parseDeepLink('?volume=100000').monthlyVolume).toBe(100000);
    expect(parseDeepLink('?volume=1000000').monthlyVolume).toBe(1000000);
  });

  it('should reject junk volumes', () => {
    expect(parseDeepLink('?volume=abc').monthlyVolume).toBeUndefined();
    expect(parseDeepLink('?volume=-5').monthlyVolume).toBeUndefined();
    expect(parseDeepLink('?volume=0').monthlyVolume).toBeUndefined();
  });

  it('should cap an absurd volume instead of accepting it', () => {
    expect(parseDeepLink('?volume=999999999999').monthlyVolume).toBe(1_000_000_000);
  });

  it('should accept a well-formed model id and reject anything else', () => {
    expect(parseDeepLink('?model=anthropic/claude-haiku-4-5').modelId).toBe('anthropic/claude-haiku-4-5');
    expect(parseDeepLink('?model=Anthropic/Claude-Haiku-4-5').modelId).toBe('anthropic/claude-haiku-4-5');
    expect(parseDeepLink('?model=no-slash').modelId).toBeUndefined();
    expect(parseDeepLink('?model=../../etc/passwd').modelId).toBeUndefined();
    expect(parseDeepLink('?model=<script>').modelId).toBeUndefined();
  });

  it('should parse the batch flag both ways', () => {
    expect(parseDeepLink('?batch=1').batchProcessing).toBe(true);
    expect(parseDeepLink('?batch=true').batchProcessing).toBe(true);
    expect(parseDeepLink('?batch=0').batchProcessing).toBe(false);
    expect(parseDeepLink('?batch=maybe').batchProcessing).toBeUndefined();
  });

  it('should return nothing for an empty or unrelated query string', () => {
    expect(hasDeepLink(parseDeepLink(''))).toBe(false);
    expect(hasDeepLink(parseDeepLink('?utm_source=linkedin'))).toBe(false);
  });
});

describe('applyDeepLink', () => {
  it('should return the untouched base when there is nothing to apply', () => {
    expect(applyDeepLink(base, {})).toBe(base);
  });

  it('should load the preset named by the link', () => {
    const result = applyDeepLink(base, { presetKey: 'invoice' });

    expect(result.useCaseName).toBe('Invoice Processing');
    expect(result.unitName).toBe('invoice');
    expect(result.primaryModel.avgInputTokensPerUnit).toBe(1500); // harmonized with the hub profile
  });

  it('should override the volume on top of the preset', () => {
    const result = applyDeepLink(base, { presetKey: 'support', monthlyVolume: 100000 });

    expect(result.monthlyVolume).toBe(100000);
    expect(result.useCaseName).toBe('Customer Support Bot');
  });

  it('should apply volume alone without disturbing the current preset', () => {
    const result = applyDeepLink(base, { monthlyVolume: 42000 });

    expect(result.monthlyVolume).toBe(42000);
    expect(result.useCaseName).toBe(base.useCaseName);
  });

  it('should apply the batch flag', () => {
    expect(applyDeepLink(base, { batchProcessing: true }).batchProcessing).toBe(true);
    expect(applyDeepLink(base, { presetKey: 'invoice', batchProcessing: false }).batchProcessing).toBe(false);
  });

  it('should keep subscribers aligned with volume for premium monetization', () => {
    const result = applyDeepLink(base, { presetKey: 'premium', monthlyVolume: 2500 });

    expect(result.valueMethod).toBe(ValueMethod.PREMIUM_MONETIZATION);
    expect(result.subscribers).toBe(2500);
  });

  it('should not mutate the base inputs', () => {
    const snapshot = JSON.stringify(base);
    applyDeepLink(base, { presetKey: 'codingTask', monthlyVolume: 999 });

    expect(JSON.stringify(base)).toBe(snapshot);
  });
});

describe('presetLabel', () => {
  it('should give the human-readable use case name', () => {
    expect(presetLabel('support')).toBe('Customer Support Bot');
    expect(presetLabel(undefined)).toBeUndefined();
    expect(presetLabel('nope')).toBeUndefined();
  });
});
