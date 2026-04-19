# SEO Action Plan — Surya Jewellers
**Generated:** 2026-04-17  
**Health Score:** 37/100  
**Target Score:** 70+ (after all High priority fixes)

---

## CRITICAL — Fix Immediately

### C1. Fix JavaScript Rendering of Product Pages
**Impact:** 🔴 Cannot rank for any product keywords until fixed  
**Effort:** High (developer work)  
**Details:**
- Products page and individual product pages render content client-side only
- Googlebot sees "Loading…" — no product names, prices, descriptions, or images
- Fix: Enable Next.js SSR (`getServerSideProps`) or SSG (`getStaticProps` + `getStaticPaths`) for all product pages
- All product data must be in the initial HTML response
- Test with: `curl https://suryajewellers.shop/products/emerald-ring` — should return full product content

### C2. Add Product Schema to All Product Pages
**Impact:** 🔴 Missing Google Shopping rich results, product carousels  
**Effort:** Medium (once products are SSR'd)  
**Details:**
- Add `Product` + `Offer` + `AggregateRating` JSON-LD to every product page
- Include: name, description, image, price, priceCurrency, availability, sku, brand
- Example slug: `emerald-ring` → Product name "Emerald Silver Ring", material "92.5 Sterling Silver"

### C3. Add Meta Descriptions to All Pages
**Impact:** 🔴 Affects CTR across all SERP listings  
**Effort:** Low (1–2 hours)  
**Pages needing meta descriptions (write unique 150–160 char descriptions):**
- Homepage: "Handcrafted 92.5 sterling silver jewellery with certified natural gemstones. Explore rings, necklaces, earrings & more from Jaipur. Free shipping across India."
- Products/Collections: "Browse our complete range of handcrafted sterling silver jewellery — rings, necklaces, earrings, bracelets & pendants. All pieces certified authentic."
- About: "Surya Jewellers — a Jaipur family jeweller since 2003. Handcrafted sterling silver with certified diamonds and precious stones. Meet our founder Sanjay Chandra."
- Contact: "Visit or contact Surya Jewellers in Jaipur. B-169 Anandpuri, Moti Doongri Rd. Open Mon–Sat 10AM–8PM. Call +91 99839 39306 or WhatsApp us."
- Each product page: Unique description with product name, material, gemstone, price range
- Each blog post: Unique description summarising the article

### C4. Fix Duplicate Title Tags
**Impact:** 🔴 Google can't distinguish pages; keyword cannibalization  
**Effort:** Low (1 hour)  
**Fix:**
- Contact: "Contact Surya Jewellers | Visit Our Jaipur Studio | +91 99839 39306"
- Wholesale: "Wholesale Silver Jewellery | B2B Partner with Surya Jewellers Jaipur"
- Shipping: "Shipping & Returns Policy | Surya Jewellers"
- About: "About Surya Jewellers | Handcrafted Silver Since 2003 | Jaipur"
- Blog posts: "[Post Title] | Surya Jewellers Journal"
- Product pages: "[Product Name] | 92.5 Sterling Silver | Surya Jewellers"

---

## HIGH — Fix Within 1 Week

### H1. Add LocalBusiness (JewelryStore) Schema
**Impact:** 🟠 Local pack rankings, Knowledge Panel  
**Effort:** Low (30 min)  
- Add JSON-LD to homepage `<head>` — full schema in FULL-AUDIT-REPORT.md §4
- Pick ONE consistent phone number (recommend: +91 99839 39306)

### H2. Fix NAP Inconsistency — Two Phone Numbers
**Impact:** 🟠 Confuses Google and local directories; hurts local rankings  
**Effort:** Low (15 min)  
- Contact page shows two numbers: 99839 39306 and 9358842102
- Pick one canonical number and use it everywhere (site, GBP, citations)

### H3. Fix Product Page H1 Tags
**Impact:** 🟠 Wrong H1 means no keyword signals on product pages  
**Effort:** Low (once SSR is in place)  
- Current H1 on all product pages: "SURYA Jewellers" — wrong
- Fix: H1 should be the product name, e.g., "Emerald Ring in 92.5 Sterling Silver"

### H4. Add BlogPosting Schema to All Blog Posts
**Impact:** 🟠 Article rich results, better AI citation, E-E-A-T signals  
**Effort:** Low (2 hours for all 5 posts)  
```json
{
  "@type": "BlogPosting",
  "headline": "How to Care for 92.5 Sterling Silver Jewellery",
  "author": { "@type": "Person", "name": "Sanjay Chandra" },
  "publisher": { "@type": "Organization", "name": "Surya Jewellers" },
  "datePublished": "2025-03-01",
  "dateModified": "2025-03-01",
  "image": "...",
  "url": "https://suryajewellers.shop/blog/care-for-sterling-silver"
}
```

### H5. Add Author Bylines to Blog Posts
**Impact:** 🟠 E-E-A-T: Expertise and Authoritativeness signals  
**Effort:** Low (1 hour)  
- Add author name (Sanjay Chandra or Pooja Chandra), role, and short bio to each post
- This signals genuine expertise to both Google and AI search engines

### H6. Fix /collections → 404
**Impact:** 🟠 Navigation links to a broken page  
**Effort:** Low (15 min)  
- Either create the `/collections` route or redirect it to `/products`
- Check all navigation and internal links for the `/collections` path

### H7. Fix Sitemap Typos and Duplicates
**Impact:** 🟠 Crawl waste; typo URLs will 404  
**Effort:** Low (15 min)  
- Fix: `/products/sapphire-braclets` → `/products/sapphire-bracelets`
- Fix: `/products/tourmaline-earing` → `/products/tourmaline-earring`
- Remove duplicate entries for `/products/earring` and `/products/emerald-necklace`
- Verify these URLs actually return 200 status

### H8. Add Canonical Tags to All Pages
**Impact:** 🟠 Prevents duplicate content issues  
**Effort:** Low (developer — 30 min)  
- Add `<link rel="canonical" href="https://suryajewellers.shop/[path]" />` to every page
- In Next.js: add to `<Head>` component or use `metadata.alternates.canonical`

### H9. Add Alt Text to All Images
**Impact:** 🟠 Image search rankings + accessibility  
**Effort:** Medium (audit all product images once SSR fixed)  
- Logo: alt="Surya Jewellers — 92.5 Sterling Silver Jewellery Jaipur"
- Hero: alt="Handcrafted 92.5 sterling silver jewellery by Surya Jewellers, Jaipur"
- Product images: alt="[Product name] in 92.5 sterling silver with [gemstone]"

---

## MEDIUM — Fix Within 1 Month

### M1. Set Up / Optimise Google Business Profile
**Impact:** 🟡 Critical for local "jewellery shop near me" searches  
**Effort:** Medium (2–3 hours initial setup)  
- Claim/verify GBP at business.google.com
- Add all photos (store, products, team), business hours, description
- Use consistent NAP from H2 above
- Add product catalogue to GBP

### M2. Add BreadcrumbList Schema
**Impact:** 🟡 Breadcrumb rich results in SERPs  
**Effort:** Low  
- Add to all product pages: Home > Rings > Emerald Ring
- Add to all blog posts: Home > Journal > [Post Title]

### M3. Add Google Maps Embed to Contact Page
**Impact:** 🟡 Local trust signal; GBP integration  
**Effort:** Low (30 min)  
- Replace the "directions link" with an actual embedded Google Map iframe

### M4. Add Internal Links from Blog Posts to Products
**Impact:** 🟡 Pass PageRank to product pages; improve content UX  
**Effort:** Low (1–2 hours)  
- "How to Care for Sterling Silver" → link to relevant product pages
- "Guide to Natural Gemstones" → link to emerald ring, sapphire bracelet, etc.
- "How to Style Silver Jewellery" → link to specific category pages

### M5. Add Missing Security Headers
**Impact:** 🟡 Trust signals, minor ranking factor  
**Effort:** Low (Vercel config — 30 min)  
Add to `vercel.json` or `next.config.js`:
```json
"headers": [
  { "key": "X-Content-Type-Options", "value": "nosniff" },
  { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
  { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
]
```

### M6. Add llms.txt for AI Search Visibility
**Impact:** 🟡 Better AI Overview and Perplexity citations  
**Effort:** Low (30 min)  
Create `https://suryajewellers.shop/llms.txt`:
```
# Surya Jewellers

Surya Jewellers is a family-owned fine jewellery brand from Jaipur, India, 
specialising in handcrafted 92.5 sterling silver jewellery with certified 
natural gemstones. Established in 2003 by Sanjay and Pooja Chandra.

## Key Pages
- Homepage: https://suryajewellers.shop/
- Collections: https://suryajewellers.shop/products
- About: https://suryajewellers.shop/about
- Blog/Journal: https://suryajewellers.shop/blog
- Contact: https://suryajewellers.shop/contact
```

### M7. Use Business Domain Email
**Impact:** 🟡 Professional credibility; E-E-A-T signal  
**Effort:** Low (Zoho Mail free tier available for custom domains)  
- Replace `suryajewellersjaipur@gmail.com` with `hello@suryajewellers.shop`

### M8. Add AggregateRating Schema
**Impact:** 🟡 Star ratings visible in SERPs  
**Effort:** Medium (requires collecting and displaying reviews)  
- Display customer reviews publicly on product pages
- Add `AggregateRating` to `Product` schema with real review data

### M9. Expand Collections/Category Pages
**Impact:** 🟡 Missing keyword targets for category searches  
**Effort:** Medium  
- "Rings" category page should target: "92.5 silver rings Jaipur", "sterling silver rings India"
- Each category needs unique H1, meta description, and introductory paragraph (150+ words)
- Currently categories load via URL params — consider dedicated SEO landing pages

---

## LOW — Backlog

### L1. Add image sitemap for product images
- Once products are SSR'd, include product image URLs in sitemap

### L2. Add FAQ sections to key blog posts  
- AI/LLM citation benefit (not for Google rich results on commercial sites)
- Wrap in FAQPage schema

### L3. Add Organization schema to homepage
- Supports brand Knowledge Panel
- Include sameAs links to social profiles

### L4. Build backlinks through wholesale partnerships
- Ask B2B partners to link to suryajewellers.shop
- Submit to Indian jewellery directories

### L5. Add structured data for shipping policy
- `ShippingDeliveryTime`, `OfferShippingDetails` on product pages

### L6. Consider migrating from .shop to .in TLD
- `.in` domain carries more local trust for Indian searches
- Long-term consideration, not urgent

---

## Implementation Roadmap

### Week 1 (Developer Sprint)
- [ ] Fix JS rendering → SSR/SSG all product pages (C1)
- [ ] Fix /collections 404 (H6)
- [ ] Fix sitemap typos + duplicates (H7)
- [ ] Add canonical tags (H8)
- [ ] Add security headers in vercel.json (M5)

### Week 1 (Content/Marketing Sprint — no dev needed)
- [ ] Write meta descriptions for all pages (C3)
- [ ] Fix title tags (C4)
- [ ] Fix phone number inconsistency (H2)
- [ ] Add author bylines to blog posts (H5)

### Week 2 (Schema Sprint)
- [ ] Add LocalBusiness/JewelryStore schema (H1)
- [ ] Add Product + Offer schema to all product pages (C2) — after SSR fix
- [ ] Add BlogPosting schema to all blog posts (H4)
- [ ] Add BreadcrumbList schema (M2)

### Week 3 (Local SEO Sprint)
- [ ] Set up/optimise Google Business Profile (M1)
- [ ] Add Google Maps embed to contact page (M3)
- [ ] Fix alt text on all images (H9)
- [ ] Add internal links from blog posts to products (M4)

### Month 2+
- [ ] llms.txt (M6)
- [ ] Business domain email (M7)
- [ ] AggregateRating schema + public reviews (M8)
- [ ] Expand category pages with SEO content (M9)
- [ ] Backlink outreach to wholesale partners (L4)
