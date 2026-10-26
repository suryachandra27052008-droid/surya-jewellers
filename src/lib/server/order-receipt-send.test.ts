import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('resend', () => ({ Resend: class { emails = { send: mocks.send }; } }));
import { sendOrderReceiptEmail } from '@/lib/email';

const receipt = { reference: 'SJ-TEST', customer: { name: 'Test Buyer', email: 'buyer@example.com' },
  items: [{ name: 'Test Ring', price: 10400, quantity: 1 }], shipping: 0, total: 10400, currency: 'EUR' as const, chargedAmount: '100.00' };
beforeEach(() => vi.clearAllMocks());

describe('order confirmation delivery', () => {
  it('uses the customer address and a stable idempotency key, without provider status', async () => {
    mocks.send.mockResolvedValue({ data: { id: 'email-test' }, error: null });
    expect(await sendOrderReceiptEmail(receipt, 'receipt-test')).toBe('email-test');
    const [payload, options] = mocks.send.mock.calls[0];
    expect(payload.to).toBe('buyer@example.com');
    expect(payload.subject + payload.html + payload.text).not.toMatch(/paypal|pending|unclaimed|payment received/i);
    expect(options).toEqual({ idempotencyKey: 'receipt-test' });
  });
  it('reports provider rejection instead of claiming that the email was sent', async () => {
    mocks.send.mockResolvedValue({ data: null, error: { message: 'Delivery rejected' } });
    await expect(sendOrderReceiptEmail(receipt, 'receipt-test')).rejects.toThrow('Delivery rejected');
  });
});
