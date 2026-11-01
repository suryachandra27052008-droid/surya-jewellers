import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/shopping-analytics', () => ({ shoppingStage: vi.fn() }));
vi.mock('zustand/middleware', () => ({ persist: (config: unknown) => config, createJSONStorage: vi.fn() }));
import { useCartStore } from './cart-store';
import { cartLineKey, orderRingSizeLabel } from '@/lib/ring-size';

const ring = { _id: 'ring-one', name: 'Emerald Ring', price: 10000, image: '', slug: 'ring-one', category: 'Rings', stockQuantity: 3 };
beforeEach(() => useCartStore.setState({ items: [], isOpen: false }));

describe('ring size cart lines', () => {
  it('keeps sizes separate through quantity edits and removal', () => {
    const cart = useCartStore.getState();
    cart.addItem({ ...ring, ringSize: 12 });
    cart.addItem({ ...ring, ringSize: 14 });
    cart.updateQuantity(cartLineKey({ ...ring, ringSize: 12 }), 2);
    expect(useCartStore.getState().items.map(item => [item.ringSize, item.quantity])).toEqual([[12, 2], [14, 1]]);
    cart.addItem({ ...ring, ringSize: 16 });
    expect(useCartStore.getState().getItemCount()).toBe(3);
    cart.updateQuantity(cartLineKey({ ...ring, ringSize: 14 }), 10);
    expect(useCartStore.getState().getItemCount()).toBe(3);
    cart.removeItem(cartLineKey({ ...ring, ringSize: 12 }));
    expect(useCartStore.getState().items).toMatchObject([{ ringSize: 14, quantity: 1 }]);
  });
  it('lets an old unsized cart line acquire a selected size without adding stock', () => {
    const cart = useCartStore.getState();
    cart.addItem({ ...ring, stockQuantity: 1 });
    cart.addItem({ ...ring, stockQuantity: 1, ringSize: 12 });
    expect(useCartStore.getState().items).toMatchObject([{ ringSize: 12, quantity: 1 }]);
  });
  it('does not guess sizes for historical ring orders', () => {
    expect(orderRingSizeLabel({ name: 'Emerald Ring' })).toContain('not recorded');
    expect(orderRingSizeLabel({ name: 'Ruby Stud' })).toBe('');
    expect(orderRingSizeLabel({ ringSize: 12 })).toBe('Ring size (India): 12');
  });
  it('refreshes a saved bag without restoring products removed during the request', async () => {
    const fetcher = vi.fn().mockImplementation(async () => Response.json({ products: [{ ...ring, price: 14000 }] }));
    vi.stubGlobal('fetch', fetcher);
    try {
      useCartStore.setState({ items: [{ ...ring, quantity: 1, ringSize: 12 }] });
      await useCartStore.getState().syncPrices();
      expect(useCartStore.getState().items).toMatchObject([{ price: 14000, quantity: 1, ringSize: 12 }]);
      const pending = useCartStore.getState().syncPrices();
      useCartStore.getState().clearCart();
      await pending;
      expect(useCartStore.getState().items).toEqual([]);
    } finally { vi.unstubAllGlobals(); }
  });
});
