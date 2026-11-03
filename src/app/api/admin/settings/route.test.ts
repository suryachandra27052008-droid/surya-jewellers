import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), patch: vi.fn(), commit: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: mocks.fetch, transaction: () => {
  const transaction = { createIfNotExists: () => transaction, patch: (id: string, values: unknown) => { mocks.patch(id, values); return transaction; }, commit: mocks.commit };
  return transaction;
} } }));
import { POST } from './route';
const offer = { shippingPromotionEnabled: true, shippingPromotionId: 'diwali-2026', shippingPromotionName: 'Diwali Special',
  shippingPromotionStartDate: '2026-11-03', shippingPromotionEndDate: '2026-11-15', shippingPromotionMinOrder: 15000 };
const request = (body: unknown) => new Request('https://www.suryajewellers.com/api/admin/settings', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
beforeEach(() => { vi.clearAllMocks(); mocks.fetch.mockResolvedValue(null); mocks.commit.mockResolvedValue({}); });
describe('admin shipping campaign settings', () => {
  it('saves validated promotion settings independently of percentage sales', async () => {
    expect((await POST(request(offer))).status).toBe(200);
    expect(mocks.patch).toHaveBeenCalledWith('siteSettings', { set: offer });
  });
  it.each([{ shippingPromotionMinOrder: -1 }, { shippingPromotionStartDate: '2026-02-30' },
    { shippingPromotionEndDate: '2026-11-02' }, { shippingPromotionEnabled: 'true' },
    { shippingPromotionStartDate: '' }])('rejects malformed enabled campaign settings: %j', async change => {
    expect((await POST(request({ ...offer, ...change }))).status).toBe(400);
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('supports disabling a campaign without supplying all fields again', async () => {
    mocks.fetch.mockResolvedValue(offer);
    expect((await POST(request({ shippingPromotionEnabled: false }))).status).toBe(200);
  });
});
