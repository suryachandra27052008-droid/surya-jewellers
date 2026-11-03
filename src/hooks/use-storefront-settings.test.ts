import { afterEach, describe, expect, it, vi } from 'vitest';
const bridge = vi.hoisted(() => ({ subscribe: null as null | ((listener: () => void) => () => void) }));
vi.mock('react', () => ({ useSyncExternalStore: (subscribe: typeof bridge.subscribe, get: () => unknown) => {
  bridge.subscribe = subscribe; return get();
} }));
const settings = { shippingPromotionEnabled: true, shippingPromotionStartDate: '2026-11-03',
  shippingPromotionEndDate: '2026-11-15', shippingPromotionMinOrder: 15000 };
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetModules(); });
describe('shared campaign settings lifecycle', () => {
  it('deduplicates requests and removes an offer at the exact IST expiry in an open tab', async () => {
    vi.resetModules(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-15T18:29:59.000Z'));
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const fetch = vi.fn(async () => Response.json(settings)); vi.stubGlobal('fetch', fetch);
    const store = await import('./use-storefront-settings');
    expect(store.useStorefrontSettings().promotion).toBeNull();
    const unsubscribe = bridge.subscribe!(vi.fn());
    await store.refreshStorefrontSettings();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(store.useStorefrontSettings().promotion).not.toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.useStorefrontSettings().promotion).toBeNull();
    unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not show an enabled promotion when the first settings request fails', async () => {
    vi.resetModules(); vi.useFakeTimers();
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    const store = await import('./use-storefront-settings'); store.useStorefrontSettings();
    const unsubscribe = bridge.subscribe!(vi.fn());
    await store.refreshStorefrontSettings();
    expect(store.useStorefrontSettings().promotion).toBeNull(); unsubscribe();
  });
});
