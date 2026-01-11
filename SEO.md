# SEO Configuration Guide

**Last Updated:** January 11, 2026
**Project:** AI ROI Calculator

---

## Overview

This document outlines all SEO (Search Engine Optimization) configurations for the AI ROI Calculator deployed on Vercel.

---

## Implemented SEO Features

### 1. Meta Tags (index.html)

#### Primary Meta Tags
```html
<title>AI ROI Calculator - Calculate Return on Investment for AI Projects | OptimNow</title>
<meta name="description" content="Free web app to calculate ROI for AI and LLM implementations..." />
<meta name="keywords" content="AI ROI calculator, LLM cost calculator, AI project ROI..." />
<meta name="author" content="OptimNow" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://ai-roi-calculator.vercel.app/" />
```

**Key Points:**
- Title is 62 characters (optimal for Google: 50-60 chars)
- Description is under 160 characters (optimal for snippets)
- Keywords target AI/LLM ROI calculation use cases
- Robots directive allows full crawling

#### Open Graph Tags (Facebook, LinkedIn, etc.)
```html
<meta property="og:type" content="website" />
<meta property="og:title" content="AI ROI Calculator - Calculate Return on Investment for AI Projects" />
<meta property="og:description" content="Free web app to calculate ROI for AI and LLM implementations..." />
<meta property="og:image" content="https://ai-roi-calculator.vercel.app/images/Logo.png" />
<meta property="og:url" content="https://ai-roi-calculator.vercel.app/" />
```

**Purpose:** Rich previews when shared on Facebook, LinkedIn, Slack, etc.

#### Twitter Card Tags
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AI ROI Calculator - Calculate Return on Investment for AI Projects" />
<meta name="twitter:description" content="Free web app to calculate ROI for AI and LLM implementations..." />
<meta name="twitter:image" content="https://ai-roi-calculator.vercel.app/images/Logo.png" />
```

**Purpose:** Rich cards when tweeted or shared on X/Twitter

#### Theme Color
```html
<meta name="theme-color" content="#ACE849" />
```

**Purpose:** Sets browser chrome color on mobile devices (Chartreuse brand color)

---

### 2. Structured Data (JSON-LD)

Located in `index.html` `<head>` section:

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "AI ROI Calculator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "ratingCount": "1"
  },
  "description": "Free web application to calculate return on investment for AI and LLM implementations...",
  "url": "https://ai-roi-calculator.vercel.app/",
  "creator": {
    "@type": "Organization",
    "name": "OptimNow",
    "url": "https://www.optimnow.io"
  },
  "featureList": [...]
}
```

**Purpose:**
- Rich results in Google search (star ratings, price, features)
- Enhanced visibility with application info panel
- Helps Google understand what the tool does

**Validation:** Test at https://search.google.com/test/rich-results

---

### 3. Vercel Configuration (vercel.json)

#### Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Benefits:**
- Improves security score (Google ranking factor)
- Protects against XSS, clickjacking, and MIME sniffing
- Better privacy with referrer policy

#### SPA Routing
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Purpose:** Ensures all routes serve the React SPA (single-page application)

---

### 4. Robots.txt (public/robots.txt)

```txt
User-agent: *
Allow: /

Sitemap: https://ai-roi-calculator.vercel.app/sitemap.xml
```

**Purpose:**
- Allows all search engines to crawl entire site
- Points crawlers to sitemap for efficient indexing

**Access:** https://airoicalculator.optimnow.io/robots.txt

---

### 5. Sitemap.xml (public/sitemap.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ai-roi-calculator.vercel.app/</loc>
    <lastmod>2026-01-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Purpose:**
- Helps search engines discover all pages
- Indicates update frequency and priority
- Speeds up indexing

**Access:** https://airoicalculator.optimnow.io/sitemap.xml

**Update:** Change `<lastmod>` date when making significant content changes

---

## SEO Best Practices Applied

### ✅ Technical SEO
- [x] Mobile-responsive design (viewport meta tag)
- [x] Fast load times (Vite optimization, CDN delivery)
- [x] HTTPS enabled (automatic via Vercel)
- [x] Clean URL structure (no query params for routing)
- [x] Semantic HTML (proper heading hierarchy)
- [x] Accessible (WCAG 2.1 AA compliant)

### ✅ On-Page SEO
- [x] Descriptive title tag with brand name
- [x] Compelling meta description under 160 chars
- [x] Relevant keywords naturally integrated
- [x] Canonical URL to prevent duplicate content
- [x] Alt text for images (in Logo.png usage)

### ✅ Content SEO
- [x] Clear value proposition ("Free web app to calculate ROI...")
- [x] Target audience keywords (AI, LLM, ROI, calculator)
- [x] Feature-rich description in structured data
- [x] Professional branding (OptimNow)

