# PayPal order recording and recovery - 26 October 2026

## Incident evidence

The buyer's screenshot shows PayPal order reference 2X572683XK5557321,
three items still in the bag, a green success screen, and an error stating that
the order could not be saved. The merchant's PayPal screenshot shows EUR 221.13
as Unclaimed. The authenticated website admin API has only the two older
orders; the reported reference is absent.

The old result page always rendered success, including on capture/save errors.
The save route rejected PENDING captures without recording their items. Checkout
details existed only in browser storage and were not stored before the redirect.
The specific provider pending reason remains subject to a read-only provider
lookup; an account review notice alone does not prove the payment's exact cause.

## Changes

- Validate shipping details and save a private, server-priced pending PayPal
  order before returning the approval link. Storage failure withholds the link.
- Record capture PENDING as pending, without reducing stock or confirming by
  email. COMPLETED transitions to paid using the original snapshot and amount.
- Recognize existing captures on reload, and use a stable capture idempotency
  key. Status refresh/recovery never captures or accepts payments.
- Separate success, payment-pending and error screens. Keep cart/pending data
  until a completed order is recorded. Preserve the customer's reference.
- Add the recover=1 link mode for old checkouts. It skips the capture endpoint
  entirely and reads the existing capture before trying to record its items.
- Support the old browser payload for existing orders. Use supplied checkout
  information or actual PayPal payer/shipping fields; flag missing contact or
  shipping details for merchant review instead of inventing them.
- Show pending PayPal orders, provider currency/status and review flags in admin.
  Add a merchant-triggered PayPal status refresh for recorded pending orders.
- Exclude pending/failed orders from paid revenue, paid count and sales analytics.
- Add an authenticated, private/no-store read-only PayPal order diagnostic API.

## Verification

- npm test: 35 tests passed across seven files.
- npm run lint: no errors, five pre-existing admin warnings.
- npm run build: passed; existing Edge Runtime deprecation warning.
- git diff --check: passed.
- Tests cover pending captures, no pending stock/email action, lost browser
  storage, snapshot amount/currency consistency, mismatches, legacy review flags,
  storage failure before approval, and repeated captures/status checks.
- Browser plugin unavailable; Playwright CLI exercised local API simulations.
  Error/pending/paid screens checked at 390x844 and 1440x900. Pending checkout
  retains all three bag items; success clears them. The recovery link makes no
  capture call. Existing Clerk production-origin errors are expected locally.
- Anonymous local admin orders and diagnostic API requests return 401.
- No live payment, acceptance, refund, stock mutation or customer email was
  triggered by these tests. Existing Excel upload, Razorpay verification, intro,
  catalogue prices and EUR 104 conversion are unchanged.

## Existing purchase recovery

The customer must use their original browser if its old cart/pending checkout
is the only surviving item source. Do not guess product combinations from the
amount. The recovery URL reads the existing payment and may record the order;
it never calls the capture endpoint or accepts funds:

https://www.suryajewellers.com/order-success?payment=paypal&token=2X572683XK5557321&recover=1

If the retained items and provider amount verify, the order is recorded as
pending or paid according to PayPal. If the browser data is gone or does not
match, obtain the actual item names/SKUs and resolve manually. Missing details
remain explicitly flagged. Do not request another payment for this incident.

PayPal identity/account review and accepting an unclaimed payment remain owner
actions. This release does not add new payment keys or webhooks; an existing
pending order can be reconciled using the admin refresh control after PayPal
changes its status. Automatic webhook reconciliation remains separate work.
