"use client";

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import AddToCartButton from "@/components/add-to-cart"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getProductBySlug } from "@/lib/products"

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <main>
      <Navbar />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Product Image */}
          <img
            src={product.images[0]}
            alt={product.name}
            className="rounded-2xl shadow-2xl"
          />

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold mb-4">
              {product.name}
            </h1>

            <p className="text-muted-foreground mb-6">
              {product.description}
            </p>

            <div className="text-3xl font-bold text-primary mb-6">
              ₹{product.price}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <AddToCartButton product={product} />
              <Link href="/cart" className="flex-1">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full"
                >
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
