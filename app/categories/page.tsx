import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"
import { CategoryCard } from "@/components/category-card"
import { getProductBySlug } from "@/lib/data/products"


const categories = [
  {
    title: "Men's Wellness",
    slug: "mens-wellness",
    image: "/products/mens-wellness.png",
  },
  {
    title: "Women's Wellness",
    slug: "womens-wellness",
    image: "/products/vitality-combo.png",
  },
  {
    title: "General Health",
    slug: "general-health",
    image: "/products/shilajit.png",
  },
]

export default function CategoriesPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold mb-12 text-center">
          Shop by Category
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
            />
          ))}
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  )
}