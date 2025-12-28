"use client"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import { products } from "@/lib/products-data"
import { ProductCard } from "@/components/product-card"
import { motion } from "framer-motion"
import { getProductBySlug } from "@/lib/data/products"

export default function ProductsPage() {
  return (
    <main>
      <Navbar />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-light">
            Our <span className="text-primary font-medium">Ayurvedic Solutions</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Targeted wellness solutions crafted with authentic Ayurvedic ingredients
            for men and women.
          </p>
        </div>
      </section>

      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
