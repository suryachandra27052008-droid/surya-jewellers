import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ find: vi.fn(), reconcile: vi.fn(), token: vi.fn() }));
vi.mock('./commerce-orders', () => ({ findCommerceOrder: mocks.find, reconcileCommerceOrder: mocks.reconcile }));
vi.mock('./paypal', () => ({ getPayPalAccessToken: mocks.token }));
import { validRazorpayWebhook, validPayPalWebhook } from './payment-webhooks';
import { POST } from '@/app/api/webhooks/razorpay/route';
import { POST as paypalWebhook } from '@/app/api/webhooks/paypal/route';

const raw = JSON.stringify({ event: 'payment.captured', payload: { payment: { entity: { order_id: 'order-test', id: 'payment-test' } } } });
const signature = createHmac('sha256', 'test-webhook-secret').update(raw).digest('hex');
const request = (body = raw, sig = signature) => new Request('https://example.com/api/webhooks/razorpay', { method: 'POST', headers: { 'x-razorpay-signature': sig }, body });
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', 'test-webhook-secret'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('authenticated payment webhooks', () => {
  it('validates the raw body and rejects changed JSON or missing signatures', () => {
    expect(validRazorpayWebhook(raw, signature, 'test-webhook-secret')).toBe(true);
    expect(validRazorpayWebhook(raw + ' ', signature, 'test-webhook-secret')).toBe(false);
    expect(validRazorpayWebhook(raw, null, 'test-webhook-secret')).toBe(false);
    expect(validRazorpayWebhook(raw, signature, undefined)).toBe(false);
  });
  it('rejects forged events without looking up or modifying orders', async () => {
    expect((await POST(request(raw, 'bad-signature'))).status).toBe(401);
    expect(mocks.find).not.toHaveBeenCalled();
  });
  it('reconciles a verified event against the provider instead of trusting its amounts', async () => {
    mocks.find.mockResolvedValue({ _id: 'orders.test', checkoutVersion: 2 });
    mocks.reconcile.mockResolvedValue({ success: true });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.reconcile).toHaveBeenCalledWith({ _id: 'orders.test', checkoutVersion: 2 }, { paymentId: 'payment-test' });
  });
  it('asks the provider to retry if order processing fails', async () => {
    mocks.find.mockResolvedValue({ checkoutVersion: 2 }); mocks.reconcile.mockRejectedValue(new Error('Database unavailable'));
    expect((await POST(request())).status).toBe(503);
  });
  it('fails closed if the webhook has not been configured', async () => {
    vi.stubEnv('RAZORPAY_WEBHOOK_SECRET', '');
    expect((await POST(request())).status).toBe(503);
  });
  it('does not accept a PayPal event without its required headers', async () => {
    vi.stubEnv('PAYPAL_WEBHOOK_ID', 'test-webhook');
    expect(await validPayPalWebhook(new Request('https://example.com'), {})).toBe(false);
    expect(mocks.token).not.toHaveBeenCalled();
  });
});

describe('PayPal provider signature verification', () => {
  const event = { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { supplementary_data: { related_ids: { order_id: 'ORDERTEST' } } } };
  const paypalRequest = () => new Request('https://example.com/api/webhooks/paypal', { method: 'POST', body: JSON.stringify(event),
    headers: { 'paypal-auth-algo': 'SHA256withRSA', 'paypal-cert-url': 'https://api.paypal.com/test-cert',
      'paypal-transmission-id': 'test-transmission', 'paypal-transmission-sig': 'test-signature',
      'paypal-transmission-time': '2026-10-27T00:00:00Z' } });
  beforeEach(() => { vi.stubEnv('PAYPAL_WEBHOOK_ID', 'test-webhook'); mocks.token.mockResolvedValue('test-access-token'); });
  it('passes the original event and configured webhook identity to PayPal for verification', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ verification_status: 'SUCCESS' })); vi.stubGlobal('fetch', fetch);
    expect(await validPayPalWebhook(paypalRequest(), event)).toBe(true);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('https://api-m.paypal.com/v1/notifications/verify-webhook-signature');
    expect(JSON.parse(init.body)).toMatchObject({ webhook_id: 'test-webhook', webhook_event: event, transmission_id: 'test-transmission' });
  });
  it('rejects provider-verification failure before looking up an order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ verification_status: 'FAILURE' })));
    expect((await paypalWebhook(paypalRequest())).status).toBe(401); expect(mocks.find).not.toHaveBeenCalled();
  });
  it('requests webhook redelivery if signature verification is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    expect((await paypalWebhook(paypalRequest())).status).toBe(503); expect(mocks.find).not.toHaveBeenCalled();
  });
  it('fails closed on verification timeout without touching an order', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Timed out', 'TimeoutError')));
    expect((await paypalWebhook(paypalRequest())).status).toBe(503); expect(mocks.find).not.toHaveBeenCalled();
  });
});
