export const dynamic = "force-dynamic"

import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import { getAllProducts } from "@/lib/products"
import ProductsClient from "./products-client"

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <main>
      <Navbar />
      <ProductsClient products={products} />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
