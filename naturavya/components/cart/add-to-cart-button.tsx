"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/cart-context"

interface AddToCartButtonProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    images: string[]
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart()

  return (
    <Button
      size="lg"
      className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
      onClick={() =>
        addToCart({
          id: String(product.id),
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images[0],
          quantity: 1,
        })
      }
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      Add to Cart
    </Button>
  )
}
