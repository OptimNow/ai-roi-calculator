#!/usr/bin/env node
/**
 * Regenerates the embedded model snapshot in utils/modelCatalog.ts from the
 * AI Pricing Hub API. The snapshot is only the offline fallback — the app fetches
 * live prices at runtime — but it also seeds every preset, so it must not rot.
 *
 * Usage: node scripts/refresh-model-snapshot.mjs [--dry-run]
 * Env:   MODEL_API_URL to override the endpoint.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_FILE = resolve(ROOT, 'utils/modelCatalog.ts');
const CONSTANTS_FILE = resolve(ROOT, 'constants.ts');

// Canonical domain — aipricinghub.optimnow.io 308-redirects here.
const API_URL = process.env.MODEL_API_URL || 'https://optimtoken.optimnow.io/api/llm-models';
const DRY_RUN = process.argv.includes('--dry-run');

/** Reject a response that lost most of the catalog (API degraded, partial upstream failure). */
const MIN_MODELS = 80;
/** How many top-ELO models to embed, on top of the ones presets pin. */
const TOP_N = 55;

const START = '// SNAPSHOT-START';
const END = '// SNAPSHOT-END';

const fail = message => {
  console.error(`refresh-model-snapshot: ${message}`);
  process.exit(1);
};

/**
 * Models referenced by presets, parsed from constants.ts so this list can never
 * drift from the presets themselves. Dropping one would make presetModel() throw
 * at import time and take the whole app down.
 */
const readPinnedModels = () => {
  const source = readFileSync(CONSTANTS_FILE, 'utf8');
  const matches = [...source.matchAll(/presetModel\(\s*'([^']+)'\s*,\s*'([^']+)'/g)];
  if (matches.length === 0) fail('found no presetModel() calls in constants.ts — has the preset format changed?');
  const seen = new Set();
  return matches
    .map(([, provider, model]) => ({ provider, model }))
    .filter(({ provider, model }) => {
      const key = `${provider}/${model}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

// Array.join() renders null as an empty string, which would emit array holes.
// Every cell is stringified explicitly instead.
const num = value => (typeof value === 'number' && Number.isFinite(value) ? String(value) : 'null');

const quote = value => `'${String(value).replace(/'/g, "\\'")}'`;

const toRow = m =>
  '  [' +
  [
    quote(m.provider),
    quote(m.model),
    num(m.inputPricePer1M),
    num(m.outputPricePer1M),
    num(m.batchInputPricePer1M),
    num(m.batchOutputPricePer1M),
    num(m.cachedInputPricePer1M),
    quote(m.contextWindow ?? ''),
    quote(m.category ?? ''),
    num(m.eloScore ?? 0),
    quote(m.releaseDate ?? ''),
  ].join(', ') +
  '],';

const main = async () => {
  const pinned = readPinnedModels();
  console.log(`Pinned by presets: ${pinned.map(p => `${p.provider}/${p.model}`).join(', ')}`);

  const response = await fetch(API_URL);
  if (!response.ok) fail(`API returned HTTP ${response.status}`);
  const data = await response.json();

  if (data?.meta?.source !== 'openrouter') {
    fail(`refusing a response whose meta.source is "${data?.meta?.source}" (expected "openrouter")`);
  }

  const models = (Array.isArray(data.models) ? data.models : []).filter(
    m => m && typeof m.provider === 'string' && typeof m.model === 'string'
      && typeof m.inputPricePer1M === 'number' && typeof m.outputPricePer1M === 'number'
  );
  if (models.length < MIN_MODELS) fail(`only ${models.length} usable models returned (minimum ${MIN_MODELS})`);

  const missing = pinned.filter(p => !models.some(m => m.provider === p.provider && m.model === p.model));
  if (missing.length > 0) {
    fail(
      `these preset models are no longer in the catalog: ${missing.map(p => `${p.provider}/${p.model}`).join(', ')}. ` +
      'Point the affected presets at a current model in constants.ts, then re-run.'
    );
  }

  const byElo = [...models].filter(m => m.eloScore).sort((a, b) => b.eloScore - a.eloScore);
  const selected = byElo.slice(0, TOP_N);
  for (const p of pinned) {
    const found = models.find(m => m.provider === p.provider && m.model === p.model);
    if (!selected.includes(found)) selected.push(found);
  }

  const pricedAt = typeof data.meta.timestamp === 'string' ? data.meta.timestamp.slice(0, 10) : null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(pricedAt ?? '')) fail(`unexpected meta.timestamp: ${data.meta.timestamp}`);

  const block = [
    START,
    '/** Date of the embedded snapshot below */',
    `export const SNAPSHOT_DATE = '${pricedAt}';`,
    '',
    'const SNAPSHOT_ROWS: SnapshotRow[] = [',
    ...selected.map(toRow),
    '];',
    END,
  ].join('\n');

  const current = readFileSync(CATALOG_FILE, 'utf8');
  const startIdx = current.indexOf(START);
  const endIdx = current.indexOf(END);
  if (startIdx === -1 || endIdx === -1) fail(`could not find ${START} / ${END} markers in utils/modelCatalog.ts`);

  const updated = current.slice(0, startIdx) + block + current.slice(endIdx + END.length);

  if (updated === current) {
    console.log(`No change — snapshot already at ${pricedAt} with ${selected.length} models.`);
    return;
  }

  if (DRY_RUN) {
    console.log(`[dry run] would write ${selected.length} models, priced ${pricedAt}.`);
    return;
  }

  writeFileSync(CATALOG_FILE, updated);
  console.log(`Wrote ${selected.length} models, priced ${pricedAt}.`);
};

main().catch(error => fail(error?.message ?? String(error)));
