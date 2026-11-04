import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ get: vi.fn(), fetch: vi.fn(), set: vi.fn(), revision: vi.fn(), commit: vi.fn(),
  invalidate: vi.fn(), upload: vi.fn(), delete: vi.fn() }));
vi.mock('@/lib/server/catalog-cache', () => ({ invalidateProductCatalog: mocks.invalidate }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { getDocument: mocks.get, fetch: mocks.fetch,
  delete: mocks.delete, assets: { upload: mocks.upload }, patch: () => {
    const patch = { ifRevisionId: (revision: string) => { mocks.revision(revision); return patch; },
      set: (fields: unknown) => { mocks.set(fields); return patch; }, commit: mocks.commit };
    return patch;
  } } }));
import { GET, PATCH } from './route';
const first = { _key: 'first', _type: 'image', asset: { _type: 'reference', _ref: 'image-old-one' }, hotspot: { x: 0.5, y: 0.4 } };
const second = { _key: 'second', _type: 'image', asset: { _type: 'reference', _ref: 'image-current-two' } };
const context = { params: Promise.resolve({ id: 'product-test' }) };
const request = (body: unknown) => new Request('https://example.com/api/admin/products/product-test', {
  method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: 'current', ...(body as Record<string, unknown>) }),
});
beforeEach(() => {
  vi.clearAllMocks(); mocks.get.mockResolvedValue({ _id: 'product-test', _type: 'product', _rev: 'current', price: 7999, images: [first, second] });
  mocks.commit.mockResolvedValue({ _id: 'product-test' });
});
describe('admin image changes', () => {
  it('reproduces the old last-image bug and now persists an explicit empty image selection', async () => {
    const form = new FormData(); form.set('keptImageRefs', '[]'); form.set('revision', 'current');
    const response = await PATCH(new Request('https://example.com/api/admin/products/product-test', { method: 'PATCH', body: form }), context);
    expect(response.status).toBe(200); expect(mocks.set).toHaveBeenCalledWith({ images: [] });
    expect(mocks.revision).toHaveBeenCalledWith('current'); expect(mocks.invalidate).toHaveBeenCalledOnce();
  });
  it('removes the first image and preserves the remaining selected image and its ordering', async () => {
    expect((await PATCH(request({ keptImageRefs: [{ _key: 'second', assetId: 'image-current-two' }] }), context)).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith({ images: [second] });
  });
  it('preserves crop/hotspot metadata on kept images', async () => {
    await PATCH(request({ keptImageRefs: [{ _key: 'first', assetId: 'image-old-one' }] }), context);
    expect(mocks.set).toHaveBeenCalledWith({ images: [first] });
  });
  it('does not remove images or reset prices on an unrelated stock update', async () => {
    await PATCH(request({ stockQuantity: 2 }), context);
    expect(mocks.set).toHaveBeenCalledWith({ stockQuantity: 2 });
  });
  it('rejects a stale editor instead of restoring previously deleted images or old prices', async () => {
    expect((await PATCH(request({ revision: 'old', price: 6999, keptImageRefs: [] }), context)).status).toBe(409);
    expect(mocks.set).not.toHaveBeenCalled();
  });
  it('rejects image references that no longer belong to this product', async () => {
    expect((await PATCH(request({ keptImageRefs: [{ _key: 'deleted', assetId: 'image-deleted' }] }), context)).status).toBe(409);
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('appends newly uploaded images after kept images without reviving removed ones', async () => {
    mocks.upload.mockResolvedValue({ _id: 'image-new-upload' });
    const form = new FormData(); form.set('keptImageRefs', JSON.stringify([{ _key: 'second', assetId: 'image-current-two' }]));
    form.set('revision', 'current');
    form.append('images', new File(['offline test'], 'test.jpg', { type: 'image/jpeg' }));
    expect((await PATCH(new Request('https://example.com/api/admin/products/product-test', { method: 'PATCH', body: form }), context)).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith({ images: [second, expect.objectContaining({ asset: { _type: 'reference', _ref: 'image-new-upload' } })] });
  });
  it('reads admin data from the origin without browser/CDN caches', async () => {
    mocks.fetch.mockResolvedValue({ _id: 'product-test', _rev: 'current', imageEntries: [] });
    const response = await GET(new Request('https://example.com/api/admin/products/product-test'), context);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(mocks.fetch.mock.calls[0][2]).toEqual({ cache: 'no-store' });
    expect(mocks.fetch.mock.calls[0][0]).toContain('"imageEntries"');
  });
  it('blocks old editor tabs with no revision from restoring pre-campaign prices or images', async () => {
    const form = new FormData(); form.set('price', '6999'); form.set('keptImageRefs', '[]');
    expect((await PATCH(new Request('https://example.com/api/admin/products/product-test', { method: 'PATCH', body: form }), context)).status).toBe(409);
    expect(mocks.commit).not.toHaveBeenCalled();
  });
  it('saves corrected spelling in the CMS fields', async () => {
    expect((await PATCH(request({ name: 'Amethist Ring', mainStoneType: 'Blue shaphire', allStones: ['Kynite', 'Cristal'] }), context)).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith({ name: 'Amethyst Ring', mainStoneType: 'Blue sapphire', allStones: ['Kyanite', 'Crystal'] });
  });
  it('zeroes an unavailable product without changing price or images', async () => {
    expect((await PATCH(request({ inStock: false, stockQuantity: 3 }), context)).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith({ inStock: false, stockQuantity: 0 });
  });
  it('accepts zero stock and rejects invalid stock instead of silently ignoring it', async () => {
    expect((await PATCH(request({ stockQuantity: 0 }), context)).status).toBe(200);
    expect(mocks.set).toHaveBeenCalledWith({ stockQuantity: 0, inStock: false });
    expect((await PATCH(request({ stockQuantity: '' }), context)).status).toBe(400);
    expect((await PATCH(request({ stockQuantity: -1 }), context)).status).toBe(400);
    expect((await PATCH(request({ stockQuantity: 1.5 }), context)).status).toBe(400);
  });
});
