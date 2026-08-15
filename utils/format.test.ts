import { formatCount, formatUsd, formatUsdThousands, pluralize } from './format';

describe('pluralize', () => {
  it('should turn consonant-y into -ies', () => {
    // The bug that started this: "query" rendered as "querys"
    expect(pluralize('query')).toBe('queries');
    expect(pluralize('story')).toBe('stories');
  });

  it('should keep vowel-y as a plain -s', () => {
    expect(pluralize('day')).toBe('days');
    expect(pluralize('survey')).toBe('surveys');
  });

  it('should add -es after a sibilant', () => {
    expect(pluralize('batch')).toBe('batches');
    expect(pluralize('box')).toBe('boxes');
    expect(pluralize('analysis')).toBe('analysises'); // regular rule, documented limit
  });

  it('should handle the unit names the presets ship with', () => {
    const preset: Record<string, string> = {
      ticket: 'tickets',
      query: 'queries',
      meeting: 'meetings',
      piece: 'pieces',
      task: 'tasks',
      invoice: 'invoices',
      call: 'calls',
      workflow: 'workflows',
      Order: 'Orders',
      customer: 'customers',
      subscriber: 'subscribers',
    };

    Object.entries(preset).forEach(([singular, plural]) => {
      expect(pluralize(singular), singular).toBe(plural);
    });
  });

  it('should leave a single item singular', () => {
    expect(pluralize('ticket', 1)).toBe('ticket');
    expect(pluralize('query', 1)).toBe('query');
  });

  it('should survive empty or padded input', () => {
    expect(pluralize('')).toBe('');
    expect(pluralize('  ')).toBe('');
  });
});

describe('formatUsd', () => {
  it('should put the sign before the currency symbol', () => {
    // Hand-built "$" + number produced "$-49.20"
    expect(formatUsd(-49.2)).toBe('-$49.20');
    expect(formatUsd(49.2)).toBe('$49.20');
  });

  it('should honour the requested precision', () => {
    expect(formatUsd(0.0035, 4)).toBe('$0.0035');
    expect(formatUsd(1234, 0)).toBe('$1,234');
  });
});

describe('formatUsdThousands', () => {
  it('should keep the sign in front on a negative axis', () => {
    // The cumulative-profit axis starts negative by definition
    expect(formatUsdThousands(-49200)).toBe('-$49k');
    expect(formatUsdThousands(49200)).toBe('$49k');
  });

  it('should support one decimal for tighter scales', () => {
    expect(formatUsdThousands(-1530, 1)).toBe('-$1.5k');
  });
});

describe('formatCount', () => {
  it('should group thousands without a currency symbol', () => {
    expect(formatCount(5788)).toBe('5,788');
    expect(formatCount(-257)).toBe('-257');
  });
});
