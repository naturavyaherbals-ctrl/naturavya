"use client"

import { useCart } from "@/lib/cart/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"

export function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart()

  return (
    <Button
      size="lg"
      className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={() =>
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          quantity: 1,
          slug: product.slug,
        })
      }
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      Add to Cart
    </Button>
  )
}