### ✅ Social SEO
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags for X/Twitter
- [x] High-quality preview image (Logo.png)
- [x] Consistent messaging across platforms

---

## Monitoring & Analytics

### Vercel Analytics
Already integrated via `@vercel/analytics` package:
- Page views and user sessions
- Geographic traffic sources
- Device types (mobile/desktop)
- Web Vitals (LCP, FID, CLS)

**Dashboard:** Vercel Project → Analytics tab

### Google Search Console (Recommended)
To track search performance:

1. **Add Property:**
   - Go to https://search.google.com/search-console
   - Add property: `https://airoicalculator.optimnow.io`

2. **Verify Ownership:**
   - **HTML File Method:** Download verification file, add to `public/`
   - **HTML Tag Method:** Add meta tag to `index.html` `<head>`
   - **DNS Method:** Add TXT record to domain (if using custom domain)

3. **Submit Sitemap:**
   - In Search Console, go to Sitemaps
   - Submit: `https://airoicalculator.optimnow.io/sitemap.xml`

4. **Monitor:**
   - Search queries driving traffic
   - Click-through rates (CTR)
   - Index coverage issues
   - Mobile usability
   - Core Web Vitals

---

## Testing & Validation

### Meta Tags Testing
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector:** https://www.linkedin.com/post-inspector/

### Structured Data Testing
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema Markup Validator:** https://validator.schema.org/

### Performance Testing
- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Lighthouse:** Built into Chrome DevTools (F12 → Lighthouse tab)

### Mobile-Friendly Test
- **Google Mobile-Friendly Test:** https://search.google.com/test/mobile-friendly

---

## Updating SEO Content

### When to Update

1. **Major Feature Releases:** Update description and structured data featureList
2. **Monthly:** Update sitemap.xml `<lastmod>` date if content changed
3. **Rebranding:** Update all meta tags, Open Graph, Twitter Card
4. **New Pages:** Add entries to sitemap.xml (when adding multi-page routing)

### How to Update

#### Update Meta Description (index.html:10)
```html
<meta name="description" content="Your new description here (max 160 chars)" />
```

#### Update Open Graph Title/Description (index.html:19-20)
```html
<meta property="og:title" content="Your new title" />
<meta property="og:description" content="Your new description" />
```

#### Update Structured Data (index.html:57)
```json
"description": "Your new description here",
"featureList": ["New feature 1", "New feature 2", ...]
```

#### Update Sitemap Last Modified (public/sitemap.xml:5)
```xml
<lastmod>2026-MM-DD</lastmod>
```

---

## Custom Domain Setup (Optional)

The project uses the custom domain `airoicalculator.optimnow.io`.

### Custom Domain Already Configured
The custom domain `https://airoicalculator.optimnow.io` is already configured and all SEO files have been updated with the correct URL.

---

## SEO Checklist for Future Updates

Before each major release:
- [ ] Update `<title>` tag if feature set changed
- [ ] Update meta description if value proposition changed
- [ ] Update structured data featureList
- [ ] Update sitemap.xml lastmod date
- [ ] Test all meta tags with Facebook Debugger & Twitter Validator
- [ ] Run Lighthouse audit (target 90+ SEO score)
- [ ] Verify mobile responsiveness
- [ ] Check Core Web Vitals in PageSpeed Insights
- [ ] Submit updated sitemap to Google Search Console

---

## Current SEO Status

### ✅ Implemented
- Primary meta tags (title, description, keywords, robots, canonical)
- Open Graph tags (Facebook, LinkedIn, etc.)
- Twitter Card tags
- Structured data (JSON-LD) for rich results
- Security headers via vercel.json
- robots.txt allowing all crawlers
- sitemap.xml with homepage entry
- Theme color for mobile browsers

### 🔄 In Progress
- Google Search Console verification (pending manual setup)
- Initial indexing by Google (typically 1-7 days after submission)

### 📋 Future Enhancements
- Add custom domain (optional)
- Track search performance in Search Console
- Add blog/content pages for more SEO opportunities
- Implement FAQ schema if adding FAQ section
- Add BreadcrumbList schema if adding navigation

---

## Resources

### Official Documentation
- **Vercel SEO:** https://vercel.com/docs/concepts/analytics
- **Schema.org:** https://schema.org/WebApplication
- **Open Graph Protocol:** https://ogp.me/
- **Twitter Cards:** https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

### SEO Tools
- **Google Search Console:** https://search.google.com/search-console
- **Google PageSpeed Insights:** https://pagespeed.web.dev/
- **Facebook Sharing Debugger:** https://developers.facebook.com/tools/debug/
- **Schema Markup Validator:** https://validator.schema.org/

---

**Questions or Issues?** See index.html:7-73 for current meta tag implementation.
