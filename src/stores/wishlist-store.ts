import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category?: string;
  mainStoneType?: string;
  silverWeight?: number;
  stockQuantity?: number;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  getCount: () => number;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i._id === item._id)) return state;
          return { items: [item, ...state.items] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item._id !== id),
        })),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i._id === item._id);
          return {
            items: exists
              ? state.items.filter((i) => i._id !== item._id)
              : [item, ...state.items],
          };
        }),

      isWishlisted: (id) => get().items.some((item) => item._id === id),
      getCount: () => get().items.length,
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'surya-jewellers-wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
