import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => { vi.resetModules(); vi.stubGlobal('window', {}); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('recently viewed persistence', () => {
  it('continues working in memory when browser storage is blocked', async () => {
    vi.stubGlobal('localStorage', { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Blocked'); } });
    const { useRecentlyViewedStore: store } = await import('./recently-viewed-store');
    store.getState().record('product-test'); expect(store.getState().entries[0].id).toBe('product-test');
    store.getState().clear(); expect(store.getState().entries).toEqual([]);
  });
  it('rehydrates only safe product references and clears all persisted history', async () => {
    let saved = JSON.stringify({ version: 1, state: { entries: [{ id: 'product-test', viewedAt: Date.now(), price: 19, email: 'private@example.com' }] } });
    vi.stubGlobal('localStorage', { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } });
    const { useRecentlyViewedStore: store } = await import('./recently-viewed-store');
    expect(store.getState().entries.map(item => item.id)).toEqual(['product-test']);
    expect(store.getState().entries[0]).not.toHaveProperty('price');
    store.getState().record('product-second'); expect(saved).not.toMatch(/private@example|price/);
    store.getState().clear(); expect(JSON.parse(saved).state.entries).toEqual([]);
  });
  it('recovers from malformed stored JSON on the next visit', async () => {
    let saved = '{bad-json';
    vi.stubGlobal('localStorage', { getItem: () => saved, setItem: (_key: string, value: string) => { saved = value; } });
    const { useRecentlyViewedStore: store } = await import('./recently-viewed-store');
    store.getState().record('product-safe');
    expect(JSON.parse(saved).state.entries[0].id).toBe('product-safe');
  });
});
