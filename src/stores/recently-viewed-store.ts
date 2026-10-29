import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { recordViewedProduct, sanitizeViewedProducts, type ViewedProduct } from '@/lib/recently-viewed';

interface RecentlyViewedState {
  entries: ViewedProduct[];
  record: (id: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(persist((set) => ({
  entries: [],
  record: id => set(state => ({ entries: recordViewedProduct(state.entries, id) })),
  clear: () => set({ entries: [] }),
}), {
  name: 'surya-recently-viewed', version: 1,
  storage: createJSONStorage(() => ({
    getItem: key => { try { return typeof window === 'undefined' ? null : localStorage.getItem(key); } catch { return null; } },
    setItem: (key, value) => { try { localStorage.setItem(key, value); } catch { /* Keep the in-memory history when storage is unavailable. */ } },
    removeItem: key => { try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ } },
  })),
  partialize: state => ({ entries: state.entries }),
  merge: (saved, state) => ({ ...state, entries: sanitizeViewedProducts(
    saved && typeof saved === 'object' && 'entries' in saved ? saved.entries : undefined,
  ) }),
}));
