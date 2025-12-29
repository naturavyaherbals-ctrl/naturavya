"use client";

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import { ProductCard } from "@/components/product-card"
import Link from "next/link"
import { getAllProducts } from "@/lib/products"

/* Category definitions */
const categories = [
  { title: "Men's Wellness", slug: "mens-wellness" },
  { title: "Women's Wellness", slug: "womens-wellness" },
  { title: "General Health", slug: "general-health" },
]

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  // ✅ FETCH PRODUCTS (THIS WAS MISSING)
  const products = await getAllProducts()

  // ✅ FILTER AFTER FETCH
  const filteredProducts = products.filter(
    (product) => product.category === category.slug
  )

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            {category.title}
          </h1>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore premium Ayurvedic formulations crafted for{" "}
            {category.title.toLowerCase()} — rooted in Indian tradition,
            refined for modern wellness.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No products found in this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/categories"
            className="text-primary underline underline-offset-4"
          >
            ← Back to all categories
          </Link>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  )
}
