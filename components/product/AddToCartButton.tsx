'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { Product, ProductVariant } from '@/types/database';
import { cn } from '@/lib/utils/helpers';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  fullWidth?: boolean;
}

export function AddToCartButton({
  product,
  variant,
  quantity = 1,
  className,
  size = 'md',
  showIcon = true,
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = isInCart(product.id, variant?.id);

  const handleClick = async () => {
    setIsAdding(true);
    
    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    addToCart(product, variant, quantity);
    setIsAdding(false);
    setJustAdded(true);

    // Reset "just added" state after 2 seconds
    setTimeout(() => setJustAdded(false), 2000);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={handleClick}
      disabled={isAdding || !product.is_active}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200',
        'bg-green-600 text-white hover:bg-green-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
        sizeClasses[size],
        fullWidth && 'w-full',
        justAdded && 'bg-green-700',
        className
      )}
    >
      {isAdding ? (
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
      ) : justAdded ? (
        <>
          {showIcon && <Check className={iconSizes[size]} />}
          <span>Added!</span>
        </>
      ) : (
        <>
          {showIcon && <ShoppingCart className={iconSizes[size]} />}
          <span>{inCart ? 'Add More' : 'Add to Cart'}</span>
        </>
      )}
    </button>
  );
}