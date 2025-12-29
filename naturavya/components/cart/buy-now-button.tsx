"use client"

import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart/cart-context"

interface Product {
  id: number
  name: string
  price: number
  slug: string
  images: string[]
}

export default function BuyNowButton({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCart, clearCart } = useCart()

  const handleBuyNow = () => {
    clearCart()
    addToCart({
      id: String(product.id),
      name: product.name,
      slug: product.slug,
      price: product.price,
      quantity: 1,
      image: product.images?.[0],
    })

    router.push("/checkout")
  }

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleBuyNow}
      className="flex-1 rounded-full border-2 border-primary text-primary hover:bg-primary/5"
    >
      <ShoppingBag className="w-5 h-5 mr-2" />
      Buy Now
    </Button>
  )
}
