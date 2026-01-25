'use client';

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { cn } from '@/lib/utils/helpers';

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className }: CartButtonProps) {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className={cn(
        'relative p-2 text-gray-700 hover:text-green-600 transition-colors',
        className
      )}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}
