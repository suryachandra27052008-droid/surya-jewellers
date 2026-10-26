import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ find: vi.fn(), reconcile: vi.fn(), token: vi.fn() }));
vi.mock('./commerce-orders', () => ({ findCommerceOrder: mocks.find, reconcileCommerceOrder: mocks.reconcile }));
vi.mock('./paypal', () => ({ getPayPalAccessToken: mocks.token }));
import { validRazorpayWebhook, validPayPalWebhook } from './payment-webhooks';
import { POST } from '@/app/api/webhooks/razorpay/route';

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
