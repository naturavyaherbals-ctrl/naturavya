'use client';

import { useCallback } from 'react';
import { useCartStore, CartItemData } from '@/lib/store/cartStore';
import { Product, ProductVariant } from '@/types/database';
import { formatCurrency } from '@/lib/utils/formatters';

export function useCart() {
  const {
    items,
    isOpen,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    getItemCount,
    getSubtotal,
    getItem,
  } = useCartStore();

  const handleAddToCart = useCallback(
    (product: Product, variant?: ProductVariant, quantity = 1) => {
      addItem(product, variant, quantity);
      openCart();
    },
    [addItem, openCart]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      removeItem(itemId);
    },
    [removeItem]
  );

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      updateQuantity(itemId, quantity);
    },
    [updateQuantity]
  );

  const handleClearCart = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const isInCart = useCallback(
    (productId: string, variantId?: string): boolean => {
      return !!getItem(productId, variantId);
    },
    [getItem]
  );

  const getCartItemQuantity = useCallback(
    (productId: string, variantId?: string): number => {
      const item = getItem(productId, variantId);
      return item?.quantity || 0;
    },
    [getItem]
  );

  // Calculate totals
  const subtotal = getSubtotal();
  const itemCount = getItemCount();
  const shipping = subtotal >= 499 ? 0 : 50;
  const tax = subtotal * 0.18; // 18% GST
  const total = subtotal + shipping + tax;

  return {
    // State
    items,
    isOpen,
    isLoading,
    itemCount,
    subtotal,
    shipping,
    tax,
    total,
    
    // Formatted values
    formattedSubtotal: formatCurrency(subtotal),
    formattedShipping: shipping === 0 ? 'FREE' : formatCurrency(shipping),
    formattedTax: formatCurrency(tax),
    formattedTotal: formatCurrency(total),
    
    // Actions
    addToCart: handleAddToCart,
    removeItem: handleRemoveItem,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    toggleCart,
    openCart,
    closeCart,
    
    // Helpers
    isInCart,
    getCartItemQuantity,
    getItem,
    
    // Checkout ready
    canCheckout: items.length > 0,
    freeShippingThreshold: 499,
    amountForFreeShipping: Math.max(0, 499 - subtotal),
  };
}