import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, type NextResponse } from 'next/server';

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: unknown) => handler,
  createRouteMatcher: () => () => false,
}));
import proxy from './proxy';

const handle = proxy as unknown as (
  auth: { protect: ReturnType<typeof vi.fn> }, request: NextRequest,
) => Promise<NextResponse>;

function request(path: string, credential?: string, method = 'GET') {
  return new NextRequest(`https://www.suryajewellers.com${path}`, {
    method, headers: credential ? { Authorization: `Basic ${btoa(credential)}` } : {},
  });
}

describe('admin browser authentication', () => {
  beforeEach(() => {
    vi.stubEnv('ADMIN_USERNAME', 'test-admin');
    vi.stubEnv('ADMIN_PASSWORD', 'test-only-password');
    vi.stubEnv('COMMERCE_REVIEW_MODE', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it.each(['/admin/product-quality', '/api/admin/products', '/studio'])('challenges unauthenticated %s without caching it', async path => {
    const response = await handle({ protect: vi.fn() }, request(path));
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toBe('Basic realm="Secure Admin Area"');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    if (path.startsWith('/api/')) expect(await response.json()).toEqual({ error: 'Authentication required' });
  });

  it.each(['/admin/product-quality', '/api/admin/products'])('allows valid credentials on %s', async path => {
    const response = await handle({ protect: vi.fn() }, request(path, 'test-admin:test-only-password'));
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it('rejects incorrect API credentials and preserves the browser challenge', async () => {
    const response = await handle({ protect: vi.fn() }, request('/api/admin/products', 'test-admin:wrong'));
    expect(response.status).toBe(401);
    expect(response.headers.has('www-authenticate')).toBe(true);
    expect(await response.json()).toEqual({ error: 'Invalid credentials' });
  });

  it('keeps local review mutations blocked even with valid credentials', async () => {
    vi.stubEnv('COMMERCE_REVIEW_MODE', '1');
    const response = await handle({ protect: vi.fn() }, request('/api/admin/products', 'test-admin:test-only-password', 'POST'));
    expect(response.status).toBe(403);
  });
});
