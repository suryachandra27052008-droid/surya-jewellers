import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: mocks.fetch } }));
vi.mock('@/components/admin/PrintButton', () => ({ default: () => null }));
import PackingSlip from '@/app/admin/orders/[id]/packing-slip/page';

beforeEach(() => vi.clearAllMocks());
describe('packing slip ring sizes', () => {
  it('prints saved sizes and flags missing historical sizes without leaking internal notes', async () => {
    mocks.fetch.mockResolvedValue({ razorpayOrderId: 'TESTORDER', status: 'paid',
      customer: { name: 'Test Buyer', address: 'Test address', phone: '' }, internalNotes: 'PRIVATE NOTE',
      items: [{ productId: 'ring-one', name: 'Emerald Ring', quantity: 1, ringSize: 12 },
        { productId: 'ring-old', name: 'Historical Ring', quantity: 1 }] });
    const html = renderToStaticMarkup(await PackingSlip({ params: Promise.resolve({ id: 'orders.test' }) }));
    expect(html).toContain('Ring size (India): 12');
    expect(html).toContain('Ring size not recorded - confirm with customer');
    expect(html).not.toContain('PRIVATE NOTE');
  });
});
