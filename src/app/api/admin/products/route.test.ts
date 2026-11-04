import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ fetch: vi.fn(), create: vi.fn(), upload: vi.fn(), invalidate: vi.fn() }));
vi.mock('@/lib/server/catalog-cache', () => ({ invalidateProductCatalog: mocks.invalidate }));
vi.mock('@/lib/sanity/client', () => ({ writeClient: { fetch: mocks.fetch, create: mocks.create, assets: { upload: mocks.upload } } }));
import { POST } from './route';

function request(fields: Record<string, string> = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: 'Amethist Ring', sku: 'RNG-TEST', price: '8999',
    category: 'Rings', mainStoneType: 'Blue shaphire', stockQuantity: '2', inStock: 'true', ...fields })) form.set(key, value);
  form.append('images', new File(['offline image'], 'test.jpg', { type: 'image/jpeg' }));
  return new Request('https://example.com/api/admin/products', { method: 'POST', body: form });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.fetch.mockResolvedValue({ _id: 'category-rings' });
  mocks.upload.mockResolvedValue({ _id: 'image-test' });
  mocks.create.mockImplementation(async product => ({ _id: 'product-test', ...product }));
});
describe('new admin products', () => {
  it('corrects source spellings and zeroes unavailable stock without changing the submitted price', async () => {
    expect((await POST(request({ inStock: 'false' }))).status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Amethyst Ring', mainStoneType: 'Blue sapphire',
      price: 8999, stockQuantity: 0, inStock: false }));
    expect(mocks.invalidate).toHaveBeenCalledOnce();
  });
  it('accepts zero pieces and marks the new product unavailable', async () => {
    expect((await POST(request({ stockQuantity: '0' }))).status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ stockQuantity: 0, inStock: false }));
  });
  it.each(['-1', '0.5', 'invalid'])('rejects invalid stock before uploading images: %s', async stockQuantity => {
    expect((await POST(request({ stockQuantity }))).status).toBe(400);
    expect(mocks.upload).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
