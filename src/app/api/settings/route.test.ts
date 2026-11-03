import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('next-sanity', () => ({ createClient: () => ({ fetch: mocks.fetch }) }));
import { GET } from './route';
beforeEach(() => { vi.clearAllMocks(); });
describe('public campaign settings', () => {
  it('exposes shipping fields but never private coupon or customer settings', async () => {
    mocks.fetch.mockResolvedValue({ shippingPromotionEnabled: true, shippingPromotionMinOrder: 15000,
      shippingPromotionId: 'diwali-2026', couponCode: 'PRIVATE', couponCustomerEmail: 'private@example.com' });
    const response = await GET(); const body = await response.json();
    expect(body).toMatchObject({ shippingPromotionEnabled: true, shippingPromotionMinOrder: 15000 });
    expect(body).not.toHaveProperty('couponCode'); expect(body).not.toHaveProperty('couponCustomerEmail');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('fails closed when settings are unavailable', async () => {
    mocks.fetch.mockRejectedValue(new Error('unavailable'));
    expect(await (await GET()).json()).toMatchObject({ shippingPromotionEnabled: false });
  });
});
