import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { shoppingStage } from '@/lib/shopping-analytics';
import { cartLineKey } from '@/lib/ring-size';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
  silverWeight?: number;
  mainStoneType?: string;
  stockQuantity?: number;
  ringSize?: number;
  category?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const previous = get().getItemCount();
        set((state) => {
          const max = item.stockQuantity ?? 1;
          const key = cartLineKey(item);
          const existingItem = state.items.find((i) => cartLineKey(i) === key);
          const unsized = item.ringSize !== undefined ? state.items.find(i => i._id === item._id && i.ringSize === undefined) : undefined;
          if (unsized) {
            const nextItems = state.items.filter(i => i !== unsized);
            return { items: existingItem
              ? nextItems.map(i => cartLineKey(i) === key ? { ...i, quantity: i.quantity + unsized.quantity } : i)
              : [...nextItems, { ...item, quantity: Math.min(unsized.quantity, max) }], isOpen: true };
          }
          const totalQuantity = state.items.filter(i => i._id === item._id).reduce((sum, i) => sum + i.quantity, 0);
          if (totalQuantity >= max) return { isOpen: true };
          if (existingItem) {
            if (existingItem.quantity >= max) return { isOpen: true };
            return {
              items: state.items.map((i) =>
                cartLineKey(i) === key
                  ? { ...i, quantity: Math.min(i.quantity + 1, max) }
                  : i
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: 1 }],
            isOpen: true,
          };
        });
        if (get().getItemCount() > previous) shoppingStage('add_to_bag');
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => cartLineKey(i) !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => cartLineKey(i) !== id)
              : state.items.map((i) => {
                  if (cartLineKey(i) !== id) return i;
                  const otherSizes = state.items.filter(other => other._id === i._id && cartLineKey(other) !== id)
                    .reduce((sum, other) => sum + other.quantity, 0);
                  const max = Math.max(0, (i.stockQuantity ?? 1) - otherSizes);
                  return { ...i, quantity: Math.min(quantity, max) };
                }),
        })),

      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'surya-jewellers-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
