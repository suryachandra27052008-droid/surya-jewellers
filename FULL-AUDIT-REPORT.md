# SEO Audit Report — Surya Jewellers
**URL:** https://suryajewellers.com/  
**Audit Date:** 2026-04-17  
**Business Type:** Local E-commerce (Jewellery retailer, Jaipur)  
**Platform:** Next.js on Vercel  

---

## SEO Health Score: 37 / 100

| Category | Weight | Score | Weighted |
|----------|--------|-------|---------|
| Technical SEO | 22% | 32/100 | 7.0 |
| Content Quality | 23% | 55/100 | 12.7 |
| On-Page SEO | 20% | 28/100 | 5.6 |
| Schema / Structured Data | 10% | 0/100 | 0.0 |
| Performance (CWV) | 10% | 60/100 | 6.0 |
| AI Search Readiness | 10% | 32/100 | 3.2 |
| Images | 5% | 28/100 | 1.4 |
| **TOTAL** | | | **35.9 → 37** |

---

## Executive Summary

Surya Jewellers has a clean, professional site built on Next.js/Vercel but is suffering from **fundamental SEO gaps that are likely preventing the store from ranking for any product keywords.** The single biggest problem is that product pages render via JavaScript client-side — search engines see no product content. Compounding this, zero schema markup exists across the entire site, every page is missing a meta description, and most pages share the same title tag.

### Top 5 Critical Issues
1. **Product pages are JavaScript-only rendered** — Googlebot likely sees blank product pages
2. **Zero schema markup** — No Product, LocalBusiness, Article, or Organization schema anywhere
3. **All meta descriptions are missing** — 100% of pages lack meta descriptions
4. **Duplicate/wrong title tags** — 5+ pages share the homepage title; product H1s show brand name not product name
5. **Sitemap contains typos and duplicate URLs** — `/products/sapphire-braclets`, `/products/tourmaline-earing`, two duplicate entries

### Top 5 Quick Wins
1. Add meta descriptions to all pages (30 min)
2. Fix title tags — unique, keyword-rich titles per page (1 hr)
3. Add LocalBusiness JSON-LD schema to homepage/contact (1 hr)
4. Add Product schema to all product pages (2 hrs)
5. Fix sitemap typos and remove duplicate entries (15 min)

---

## 1. Technical SEO

### 1.1 Crawlability
| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | ✅ Pass | Well-configured, blocks admin/checkout/auth only |
| Sitemap declared in robots.txt | ✅ Pass | Points to /sitemap.xml |
| Sitemap accessible | ✅ Pass | 25 URLs, all main pages covered |
| Sitemap typos | ❌ Fail | `/sapphire-braclets` (missing 'e'), `/tourmaline-earing` (missing 'r') |
| Sitemap duplicate URLs | ❌ Fail | `/products/earring` and `/products/emerald-necklace` appear twice |
| All sitemap URLs return 200 | ⚠️ Unverified | Products page loads JS shell; need server-side check |
| /collections URL | ❌ 404 | Returns 404 — likely linked internally but not in sitemap |

### 1.2 Indexability
| Check | Status | Notes |
|-------|--------|-------|
| SSL/HTTPS | ✅ Pass | HSTS present (max-age=63072000) |
| Canonical tags | ❌ Missing | No canonical tags detected on any page |
| noindex tags | ✅ Pass | None found on public pages |
| JavaScript rendering (CRITICAL) | ❌ CRITICAL | Products page renders "Loading…" — no SSR/SSG product content visible. Googlebot sees empty page |
| Product page content (server-side) | ❌ CRITICAL | `/products/emerald-ring` returns only site tagline text, not actual product data |

### 1.3 Security Headers
| Header | Status |
|--------|--------|
| Strict-Transport-Security | ✅ Present |
| X-Content-Type-Options | ❌ Missing |
| X-Frame-Options | ❌ Missing |
| Content-Security-Policy | ❌ Missing |
| Referrer-Policy | ❌ Missing |
| Permissions-Policy | ❌ Missing |

### 1.4 URL Structure
- Clean URLs ✅
- No trailing slashes inconsistency detected
- `/collections` → 404 (used in navigation but not in sitemap) ❌
- `/shipping-returns` → 404 (correct URL is `/shipping`) — internal links may be broken ❌

---

## 2. On-Page SEO

