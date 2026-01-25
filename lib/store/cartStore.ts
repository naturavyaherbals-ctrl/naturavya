import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, ProductVariant } from '@/types/database';

export interface CartItemData {
  id: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItemData[];
  isOpen: boolean;
  isLoading: boolean;
  
  // Actions
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Computed
  getItemCount: () => number;
  getSubtotal: () => number;
  getItem: (productId: string, variantId?: string) => CartItemData | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const existingItemIndex = items.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.variant?.id === variant?.id
        );

        const price = variant?.price ?? product.price;
        const itemId = variant ? `${product.id}-${variant.id}` : product.id;

        if (existingItemIndex > -1) {
          // Update existing item
          const newItems = [...items];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };
          set({ items: newItems });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                id: itemId,
                product,
                variant,
                quantity,
                price,
              },
            ],
          });
        }
      },

      removeItem: (itemId) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getItem: (productId, variantId) => {
        return get().items.find(
          (item) =>
            item.product.id === productId &&
            item.variant?.id === variantId
        );
      },
    }),
    {
      name: 'naturavya-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);