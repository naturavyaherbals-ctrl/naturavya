"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check } from "lucide-react"
import { useCart } from "@/lib/cart/cart-context" // Make sure this path exists!
import { toast } from "sonner" // Assuming you have sonner/toast installed

interface AddToCartProps {
  product: {
    id: string
    title: string
    price: number
    image?: string
  }
}

export function AddToCartButton({ product }: AddToCartProps) {
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.image,
      quantity: 1
    })
    
    setIsAdded(true)
    toast.success("Added to cart!")
    
    // Reset button after 2 seconds
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button 
      size="lg" 
      className={`w-full transition-all duration-300 ${isAdded ? 'bg-green-600 hover:bg-green-700' : ''}`}
      onClick={handleAdd}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" /> Added
        </>
      ) : (
        <>
          <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
        </>
      )}
    </Button>
  )
}