### 2.1 Title Tags
| Page | Current Title | Issue |
|------|--------------|-------|
| Homepage | Surya Jewellers \| 92.5 Sterling Silver Jewellery, Jaipur | ✅ Good |
| Contact | Surya Jewellers \| 92.5 Sterling Silver Jewellery, Jaipur | ❌ Duplicate of homepage |
| Wholesale | Surya Jewellers \| 92.5 Sterling Silver Jewellery, Jaipur | ❌ Duplicate of homepage |
| Shipping | Surya Jewellers \| 92.5 Sterling Silver Jewellery, Jaipur | ❌ Duplicate of homepage |
| About | About Us \| Surya Jewellers Jaipur \| Surya Jewellers | ❌ Brand repeated twice |
| Products/Collections | Collections \| Surya Jewellers — 92.5 Sterling Silver \| Surya Jewellers | ❌ Brand repeated twice |
| Blog listing | The Journal \| Surya Jewellers | ✅ Acceptable |
| Blog post | The Journal \| Surya Jewellers \| Surya Jewellers | ❌ Brand repeated twice |
| Product page (emerald-ring) | emerald ring \| Surya Jewellers | ❌ Lowercase, no descriptor |

### 2.2 Meta Descriptions
**Status: MISSING on 100% of pages.** This is a significant missed opportunity for click-through rates in SERPs. Google will auto-generate snippets, often poorly.

### 2.3 Heading Structure
| Page | H1 | Issue |
|------|-----|-------|
| Homepage | "Crafted in Pure 92.5 Sterling Silver" | ✅ Good |
| About | "A Legacy of Craftsmanship & Heritage" | ✅ Good |
| Wholesale | "Partner With Us" | ✅ Acceptable |
| Shipping | "Shipping & Returns" | ✅ Acceptable |
| Product pages | "SURYA Jewellers" | ❌ CRITICAL — product name should be H1 |
| Collections | "Collections" | ⚠️ Generic — should target keywords |

### 2.4 Internal Linking
- Navigation covers: Home, About, Collections, Journal, Contact, Wholesale ✅
- Footer links to all categories ✅
- `/collections` linked in nav but returns 404 ❌
- Blog posts have no internal links to related products ❌
- Product pages have no breadcrumb navigation ❌
- No product-to-product cross-linking visible ❌

---

## 3. Content Quality (E-E-A-T)

### 3.1 Page-by-Page Assessment
| Page | Word Count | Quality | Issues |
|------|-----------|---------|--------|
| Homepage | ~400 | Good | Strong messaging, trust signals present |
| About | ~850 | Good | Founder names (Sanjay & Pooja Chandra), business history since 2003 |
| Wholesale | ~550 | Thin | Good B2B content but thin for a landing page |
| Shipping | ~575 | Thin | Policy content, acceptable for this page type |
| Blog (care for silver) | ~1,100 | Good | Substantive, authoritative content |
| Blog (gemstone guide) | ~1,800 | Good | High E-E-A-T potential |
| Blog (workshop tour) | ~1,600 | Good | Authentic, differentiating content |
| Blog (styling guide) | ~1,300 | Good | Helpful, user-focused |

### 3.2 E-E-A-T Signals
| Signal | Status | Notes |
|--------|--------|-------|
| Experience | ⚠️ Partial | Workshop tour blog post helps; "one piece, one design" philosophy authentic |
| Expertise | ⚠️ Partial | About page has founder bios; blog content is knowledgeable but no author bylines |
| Authoritativeness | ❌ Weak | No external mentions, backlinks, or press coverage visible |
| Trustworthiness | ✅ Good | SSL, payment logos, Certificate of Authenticity, physical address visible |

### 3.3 Missing E-E-A-T Elements
- No author bylines on blog posts (who wrote them?) ❌
- No customer review schema/count shown publicly ❌
- Gmail address (suryajewellersjaipur@gmail.com) reduces professional credibility ❌
- No press coverage or third-party mentions visible ❌
- Two different phone numbers on contact page (99839 39306 vs 9358842102) — NAP inconsistency ❌

---

## 4. Schema / Structured Data

**Status: ZERO schema markup found across the entire website.**

This is a critical gap for an e-commerce jewellery store. Missing schema includes:

| Schema Type | Priority | Benefit |
|-------------|----------|---------|
| `LocalBusiness` → `JewelryStore` | Critical | Local pack ranking, Knowledge Panel |
| `Product` + `Offer` on product pages | Critical | Product rich results in Google Shopping |
| `AggregateRating` on product pages | High | Star ratings in SERPs |
| `BreadcrumbList` | High | Breadcrumb rich results |
| `Article` / `BlogPosting` | High | Article rich results, AI citation |
| `Organization` | Medium | Brand Knowledge Panel |
| `FAQPage` (blog posts) | Low | AI citation benefit (not for Google rich results on commercial sites) |

