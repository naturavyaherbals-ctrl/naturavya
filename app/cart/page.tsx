"use client"

// 1. FIX THE IMPORT PATH (Match layout.tsx exactly)
import { useCart } from "@/lib/cart/cart-context" 
import { Button } from "@/components/ui/button"
import { Trash, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  // 2. USE THE CORRECT NAMES FROM YOUR CONTEXT
  // (Your context calls it 'removeFromCart', not 'removeItem')
  const { items, removeFromCart } = useCart()

  // 3. CALCULATE TOTAL MANUALLY
  // (Your context doesn't provide 'total', so we calculate it here)
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
        {/* Update this link if your categories page is named differently */}
        <Link href="/">
          <Button size="lg" className="rounded-full">Start Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border rounded-xl bg-card">
              <div className="h-24 w-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                {/* Standard HTML img tag to avoid Next.js Image config issues */}
                {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-primary font-bold">₹{item.price}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-sm border rounded-full px-3 py-1">
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:text-destructive/80"
                    // 4. USE THE CORRECT FUNCTION NAME
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Summary */}
        <div className="h-fit p-6 border rounded-xl bg-muted/20">
          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          </div>
          <div className="border-t pt-4 mb-6 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          
          <Button className="w-full size-lg text-lg rounded-full">
            Checkout <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}