"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/app/context/cart-context"

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart()

  return (
    <Button 
      size="lg" 
      className="flex-1 gap-2 bg-primary hover:bg-primary/90"
      onClick={() => addToCart(product)}
    >
      <ShoppingBag className="w-5 h-5" />
      Add to Cart
    </Button>
  )
}