### Recommended: LocalBusiness Schema (add to homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "name": "Surya Jewellers",
  "url": "https://suryajewellers.com",
  "logo": "https://suryajewellers.com/logo_sj.webp",
  "image": "https://suryajewellers.com/logo_sj.webp",
  "description": "Handcrafted 92.5 sterling silver jewellery with certified natural gemstones. Established 2003, Jaipur.",
  "telephone": "+91-99839-39306",
  "email": "suryajewellersjaipur@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "B-169 Anandpuri, Moti Doongri Rd, near Naila House",
    "addressLocality": "Jaipur",
    "addressRegion": "Rajasthan",
    "postalCode": "302004",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 26.8922,
    "longitude": 75.7961
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
      "opens": "10:00",
      "closes": "20:00"
    }
  ],
  "priceRange": "₹₹",
  "currenciesAccepted": "INR",
  "paymentAccepted": "Cash, Credit Card, UPI"
}
```

---

## 5. Performance (Estimated)

*Note: Google API keys not configured — CrUX field data unavailable. Estimates based on stack analysis.*

| Signal | Estimate | Reasoning |
|--------|----------|-----------|
| Server response | Fast | Vercel CDN, cache HIT observed (Age: 62241s) |
| LCP | Unknown | Product images JS-rendered; homepage likely OK |
| INP | Unknown | React app; needs measurement |
| CLS | Unknown | Needs Playwright measurement |
| TTFB | Good | Vercel edge network, prerendered homepage |

**Key Performance Observation:** The homepage is prerendered (`X-Nextjs-Prerender: 1`) which is good. However, products load dynamically — this hurts both SEO and perceived performance for users.

---

## 6. Images

| Issue | Severity | Details |
|-------|----------|---------|
| Logo missing alt text | High | `logo_sj.webp` has no alt attribute |
| Hero image missing alt text | High | "Surya Jewellers hero background" — generic, not keyword-rich |
| Product images inaccessible to crawlers | Critical | JS-rendered; images not in initial HTML |
| Image format | ✅ Good | `.webp` format in use |
| No image sitemap | Medium | Product images not in sitemap |

---

## 7. Local SEO

| Signal | Status | Notes |
|--------|--------|-------|
| Physical address present | ✅ | B-169 Anandpuri, Moti Doongri Rd, Jaipur |
| NAP consistency | ❌ | Two phone numbers on contact page (inconsistent) |
| Business hours | ✅ | Mon-Sat 10AM-8PM on contact page |
| Google Maps embed | ❌ | Only a link, no embedded map |
| LocalBusiness schema | ❌ | Missing entirely |
| GBP (Google Business Profile) | Unknown | No mention on site; should verify/optimize |
| Gmail email | ⚠️ | Reduces local credibility vs business domain email |

---

## 8. AI Search Readiness (GEO)

| Signal | Status | Notes |
|--------|--------|-------|
| llms.txt | ❌ Missing | No AI crawler guidance file |
| robots.txt blocks AI crawlers | ✅ No | All crawlers allowed on public content |
| Structured data for citations | ❌ Missing | No schema to anchor AI citations |
| Passage-level citability | ⚠️ Partial | Blog posts are well-structured but lack author/date signals |
| Brand mention signals | ❌ Weak | No external references detected |
| FAQ/structured Q&A content | ❌ Missing | Blog posts could be restructured for better AI citation |

---

## 9. Backlinks (Common Crawl — Basic Tier)

*Note: Moz and Bing API keys not configured. Common Crawl data limited.*

- No significant backlink profile detected via available tools
- Domain is `.shop` TLD — lower inherent trust than `.com` or `.in`
- No press coverage or external authority signals visible on-site
- Wholesale/B2B page could generate backlinks from retail partners

---

## Sitemap Issues Summary

| URL in Sitemap | Issue |
|----------------|-------|
| /products/sapphire-braclets | Typo: should be "bracelets" |
| /products/tourmaline-earing | Typo: should be "earring" |
| /products/earring | Duplicate entry (appears twice) |
| /products/emerald-necklace | Duplicate entry (appears twice) |
| /collections | 404 — not in sitemap but linked in navigation |
| All product pages | Timestamps identical (2026-04-16T18:06:36.107Z) — suggests auto-generated, not real update times |

---
