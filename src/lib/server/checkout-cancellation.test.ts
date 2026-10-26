import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ find: vi.fn(), paypal: vi.fn(), release: vi.fn(), patch: vi.fn(), set: vi.fn(), commit: vi.fn() }));
vi.mock('./commerce-orders', () => ({ findCommerceOrder: mocks.find }));
vi.mock('./paypal', () => ({ getPayPalOrder: mocks.paypal }));
vi.mock('./inventory-reservations', () => ({ releaseStock: mocks.release }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { patch: mocks.patch } }));
import { cancelCheckout, checkoutCancellationToken } from './checkout-cancellation';

beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv('ENQUIRY_VERIFICATION_SECRET', 'test-cancellation-secret');
  mocks.find.mockResolvedValue({ _id: 'orders.test', checkoutVersion: 2, reservationId: 'hold-test', status: 'pending', items: [{ productId: 'ring-test', quantity: 1 }] });
  mocks.patch.mockReturnValue({ set: mocks.set }); mocks.set.mockReturnValue({ commit: mocks.commit }); mocks.commit.mockResolvedValue({}); mocks.release.mockResolvedValue(undefined);
});
afterEach(() => vi.unstubAllEnvs());
describe('safe checkout cancellation', () => {
  it('rejects a cancellation without the secret checkout-specific proof', async () => {
    await expect(cancelCheckout('paypal', 'ORDERTEST', '0'.repeat(64))).rejects.toThrow('Invalid');
    expect(mocks.paypal).not.toHaveBeenCalled(); expect(mocks.release).not.toHaveBeenCalled();
  });
  it('does not release a captured or approved PayPal payment', async () => {
    mocks.paypal.mockResolvedValue({ status: 'APPROVED' });
    await expect(cancelCheckout('paypal', 'ORDERTEST', checkoutCancellationToken('ORDERTEST', 'hold-test'))).rejects.toThrow('progress');
    expect(mocks.release).not.toHaveBeenCalled();
  });
  it('releases an unpaid abandoned checkout but does not remove products or send emails', async () => {
    mocks.paypal.mockResolvedValue({ status: 'CREATED' });
    await cancelCheckout('paypal', 'ORDERTEST', checkoutCancellationToken('ORDERTEST', 'hold-test'));
    expect(mocks.release).toHaveBeenCalledWith([{ _id: 'ring-test', quantity: 1 }], 'hold-test');
    expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
  });
});
