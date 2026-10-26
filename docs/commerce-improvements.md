# Commerce Improvements

Product prices, currency rates, the current shipping charges, Excel uploads and the introduction animation are unchanged.

Targeted maintenance in this local copy updates Next.js/eslint-config-next to 16.4.3 and the transitive DOMPurify package to 3.4.17. This clears the two pre-existing critical npm audit findings. Other high/moderate dependency advisories remain; this is not a claim that the entire dependency tree is vulnerability-free.

## Payment and Stock Flow

New checkouts create a private order snapshot before returning the payment link. The snapshot preserves the original products, quantities, discount, shipping, payment currency, payment amount and delivery details. Orders use the existing `orders.` private-ID namespace.

Stock is reserved for 20 minutes using Sanity transactions with revision guards. Expired abandoned holds can be replaced. A provider-confirmed pending capture retains its hold until resolved. Final stock consumption and its order marker are committed atomically and cannot be applied twice. Late captured payments that conflict with stock are flagged and blocked from dispatch; no automatic refund is attempted.

Razorpay keeps the merchant's existing capture settings by default. Explicit manual capture is enabled only when both `RAZORPAY_MANUAL_CAPTURE_ENABLED=true` and `RAZORPAY_WEBHOOK_SECRET` are configured. The server verifies the authorization and available stock before capture. The opt-in manual-capture path must be tested in the merchant's sandbox before activation, including UPI and international cards. Existing callback payloads and old orders retain the compatibility path.

PayPal uses the delivery address entered on the website through `SET_PROVIDED_ADDRESS`, rather than silently replacing it with a different saved PayPal address. Only provider-approved orders can be captured.

Closing a Razorpay window or returning from PayPal's cancellation screen requests reservation release using a signed, checkout-specific cancellation token. The server checks that no authorization/capture is in progress before releasing stock. Uncertain payment states fail closed.

## Provider Activation Required Before Release

Existing API keys are reused. Webhook receivers are implemented but must be registered in the corresponding live merchant accounts after local review and sandbox verification:

- PayPal endpoint: `https://www.suryajewellers.com/api/webhooks/paypal`
- PayPal events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.PENDING`, `PAYMENT.CAPTURE.DENIED`
- Configure server variable `PAYPAL_WEBHOOK_ID` with that registration's webhook ID.
- Razorpay endpoint: `https://www.suryajewellers.com/api/webhooks/razorpay`
- Razorpay events: `payment.authorized`, `payment.captured`, `order.paid`
- Configure server variable `RAZORPAY_WEBHOOK_SECRET` with the webhook's signing secret. This is separate from the API key secret.

Unsigned events are rejected, and missing configuration returns an unavailable response instead of accepting unverified data. PayPal signatures are checked with PayPal's verification API; Razorpay signatures use the raw request body and constant-time HMAC comparison. Verified events re-read the payment from the provider rather than trusting incoming amounts.

The existing daily authenticated cron additionally reconciles a bounded batch of new checkouts and retries confirmation emails. It uses the existing `CRON_SECRET`; there is no new paid scheduler. Daily reconciliation is a fallback, not a replacement for registered webhooks. Admin can also run Retry order updates. The admin order page shows whether each webhook is configured.

Confirmation emails use the original order currency/amount and a stable Resend idempotency key. Their sent marker is saved permanently. Uncertain failed sends older than the provider's idempotency window are flagged for review instead of risking duplicate delivery. This feature does not resend historical customer emails.

## Customer and Admin Surfaces

### Ring Sizes and Collection Returns

Ring sizes from the existing 5-20 India selector now travel through the bag, server-validated checkout, immutable order snapshot, admin order details, packing slips, My Orders and confirmation emails. Different sizes remain separate line items, while stock checks aggregate all sizes of the same product. New ring checkouts require a size; historical orders without one are clearly flagged for merchant confirmation, never backfilled with a guessed size. Ring quick-add buttons open the size selector.

Collection search, category, gemstone, price, sort, loaded count and view are preserved in the URL. Product links include a validated local return destination. Browser Back and the product breadcrumb return to the filtered collection, with the saved list position restored when browser storage is available.

- `/account`: real order history, current order status and saved courier/tracking details. The API uses the authenticated Clerk user ID; older unowned orders are linked only through server-verified email addresses. Internal notes and payment diagnostics are not exposed.
- `/products`: immediate product-name, gemstone, category and SKU search, alongside existing filters. Submitted searches can be shared using `?q=`.
- `/checkout`: searchable country suggestions, country-aware postcode validation, address autofill attributes and international duties notice. Approved delivery estimates are editable in admin shipping settings; nothing is displayed until the merchant supplies them.
- `/admin/orders`: search, status/attention filters, retry action, courier/tracking fields, internal notes and packing-slip links. Unpaid or stock-blocked orders cannot be manually marked confirmed/shipped/delivered.
- `/admin/orders/[id]/packing-slip`: authenticated, print-friendly order sheet, excluding internal notes and showing a prominent warning for unpaid or stock-blocked orders.
- `/admin/analytics`: shopping funnel with date range, country and device breakdowns, alongside existing sales analytics.

## Optional Analytics

Shopping-stage tracking requires an explicit opt-in and respects Do Not Track and Global Privacy Control. A random browser session value is hashed with a purpose-specific HMAC on the server. Raw session values, names, email addresses, delivery addresses, full IPs and user-agent strings are not stored in analytics records. Country comes from the hosting platform header and device is a broad mobile/desktop category.

Counts represent opted-in sessions reaching a stage per day, not all website visitors or guaranteed sequential funnel cohorts. Repeated stage events are deduplicated. Purchase events are recorded server-side only after provider confirmation. Historic visitor counts are not reconstructed. Records use private `analytics.` IDs and are removed after 90 days by the existing cleanup cron.

## Safe Local Preview

Start the production build with `COMMERCE_REVIEW_MODE=1` to block POST/PATCH/DELETE requests and cron execution in the Next.js proxy. This preserves read-only review of current data without allowing local preview buttons to send emails, start payments or modify the live CMS. Do not set this flag on the production deployment unless deliberately placing the site into read-only review mode.

Real Clerk sign-in cannot be fully exercised on localhost using a production-only Clerk instance. Customer-history authorization is tested with mocked server identities; complete a staging-domain sign-in test before publishing.

Official references:

- https://developer.paypal.com/api/rest/webhooks/
- https://developer.paypal.com/api/rest/webhooks/rest/
- https://razorpay.com/docs/webhooks/validate-test/
- https://www.sanity.io/docs/content-lake/transactions
