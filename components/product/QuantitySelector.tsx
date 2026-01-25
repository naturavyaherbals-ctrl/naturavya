'use client';

import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const sizeClasses = {
    sm: {
      button: 'p-1',
      icon: 'w-3 h-3',
      input: 'w-8 text-sm',
    },
    md: {
      button: 'p-2',
      icon: 'w-4 h-4',
      input: 'w-12 text-base',
    },
    lg: {
      button: 'p-3',
      icon: 'w-5 h-5',
      input: 'w-16 text-lg',
    },
  };

  return (
    <div
      className={cn(
        'inline-flex items-center border border-gray-300 rounded-lg',
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        className={cn(
          sizeClasses[size].button,
          'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-lg transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={sizeClasses[size].icon} />
      </button>

      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className={cn(
          sizeClasses[size].input,
          'text-center font-medium border-x border-gray-300 focus:outline-none focus:ring-0',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
        )}
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        className={cn(
          sizeClasses[size].button,
          'text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-lg transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Increase quantity"
      >
        <Plus className={sizeClasses[size].icon} />
      </button>
    </div>
  );
}
