import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ revalidate: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
import { POST } from './route';
beforeEach(() => vi.clearAllMocks());
describe('admin catalogue refresh', () => {
  it('invalidates storefront pages and catalogue caches without changing any documents', async () => {
    const response = await POST(new Request('https://example.com/api/admin/revalidate-products', { method: 'POST' }));
    expect(response.status).toBe(200);
    expect(mocks.revalidate.mock.calls).toEqual([['/', 'layout'], ['/api/catalog']]);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  });
  it('rejects cross-origin browser requests', async () => {
    expect((await POST(new Request('https://example.com/api/admin/revalidate-products', {
      method: 'POST', headers: { origin: 'https://other.example' },
    }))).status).toBe(403);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
