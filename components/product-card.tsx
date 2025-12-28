"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Heart, Star, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/products-data"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <Card
      className="group border-0 bg-card shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className={cn("w-full h-full object-cover transition-all duration-700", isHovered && "scale-110")}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badge && <Badge className="bg-accent text-accent-foreground">{product.badge}</Badge>}
          {discount > 0 && (
            <Badge variant="destructive" className="bg-red-500">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setIsWishlisted(!isWishlisted)
          }}
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          )}
        >
          <Heart
            className={cn("w-5 h-5 transition-colors", isWishlisted ? "fill-red-500 text-red-500" : "text-foreground")}
          />
        </button>

        {/* Quick Actions */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
        >
          <Button size="sm" className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full" asChild>
            <Link href={`/products/${product.slug}`}>
              <Eye className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Stock Indicator */}
        {product.stock < 20 && (
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded text-xs text-white">
            Only {product.stock} left
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category}</div>
          <h3 className="font-medium text-card-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-primary">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
