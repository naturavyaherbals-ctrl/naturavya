"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    id: 1,
    name: "Ashwagandha Oil",
    price: "₹699",
    image: "/products/ashwagandha-oil.jpg",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Shilajit Capsules",
    price: "₹899",
    image: "/products/shilajit.jpg",
    tag: "Trending",
  },
  {
    id: 3,
    name: "Herbal Vitality Combo",
    price: "₹1,299",
    image: "/products/vitality-combo.jpg",
    tag: "Combo",
  },
  {
    id: 4,
    name: "Men’s Wellness Oil",
    price: "₹749",
    image: "/products/mens-wellness.jpg",
    tag: "New",
  },
]

export default function FeaturedProducts() {
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
                <div className="relative overflow-hidden rounded-xl">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <Badge className="absolute top-3 left-3">
                    {product.tag}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-lg">
                    {product.name}
                  </h3>
                  <p className="text-primary font-semibold">
                    {product.price}
                  </p>
                </div>

                <Button className="w-full mt-4" asChild>
                  <Link href={`/products/${product.id}`}>
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
