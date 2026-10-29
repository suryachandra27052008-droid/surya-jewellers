import { evaluate, parse } from 'groq-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('@/lib/sanity/client', () => ({ client: { fetch: mocks.fetch } }));
import { GET } from './route';
const product = { _id: 'public-product', _type: 'product', name: 'Test Ring', slug: { current: 'ring' }, price: 15999,
  inStock: true, stockQuantity: 1, customer: { email: 'must-not-leak@example.com' }, checkoutReservation: { id: 'private' } };
beforeEach(() => {
  mocks.fetch.mockReset().mockImplementation(async (query: string, params: Record<string, unknown>) => {
    const result = await evaluate(parse(query), { params, dataset: [product,
      { ...product, _id: 'bad-price', price: 19 }, { ...product, _id: 'drafts.hidden' },
      { ...product, _id: 'sold', inStock: false, stockQuantity: 0 }, { ...product, _id: 'orders.private', _type: 'order' }] });
    return result.get();
  });
});
const request = (query = '') => new Request(`https://example.com/api/catalog${query}`);
describe('public catalogue projection', () => {
  it('exposes only eligible product fields, never reservations or customer/order data', async () => {
    const response = await GET(request()); const data = await response.json();
    expect(data.products.map((p: { _id: string }) => p._id)).toEqual(['public-product']);
    expect(JSON.stringify(data)).not.toMatch(/must-not-leak|checkoutReservation|customer/);
    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
  });
  it('loads current data for viewed IDs and allows honest sold-out history', async () => {
    const data = await (await GET(request('?ids=sold,public-product,orders.private,bad-price'))).json();
    expect(data.products.map((p: { _id: string }) => p._id).sort()).toEqual(['public-product', 'sold']);
    expect(data.products.find((p: { _id: string }) => p._id === 'public-product').price).toBe(15999);
  });
  it.each(['?ids=', '?ids=../bad', '?ids=drafts.hidden', '?ids=%22%5D%20%7C%20*%5B', `?ids=${Array.from({ length: 13 }, (_, i) => `p${i}`).join(',')}`])('rejects malformed or unbounded ID selections: %s', async query => {
    expect((await GET(request(query))).status).toBe(400); expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('fails safely if the CMS is unavailable', async () => {
    mocks.fetch.mockRejectedValue(new Error('CMS error with private configuration'));
    const response = await GET(request()); expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private configuration');
  });
});
