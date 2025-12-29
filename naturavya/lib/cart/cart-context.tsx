"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const CART_KEY = "naturavya_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {
      setItems([])
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)

      if (existing) {
        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        )
      }

      return [...prev, item]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside CartProvider")
  }
  return context
}
