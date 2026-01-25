'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CartDrawer } from './CartDrawer';

interface CartContextType extends ReturnType<typeof useCart> {}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CartContext.Provider value={cart}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
