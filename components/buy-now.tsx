"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/context/cart-context"

export default function BuyNowButton({ product }: { product: any }) {
  const { addToCart } = useCart()
  const router = useRouter()

  const handleBuyNow = () => {
    // 1. Add to cart
    addToCart(product)
    // 2. Redirect immediately to the cart page
    router.push("/cart")
  }

  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="border-primary text-primary hover:bg-primary/5"
      onClick={handleBuyNow}
    >
      Buy Now
    </Button>
  )
}
