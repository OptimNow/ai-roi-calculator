# SEO & Discoverability

**Last Updated:** August 17, 2026

This document records **decisions and known gaps**. It deliberately does not reproduce the
contents of `index.html`, `vercel.json` or `public/*` — the previous version did, and every
copied block drifted: it documented a canonical URL, two security headers and an
`aggregateRating` that no longer existed. Read the files for what is configured; read this for
why, and for what is still wrong.

---

## Domains

`https://airoicalculator.optimnow.io` is canonical. `ai-roi-calculator.vercel.app` is the
Vercel default and used to return `200` with the same content, leaving deduplication entirely
to the canonical tag — which Google treats as a hint, not a directive. `vercel.json` now
`308`s it to the custom domain. The `has: host` condition matches that exact hostname, so
preview deployments on `ai-roi-calculator-<hash>.vercel.app` are unaffected.

## What each surface carries

| File | Carries |
|---|---|
| `index.html` | Title, description, canonical, Open Graph, Twitter Card, `WebApplication` JSON-LD, and a `<noscript>` block that is the entire site to a non-rendering crawler |
| `public/methodology.html` | Generated page, `TechArticle` JSON-LD, its own canonical — see below |
| `public/robots.txt` | `Allow: /` for everyone, absolute sitemap URL |
| `public/sitemap.xml` | Two URLs: home and methodology |
| `public/llms.txt` | Link-list per the llmstxt.org convention |
| `vercel.json` | Security headers, the `308` above, immutable caching on `/assets/*` |

**No `aggregateRating` in the JSON-LD, on purpose.** An earlier version self-declared
`"ratingValue": "5.0", "ratingCount": "1"`. A self-authored rating is a Google structured-data
policy violation and risks a manual action. Do not restore it.

## The SPA crawlability problem, and what actually fixes it

The app is client-rendered: the served HTML is an empty `<div id="root">`.

- **Googlebot renders JavaScript** and sees the full app. For the navigational, tool-seeking
  queries this product wants — "AI ROI calculator", "LLM cost calculator" — that is fine.
- **Non-rendering fetchers** — GPTBot, ClaudeBot, PerplexityBot, CCBot, most social unfurlers —
  get only the raw HTML. For them the `<noscript>` block *is* the site.

Prerendering was considered and rejected: it would hand Googlebot the same label-and-number
soup it already renders, and add a headless-Chrome dependency to CI for no new content.

What was actually missing was **content**, not rendering. `public/methodology.html` is the
full mathematical specification (~5,900 words) as static, zero-JavaScript HTML on our own
domain, generated from `METHODOLOGY.md` by `scripts/build-methodology.mjs` and regenerated on
every `prebuild`. Before it existed, the app linked users to `METHODOLOGY.md` on GitHub, so
every citation an AI search engine could make pointed at github.com rather than optimnow.io.

The `<noscript>` block links to it. That link is the path non-rendering crawlers follow.

## AI crawler policy

`robots.txt` is `Allow: /` with no per-agent rules, so GPTBot, ClaudeBot, PerplexityBot, CCBot
and Google-Extended are all permitted. **This is intended** — the calculator is a free lead-
generation tool that wants to be found and cited. The permission is currently implicit; adding
explicit per-agent `Allow` blocks would document the intent so a future well-meaning "block the
scrapers" edit has to be deliberate.

## Known gaps

Ordered by impact. None of these are configuration mistakes — they need assets or a decision.

1. **No service worker behind `display: standalone`.** `manifest.webmanifest` now declares
   192×192 and 512×512 PNG icons, so the PWA is installable, but it promises an app-like
   experience with zero offline capability. Either add a service worker, or drop the claim.
2. **`X-Frame-Options: ALLOWALL` in `vercel.json` is not a valid value** (the header allows only
   `DENY` and `SAMEORIGIN`). Browsers ignore it, and the `Content-Security-Policy:
   frame-ancestors` two entries below is what actually permits the Wix embedding. The line
   should be deleted, but it is load-bearing-looking enough that it deserves a deliberate
   change rather than a drive-by one.
3. **Title is 76 characters, description 187.** Google truncates around 60 and 160
   respectively. Both are currently cut off in results.
4. **`Ayuthaya` is not a Google Font.** The stylesheet URL in `index.html` requests it and
   Google silently drops it — the response is byte-identical with the family removed — so
   `--font-label` falls back to Arial in production. A brand-fidelity issue, not an SEO one.
5. **No `FAQPage` schema.** `components/HelpGuide.tsx` contains ~25 sections of genuinely good
   explanatory content that no crawler ever sees, since the modal returns `null` until a human
   clicks. Lifting six to ten of those into FAQ schema would be eligible for rich results and is
   heavily favoured by AI answer engines.

## Images

`public/images/icon-*.png`, `public/favicon.ico` and `public/images/og-image.png` are generated
by `scripts/build-icons.mjs` — run `npm run build:icons` and commit the output. Do not hand-edit
them.

The icons are resampled from `public/images/favicon.jpg`, the existing OptimNow "Cloud" badge,
which stays in the repository as the source of truth for the mark even though nothing links to
it directly any more. The social card is composed from the real `Logo.png` plus brand tokens;
its type falls back to Arial, which is the sanctioned fallback in `index.css`
(`'Manrope', Arial, Helvetica`), since the brand faces are Google Fonts and are not available to
the rasteriser.

`/favicon.ico` exists at the site root, so the catch-all rewrite no longer answers that request
with the SPA shell as `200 text/html`.

## Maintenance

- `sitemap.xml` `<lastmod>` is hand-maintained and has drifted before. Update it with content
  changes, or automate it at build time.
- After changing `METHODOLOGY.md`, `npm run build:methodology` regenerates the page;
  `npm run check:methodology` fails if the committed copy is stale.
- Validate structured data at <https://validator.schema.org/> and rich results at
  <https://search.google.com/test/rich-results>.
- Search Console property is `https://airoicalculator.optimnow.io`; submit the sitemap there.
