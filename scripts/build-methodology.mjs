#!/usr/bin/env node
/**
 * Renders METHODOLOGY.md into public/methodology.html.
 *
 * Why this exists: the calculator is a client-rendered SPA whose served HTML is an
 * empty <div id="root">. Crawlers that do not execute JavaScript — GPTBot, ClaudeBot,
 * PerplexityBot, CCBot, and most social unfurlers — see only the <noscript> block.
 * Meanwhile the one genuinely citable thing this project owns, the full mathematical
 * specification, lived only in the GitHub repo, so every answer an AI search engine
 * could give about this methodology cited github.com rather than optimnow.io.
 *
 * This produces a zero-JavaScript, fully static page with the whole specification in
 * the markup, on the product's own domain.
 *
 * METHODOLOGY.md stays the single source of truth — the page is generated, never
 * hand-edited, and `prebuild` regenerates it so it cannot drift the way SEO.md did.
 *
 * Usage: node scripts/build-methodology.mjs [--check]
 *        --check exits non-zero if the committed output is stale (for CI)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = resolve(ROOT, 'METHODOLOGY.md');
const OUTPUT = resolve(ROOT, 'public/methodology.html');

const SITE = 'https://airoicalculator.optimnow.io';
const PAGE_URL = `${SITE}/methodology.html`;
const TITLE = 'AI ROI Methodology — The 3-Layer Cost Framework | OptimNow';
const DESCRIPTION =
  'Complete mathematical specification for calculating AI and LLM return on investment: '
  + 'the 3-layer cost framework, four business value methods, break-even analysis, '
  + 'sensitivity analysis, and a worked end-to-end example.';

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** GitHub-style anchor slug, so in-page links survive a copy of the markdown. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const headings = [];

marked.use({
  gfm: true,
  renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      const id = slugify(text);
      // h2s carry the document's structure, so they become the table of contents
      if (depth === 2) headings.push({ id, text });
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
  },
});

const markdown = readFileSync(SOURCE, 'utf8');
const body = marked.parse(markdown);

const toc = headings
  .map(h => `        <li><a href="#${h.id}">${h.text}</a></li>`)
  .join('\n');

// TechArticle rather than WebApplication: this page is the specification, not the tool.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'AI ROI Methodology: The 3-Layer Cost Framework',
  description: DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en',
  isAccessibleForFree: true,
  author: { '@type': 'Organization', name: 'OptimNow', url: 'https://www.optimnow.io' },
  publisher: { '@type': 'Organization', name: 'OptimNow', url: 'https://www.optimnow.io' },
  about: [
    'Artificial intelligence return on investment',
    'Large language model cost modeling',
    'Break-even analysis',
  ],
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  isPartOf: { '@type': 'WebApplication', name: 'AI ROI Calculator', url: `${SITE}/` },
};

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>${escapeHtml(TITLE)}</title>
    <meta name="description" content="${escapeHtml(DESCRIPTION)}" />
    <meta name="author" content="OptimNow" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${PAGE_URL}" />

    <meta property="og:type" content="article" />
    <meta property="og:url" content="${PAGE_URL}" />
    <meta property="og:title" content="${escapeHtml(TITLE)}" />
    <meta property="og:description" content="${escapeHtml(DESCRIPTION)}" />
    <meta property="og:site_name" content="AI ROI Calculator" />
    <meta property="og:locale" content="en_US" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(TITLE)}" />
    <meta name="twitter:description" content="${escapeHtml(DESCRIPTION)}" />

    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/png" sizes="32x32" href="/images/icon-32.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=Almarai:wght@300;400;700&display=swap" rel="stylesheet">

    <meta name="theme-color" content="#ACE849" />

    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>

    <style>
      /* Brand: charcoal text, light grey ground, chartreuse as punctuation only.
         No gradients, no shadows — flat and system-diagram plain. */
      :root {
        --charcoal: #2C2C2C;
        --light-grey: #F4F4F4;
        --dark-grey: #C1C1C1;
        --accent: #ACE849;
        --white: #FFFFFF;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--light-grey);
        color: var(--charcoal);
        font-family: 'Almarai', system-ui, -apple-system, sans-serif;
        font-weight: 400;
        line-height: 1.7;
        font-size: 16px;
      }
      header.site {
        background: var(--charcoal);
        padding: 1rem 1.5rem;
      }
      header.site .inner {
        max-width: 860px; margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      }
      header.site img { height: 32px; width: auto; max-width: 160px; display: block; }
      header.site a.cta {
        color: var(--charcoal); background: var(--accent);
        padding: 0.5rem 1rem; border-radius: 6px;
        font-weight: 700; text-decoration: none; font-size: 0.875rem;
      }
      main { max-width: 860px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Manrope', system-ui, sans-serif;
        font-weight: 800; line-height: 1.25; margin: 2.5rem 0 1rem;
      }
      h1 { font-size: 2rem; margin-top: 0; }
      h2 { font-size: 1.5rem; border-top: 1px solid var(--dark-grey); padding-top: 1.75rem; }
      h3 { font-size: 1.175rem; }
      h4 { font-size: 1rem; }
      p, li { overflow-wrap: break-word; }
      a { color: var(--charcoal); text-decoration: underline; text-underline-offset: 2px; }
      a:hover { text-decoration-color: var(--accent); text-decoration-thickness: 2px; }
      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        font-size: 0.875em; background: var(--white);
        border: 1px solid var(--dark-grey); border-radius: 3px; padding: 0.1em 0.35em;
      }
      pre {
        background: var(--white); border: 1px solid var(--dark-grey); border-radius: 6px;
        padding: 1rem; overflow-x: auto; line-height: 1.5;
      }
      pre code { background: none; border: none; padding: 0; font-size: 0.8125rem; }
      /* Wide tables scroll inside their own box; the page body never scrolls sideways. */
      .table-scroll { overflow-x: auto; margin: 1.25rem 0; }
      table { border-collapse: collapse; width: 100%; font-size: 0.9375rem; }
      th, td { border: 1px solid var(--dark-grey); padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
      th { background: var(--white); font-family: 'Manrope', sans-serif; font-weight: 700; }
      blockquote {
        margin: 1.25rem 0; padding: 0.5rem 1rem;
        border-left: 3px solid var(--accent); background: var(--white);
      }
      hr { border: none; border-top: 1px solid var(--dark-grey); margin: 2.5rem 0; }
      nav.toc {
        background: var(--white); border: 1px solid var(--dark-grey);
        border-radius: 6px; padding: 1.25rem 1.5rem; margin: 2rem 0 3rem;
      }
      nav.toc h2 {
        font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em;
        margin: 0 0 0.75rem; border: none; padding: 0;
      }
      nav.toc ul { margin: 0; padding-left: 1.25rem; }
      nav.toc li { margin: 0.25rem 0; }
      footer.site {
        background: var(--charcoal); color: var(--white);
        padding: 2rem 1.5rem; font-size: 0.875rem;
      }
      footer.site .inner { max-width: 860px; margin: 0 auto; }
      footer.site a { color: var(--white); }
      @media (max-width: 640px) {
        body { font-size: 15px; }
        h1 { font-size: 1.625rem; }
        h2 { font-size: 1.3125rem; }
        main { padding: 1.75rem 1rem 3rem; }
      }
    </style>
  </head>
  <body>
    <header class="site">
      <div class="inner">
        <a href="/" aria-label="AI ROI Calculator home">
          <img src="/images/Logo.png" width="160" height="32" alt="OptimNow" />
        </a>
        <a class="cta" href="/">Open the calculator</a>
      </div>
    </header>

    <main>
      <nav class="toc" aria-label="Table of contents">
        <h2>On this page</h2>
        <ul>
${toc}
        </ul>
      </nav>

${body}
    </main>

    <footer class="site">
      <div class="inner">
        <p>
          This specification documents the engine behind the
          <a href="/">AI ROI Calculator</a>, a free tool by
          <a href="https://www.optimnow.io">OptimNow</a>.
          Model prices come from <a href="https://optimtoken.optimnow.io">OptimToken</a>.
        </p>
        <p>Generated from METHODOLOGY.md — do not edit this file by hand.</p>
      </div>
    </footer>
  </body>
</html>
`;

// Tables are the one element that can overflow a phone; wrap each so it scrolls itself.
const wrapped = html.replace(/<table>/g, '<div class="table-scroll"><table>')
                    .replace(/<\/table>/g, '</table></div>');

if (process.argv.includes('--check')) {
  let existing = '';
  try {
    existing = readFileSync(OUTPUT, 'utf8');
  } catch {
    console.error('public/methodology.html is missing. Run: npm run build:methodology');
    process.exit(1);
  }
  if (existing !== wrapped) {
    console.error('public/methodology.html is stale. Run: npm run build:methodology');
    process.exit(1);
  }
  console.log('public/methodology.html is up to date.');
  process.exit(0);
}

writeFileSync(OUTPUT, wrapped, 'utf8');
console.log(
  `Wrote public/methodology.html (${(wrapped.length / 1024).toFixed(1)} kB, `
  + `${headings.length} sections) from METHODOLOGY.md`
);
