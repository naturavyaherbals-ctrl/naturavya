'use client';

// =====================================================
// ADD TO CART BUTTON - REUSABLE COMPONENT
// =====================================================

import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  className?: string;
  showQuantity?: boolean;
}

export default function AddToCartButton({
  product,
  variant,
  className = '',
  showQuantity = false,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, isInCart, getItem, updateQuantity, toggleCart } = useCart();

  const productId = product.id;
  const variantId = variant?.id;
  const inCart = isInCart(productId, variantId);
  const cartItem = getItem(productId, variantId);

  const handleAddToCart = () => {
    addItem({
      product_id: productId,
      variant_id: variantId,
      sku: variant?.sku || product.sku,
      name: product.name,
      variant_name: variant?.name,
      price: variant?.price || product.price,
      quantity: quantity,
      image_url: variant?.image_url || product.thumbnail_url || product.images?.[0]?.url,
      max_quantity: product.inventory?.quantity,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (inCart) {
      updateQuantity(productId, newQuantity, variantId);
    } else {
      setQuantity(newQuantity);
    }
  };

  if (inCart) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => handleQuantityChange((cartItem?.quantity || 1) - 1)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-medium">{cartItem?.quantity}</span>
          <button
            onClick={() => handleQuantityChange((cartItem?.quantity || 1) + 1)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => toggleCart(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Check className="w-4 h-4" />
          View Cart
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showQuantity && (
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
      <button
        onClick={handleAddToCart}
        disabled={isAdded}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
          isAdded
            ? 'bg-green-600 text-white'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5" />
            Added!
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
