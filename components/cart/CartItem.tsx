'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItemData } from '@/lib/store/cartStore';
import { useCart } from '@/lib/hooks/useCart';
import { formatCurrency } from '@/lib/utils/formatters';

interface CartItemProps {
  item: CartItemData;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, variant, quantity, price } = item;

  const imageUrl = product.images?.find((img) => img.is_primary)?.url ||
    product.images?.[0]?.url ||
    '/placeholder-product.jpg';

  const itemTotal = price * quantity;

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
      >
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2"
        >
          {product.name}
        </Link>

        {variant && (
          <p className="text-xs text-gray-500 mt-0.5">{variant.name}</p>
        )}

        <p className="text-sm font-medium text-gray-900 mt-1">
          {formatCurrency(price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => updateQuantity(item.id, quantity - 1)}
              className="p-1.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, quantity + 1)}
              className="p-1.5 text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item total */}
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(itemTotal)}
        </p>
      </div>
    </div>
  );
}
