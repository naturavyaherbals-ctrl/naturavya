"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/cart-context"

type Props = {
  product: {
    id: string
    name: string
    price: number
    images: string[]
  }
}

export default function AddToCartButton({ product }: Props) {
  const { addToCart } = useCart()

  return (
    <Button
      size="lg"
      className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={() =>
        addToCart({
          id: product.id,
          name: product.name,
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
