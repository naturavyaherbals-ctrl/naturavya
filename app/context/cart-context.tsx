"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type CartItem = {
  id: string
  title: string
  price: number
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (productId: string) => void // <--- NEW
  deleteItem: (productId: string) => void     // <--- NEW
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart))
        } catch (e) {
          console.error("Failed to parse cart", e)
        }
      }
    }
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items])

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { 
        id: product.id, 
        title: product.title, 
        price: product.price, 
        image: product.image, 
        quantity: 1 
      }]
    })
  }

  // 👇 NEW: Decrease quantity by 1
  const removeFromCart = (productId: string) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          // If quantity is 1, keep it at 1 (or remove it if you prefer)
          return { ...item, quantity: Math.max(1, item.quantity - 1) }
        }
        return item
      })
    })
  }

  // 👇 NEW: Remove item completely
  const deleteItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, deleteItem, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within a CartProvider")
  return context
}