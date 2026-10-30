import { create } from 'zustand';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (skuId: number) => void;
  updateQuantity: (skuId: number, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalQuantity: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  const savedCart = localStorage.getItem('cart');
  let initialItems: CartItem[] = [];
  try {
    if (savedCart) initialItems = JSON.parse(savedCart);
  } catch (e) {
    // ignore
  }

  const persist = (items: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(items));
  };

  return {
    items: initialItems,
    isDrawerOpen: false,

    addItem: (newItem: CartItem) => {
      const items = get().items;
      const existing = items.find((i) => i.skuId === newItem.skuId);
      let updated: CartItem[];

      if (existing) {
        const nextQty = Math.min(existing.quantity + newItem.quantity, existing.availableStock);
        updated = items.map((i) => (i.skuId === newItem.skuId ? { ...i, quantity: nextQty } : i));
      } else {
        updated = [...items, newItem];
      }

      set({ items: updated, isDrawerOpen: true });
      persist(updated);
    },

    removeItem: (skuId: number) => {
      const updated = get().items.filter((i) => i.skuId !== skuId);
      set({ items: updated });
      persist(updated);
    },

    updateQuantity: (skuId: number, quantity: number) => {
      if (quantity <= 0) {
        get().removeItem(skuId);
        return;
      }
      const updated = get().items.map((i) =>
        i.skuId === skuId ? { ...i, quantity: Math.min(quantity, i.availableStock) } : i
      );
      set({ items: updated });
      persist(updated);
    },

    clearCart: () => {
      set({ items: [] });
      persist([]);
    },

    openDrawer: () => set({ isDrawerOpen: true }),
    closeDrawer: () => set({ isDrawerOpen: false }),

    totalQuantity: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

    totalAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  };
});
