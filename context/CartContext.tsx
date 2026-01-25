'use client';

// =====================================================
// CART CONTEXT - PERSISTENT SHOPPING CART
// =====================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { CartItem, Cart } from '@/types';

// =====================================================
// TYPES
// =====================================================

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode: string | null;
  isLoading: boolean;
  isOpen: boolean;
}

type CartAction =
  | { type: 'SET_CART'; payload: Partial<CartState> }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; variantId?: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_COUPON' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'CALCULATE_TOTALS' };

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  toggleCart: (open?: boolean) => void;
  getItemCount: () => number;
  isInCart: (productId: string, variantId?: string) => boolean;
  getItem: (productId: string, variantId?: string) => CartItem | undefined;
}

// =====================================================
// CONSTANTS
// =====================================================

const CART_STORAGE_KEY = 'naturavya_cart';
const FREE_SHIPPING_THRESHOLD = 499;
const DEFAULT_SHIPPING = 50;
const GST_RATE = 0.18;

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: CartState = {
  items: [],
  subtotal: 0,
  discount: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  couponCode: null,
  isLoading: true,
  isOpen: false,
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateTotals(items: CartItem[], discount: number = 0): Omit<CartState, 'items' | 'couponCode' | 'isLoading' | 'isOpen'> {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING;
  const taxableAmount = subtotal - discount;
  const tax = Math.round(taxableAmount * GST_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + shipping) * 100) / 100;

  return { subtotal, discount, shipping, tax, total };
}

function getItemKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}-${variantId}` : productId;
}

// =====================================================
// REDUCER
// =====================================================

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART': {
      return { ...state, ...action.payload };
    }

    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id && 
                item.variant_id === action.payload.variant_id
      );

      let newItems: CartItem[];
      
      if (existingIndex > -1) {
        newItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            const newQuantity = item.quantity + action.payload.quantity;
            return {
              ...item,
              quantity: item.max_quantity ? Math.min(newQuantity, item.max_quantity) : newQuantity,
            };
          }
          return item;
        });
      } else {
        newItems = [...state.items, action.payload];
      }

      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const newItems = state.items.filter(
          item => !(item.product_id === action.payload.productId && 
                   item.variant_id === action.payload.variantId)
        );
        const totals = calculateTotals(newItems, state.discount);
        return { ...state, items: newItems, ...totals };
      }

      const newItems = state.items.map(item => {
        if (item.product_id === action.payload.productId && 
            item.variant_id === action.payload.variantId) {
          return {
            ...item,
            quantity: item.max_quantity 
              ? Math.min(action.payload.quantity, item.max_quantity) 
              : action.payload.quantity,
          };
        }
        return item;
      });

      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        item => !(item.product_id === action.payload.productId && 
                 item.variant_id === action.payload.variantId)
      );
      const totals = calculateTotals(newItems, state.discount);
      return { ...state, items: newItems, ...totals };
    }

    case 'CLEAR_CART': {
      return { ...initialState, isLoading: false };
    }

    case 'APPLY_COUPON': {
      const totals = calculateTotals(state.items, action.payload.discount);
      return { 
        ...state, 
        couponCode: action.payload.code, 
        discount: action.payload.discount,
        ...totals 
      };
    }

    case 'REMOVE_COUPON': {
      const totals = calculateTotals(state.items, 0);
      return { ...state, couponCode: null, discount: 0, ...totals };
    }

    case 'SET_LOADING': {
      return { ...state, isLoading: action.payload };
    }

    case 'TOGGLE_CART': {
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    }

    case 'CALCULATE_TOTALS': {
      const totals = calculateTotals(state.items, state.discount);
      return { ...state, ...totals };
    }

    default:
      return state;
  }
}

// =====================================================
// CONTEXT
// =====================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: { ...parsed, isLoading: false } });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (!state.isLoading) {
      try {
        const cartData = {
          items: state.items,
          couponCode: state.couponCode,
          discount: state.discount,
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    }
  }, [state.items, state.couponCode, state.discount, state.isLoading]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, variantId?: string) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity, variantId } });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, variantId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const applyCoupon = useCallback(async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: state.subtotal }),
      });

      const data = await response.json();

      if (data.valid) {
        dispatch({ type: 'APPLY_COUPON', payload: { code, discount: data.discount } });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error applying coupon:', error);
      return false;
    }
  }, [state.subtotal]);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const toggleCart = useCallback((open?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', payload: open });
  }, []);

  const getItemCount = useCallback(() => {
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [state.items]);

  const isInCart = useCallback((productId: string, variantId?: string) => {
    return state.items.some(
      item => item.product_id === productId && item.variant_id === variantId
    );
  }, [state.items]);

  const getItem = useCallback((productId: string, variantId?: string) => {
    return state.items.find(
      item => item.product_id === productId && item.variant_id === variantId
    );
  }, [state.items]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value: CartContextType = {
    ...state,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    toggleCart,
    getItemCount,
    isInCart,
    getItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;