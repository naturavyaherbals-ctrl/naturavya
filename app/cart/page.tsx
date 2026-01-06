"use client"

import Link from "next/link"
import { Trash2, ArrowRight, Minus, Plus } from "lucide-react"
import { useCart } from "@/app/context/cart-context" 
import { Button } from "@/components/ui/button"

export default function CartPage() {
  // 1. Get the new functions from context
  const { items, addToCart, removeFromCart, deleteItem, cartCount } = useCart()

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <Button asChild>
          <Link href="/categories">
            Start Shopping <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-10">Shopping Cart ({cartCount})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="flex gap-6 p-4 border rounded-xl bg-card">
              {/* Image */}
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">Unit Price: ₹{item.price}</p>
                  </div>
                  <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 border rounded-lg px-2 py-1">
                    
                    {/* 👇 MINUS BUTTON NOW WORKS */}
                    <button 
                      className="p-1 hover:text-primary disabled:opacity-50"
                      onClick={() => removeFromCart(item.id)}
                      disabled={item.quantity <= 1} // Optional: Disable if 1
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                    
                    {/* PLUS BUTTON */}
                    <button 
                      className="p-1 hover:text-primary" 
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* 👇 DELETE BUTTON NOW WORKS */}
                  <button 
                    className="text-red-500 hover:text-red-600 transition-colors"
                    onClick={() => deleteItem(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-2xl border sticky top-24">
            <h3 className="font-bold text-xl mb-6">Order Summary</h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
            <Button size="lg" className="w-full font-bold">
             <Link href="/checkout">
              Proceed to Checkout
             </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}