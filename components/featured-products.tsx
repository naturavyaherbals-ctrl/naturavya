"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Define the shape of your product data
interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category?: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch real products from your API
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error('Failed to fetch')
        
        const data = await res.json()
        
        // Take the first 4 products only
        setProducts(data.slice(0, 4))
      } catch (error) {
        console.error("Error loading featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-background text-center">
        <p>Loading best sellers...</p>
      </section>
    )
  }

  if (products.length === 0) {
    return null // Don't show the section if no products exist yet
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Products
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover our most loved Ayurvedic formulations crafted for holistic wellness.
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-4">
                <div className="relative overflow-hidden rounded-xl h-64 bg-muted">
                  {/* We use standard <img> tag here to avoid Next.js domain config errors with external images */}
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}

                  {product.category && (
                    <Badge className="absolute top-3 left-3 capitalize">
                      {product.category}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-lg truncate">
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold">
                    ₹{product.price}
                  </p>
                </div>

                <Button className="w-full mt-4" asChild>
                  {/* Link using the slug so it matches your other pages */}
                  <Link href={`/products/${product.slug}`}>
                    View Product
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
