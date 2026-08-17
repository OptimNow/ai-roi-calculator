/**
 * Display helpers shared with the MCP server (synced by its scripts/sync-engine.mjs),
 * so the same figure reads the same way wherever it is reported.
 */

/**
 * Pluralise a user-supplied unit name.
 *
 * The unit is free text — "ticket", "query", "invoice", "analysis" — and appending
 * a bare "s" produced "querys". Covers the regular English cases; irregular nouns
 * ("person") are out of scope, since the unit is nearly always a regular noun and
 * guessing wrong on those is worse than leaving them.
 */
export const pluralize = (unit: string, count = 2): string => {
  if (count === 1) return unit;
  const word = unit.trim();
  if (!word) return word;

  const lower = word.toLowerCase();
  // consonant + y -> -ies ("query" -> "queries", but "day" -> "days")
  if (/[^aeiou]y$/.test(lower)) return `${word.slice(0, -1)}ies`;
  // sibilants take -es ("batch" -> "batches", "box" -> "boxes")
  if (/(s|x|z|ch|sh)$/.test(lower)) return `${word}es`;
  return `${word}s`;
};

/**
 * Intl.NumberFormat construction costs ~40x more than formatting with an existing
 * instance, and these helpers are called ~50 times per render of the results column
 * — every keystroke in the form. Only the decimal count varies, so one instance per
 * distinct count is cached for the life of the module.
 */
const usdFormatters = new Map<number, Intl.NumberFormat>();
const countFormatters = new Map<number, Intl.NumberFormat>();

const usdFormatter = (decimals: number): Intl.NumberFormat => {
  let formatter = usdFormatters.get(decimals);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    usdFormatters.set(decimals, formatter);
  }
  return formatter;
};

const countFormatter = (maximumFractionDigits: number): Intl.NumberFormat => {
  let formatter = countFormatters.get(maximumFractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits });
    countFormatters.set(maximumFractionDigits, formatter);
  }
  return formatter;
};

/**
 * Format USD with the sign in front of the currency symbol.
 *
 * Hand-built "$" + number produced "$-49.2k" on the cumulative-profit axis, which
 * starts negative by definition. Intl puts the sign where a reader expects it.
 */
export const formatUsd = (value: number, decimals = 2): string =>
  usdFormatter(decimals).format(value);

/** Same, abbreviated to thousands for chart axes: -$49k, not $-49k. */
export const formatUsdThousands = (value: number, decimals = 0): string =>
  `${formatUsd(value / 1000, decimals)}k`;

/** Plain number with thousands separators, no currency. */
export const formatCount = (value: number, maximumFractionDigits = 1): string =>
  countFormatter(maximumFractionDigits).format(value);
