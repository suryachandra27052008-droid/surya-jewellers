# Compatibility release - 10 September 2026

## Scope

This isolated release starts from the deployed b5bddd5 version. The original
surya-jewellers working directory retains the unfinished checkout rewrite.

- New Razorpay and PayPal orders use private Sanity subpath IDs.
- Admin order reads use the authenticated client and private/no-store responses.
- Order status updates reject IDs that are not order documents.
- Product titles use the existing SKU-based SEO helper, Offer prices use existing
  sale settings, and unsupported blanket delivery/free-return claims are removed.
- Sitemap revalidates hourly.
- Compatible dependency lockfile updates are included. Excel upload code and its
  adm-zip/jszip versions are unchanged.

## Preserved behavior

Checkout UI, payment creation/capture, price calculation, existing shipping and
currency rules, credentials, intro animation, product prices, Excel upload,
contact verification, wishlist and cart code are unchanged from b5bddd5.
Only the storage ID changes in payment confirmation handlers. Existing order
lookup by payment ID still recognizes both legacy and private IDs.

The snapshot/reservation/webhook/international checkout rewrite is NOT included.
It still requires provider configuration and controlled payment verification.
Ring-size propagation from that pending change is also not included.

## Validation

- npm ci --ignore-scripts: completed.
- npm test: 16 passed across four files, including six order privacy tests.
- npm run lint: zero errors, five existing warnings.
- npm run build: passed, 596 pages; existing Edge Runtime deprecation warning.
- git diff --check: passed.
- Local production HTTP checks: home, products, checkout, sitemap 200;
  anonymous admin orders 401; authenticated admin orders 200 and count 2.
- Playwright: add Ruby Stud to bag, navigate to checkout, preserve quantity and
  displayed price; desktop 1440x900 and mobile 390x844 screenshots inspected.
- Clerk production keys reject localhost, so local sign-in is not verified.
- No real payment, customer email or product stock mutation was performed in tests.
- npm audit currently reports 14 entries: 5 high, 9 moderate, zero critical.
  Remaining advisories require a separate dependency review, particularly the
  explicitly excluded Excel dependency and upstream Sanity tooling. Do not use
  npm audit fix --force as a compatibility fix.

## Legacy order migration

scripts/migrate-private-orders.cjs defaults to read-only. It identifies two root
order documents. Applying it requires the private-order admin reader/writers to
be deployed first. It backs up the records outside the repository, refuses
referenced/colliding records, and moves each record using a revision-guarded
transaction without changing customer, payment, item or total fields.

## Remaining risks

This is a narrowly scoped compatibility release, not a certification that all
previous audit findings are fixed. Existing payment reconciliation, stock races,
ring sizes, unapproved international rates and merchant pricing review remain.
No new payment keys or webhooks are required for this limited release.
